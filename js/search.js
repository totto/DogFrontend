/* Search */
define(['config', 'filter', 'pagenav', 'doT', 'filter/facet'], function(conf, filter, pagenav, doT, facet) {

	var initiated = false,
	firstrun = true,
	searchrequest;
	var tableTemplate = $('#tabletemplate').text();
	var tableRenderer = doT.template(tableTemplate);

	function prep(t) {
		currentPage = 1;
		conf.solr.data.start = 0;
		conf.filterTxt = $('#filter').val();
		if ( conf.filterTxt.replace(/\s+/g, '')==='') {
			conf.filterTxt = '*';
		}
		conf.solr.data.q = "{!q.op=AND}" + conf.filterTxt + ' ' + conf.additionalParams;
		run();
	}

	function run() {
		if(typeof searchrequest !== 'undefined'){
			searchrequest.abort();
		}
		searchrequest = $.ajax(conf.solr).done(function( data ) {
			data = jQuery.parseJSON( data );
			conf.bufferedData = data;
			renderResults(data);
			if(firstrun) {
				filter.show(data.facet_counts.facet_fields);
				applyInitData();
				firstrun = false;
			}
			updateUrl();
			pagenav.generate(data.response.numFound);
		});
	}

	function updateUrl() {
		if( window.history.replaceState ) {
			var newurl = location.origin + location.pathname;

			var urlData = [];

			// Add search query
			filtervalue = document.getElementById('filter').value;
			if( filtervalue.length > 0 ){
				urlData.push("q="+filtervalue);
			}

			urlData = urlData.concat( filter.getUrlParams() );

			// Add page - TODO: Fix page rendering for initiating data
			if( currentPage > 1 ) {
				urlData.push("page="+currentPage);
			}

			newurl += "?" + urlData.join('&'); //+ urlData.join("&");
			window.history.replaceState({}, "title", newurl);
		} else {
			console.log('IE9 does not support history-manipulation through replaceState().');
		}
	}

	function buildSearchSummary() {
		var summary = getSearchSummary();
		$('#searchsummary').html( summary );
	}


	// Most of this should be moved to the individual filter modules
	function getSearchSummary() {
		var summary = "<dl><dt>Søketekst</dt>";
		var filtertext = document.getElementById('filter').value || "(ingen)";
		summary += "<dd>"+filtertext+"</dd>";
		$('#searchfacets').children().each( function( ) {
			var heading = '<dt>'+$(this).children('h2').first().html()+'</dt>';
			var content = "";
			$(this).find('#sourcepicker option:selected').each( function() {
				content +=  '<dd>'+$(this).text()+'</dd>';
			});
			$(this).find('input:checked').each( function() {
				content +=  '<dd>'+$(this).next().html()+'</dd>';
			});
			$(this).children('.datefacet').children('input').each( function() {
				var $e = $(this);
				if($e.val() != '') {
					content +=  '<dd>'+$e.data('type') + ': ' + $e.val()+'</dd>';
				}
			});
			$(this).children('.fieldsearch').each( function() {
				var $e = $(this);
				if($e.val() != '') {
					content +=  '<dd>'+$e.val()+'</dd>';
				}
			});
			if(content!='') {
				summary += heading + content;
			}
		});
		summary+="</dl>";
		summary+='<button class="clearBtn">Fjern alle filtere</button>';
		return summary;
	}

	function renderResults(data) {
		console.log('Rendering results from search...');
		var html = '';
		if(data.response.numFound > 0){
			var docs = data.response.docs;
			var docslength = docs.length;
			for(var i=0;i<docslength;i++) {
				try {
					var doc = docs[i];
					if(doc.born) {
						doc.born = doc.born.substring(0,10);	
					}
					doc.details = jQuery.parseJSON( doc.json_detailed );
					doc.counter = i;
					html += tableRenderer(doc);
				} catch(err) {
					console.log(err);
				}
			}
		} else {
			html = "Ingen funnet" + getSearchSummary();
		}
		$("#searchresults tbody").html(html);
	}

	function getUrlVars() {
		if(location.href.indexOf('?')>-1) {
			var vars = {}, hash;
			var hashes = location.href.slice(location.href.indexOf('?') + 1).split('&');
			for(var i = 0; i < hashes.length; i++) {
				hash = hashes[i].split('=');
				if( vars[hash[0]] ) {
					vars[hash[0]].push(hash[1]);
				} else {
					vars[hash[0]] = [hash[1]];
				}
			}
			return vars;
		}
		return false;
	}

	// Most of this should be moved to the individual filter modules
	function applyInitData() {
		var	initData = getUrlVars();
		if( initData ) {
			for( var key in initData ) {
				switch(key) {
					case 'q':
						document.getElementById('filter').value = decodeURI( initData[key][0] );
						run();
						break;
					case 'page':
						if( typeof initData[key][0] === "number" ) {
							pagenav.go( initData[key][0] );
						}
						break;
					case 'payment':
						for(i=0, l = initData[key].length; i<l; i++) {
							var p = decodeURI( initData[key][i] ).split('_');
							addPayment(p[0],p[1]);
						}
						break;
					case 'fqrange':
						var l = initData[key].length;
						for(k=l-1; k>=0; k--) {
							var fqrange = initData[key][k].split('_');
							$('#'+fqrange[0]).pickadate('picker').set( 'select', Date.parse(fqrange[1]) );
						}
						break;
					case 'fieldSearch':
						var l = initData[key].length;
						for(k=l-1; k>=0; k--) {
							var fieldSearch = initData[key][k].split('_');
							$('#'+fieldSearch[0]+'_q').val( decodeURI(fieldSearch[1]) ).trigger('change');
						}
						break;
					case 'source':
						$('#sourcepicker').val( initData[key][0] ).trigger('change');
						break;
					case 'breed':
						for(i=0, l = initData[key].length; i<l; i++) {
							if( typeof initData[key][i] !== 'undefined' ) {
								facet.addFacetBtn(key, decodeURI( initData[key][i] ), 'breed' );
							}
						}
					default:
					for(i=0, l = initData[key].length; i<l; i++) {
						if( typeof initData[key][i] !== 'undefined' ) {
							$( "#"+key+"_"+initData[key][i] ).click();
						}
					}
				}
			}
		}
		initiated = true;
		prep();
	}


	function downloadJson() {
		var tempRows = conf.solr.data.rows;
		var tempFl = conf.solr.data.fl;
		conf.solr.data.fl = 'json_detailed';
		conf.solr.data.rows = 1000000;
		conf.solr.beforeSend = function(jqXHR, settings) {
            jqXHR.url = settings.url;
        };
		jsonRequest = $.ajax(conf.solr);
		window.open(jsonRequest.url);
		conf.solr.data.fl = tempFl;
		conf.solr.data.rows = tempRows;
	}

	$('#downloadJsonBtn').click( function() { downloadJson() } );

    // Document listeners
    $(document).on('doSearch', function() { run() });
    $(document).on('prepSearch', function() { prep() });
    $(document).on('filterUpdate', function() { buildSearchSummary() });

	return {
		prep: prep,
		run: run
	}
});