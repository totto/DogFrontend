/* Search */
define(['config', 'filter', 'pagenav', 'doT'], function(conf, filter, pagenav, doT) {

	var initiated = false,
	firstrun = true,
	searchrequest;
	var dogTemplate = $('#tabletemplate').text();
	var dogRenderer = doT.template(dogTemplate);

	function prep(t) {
		currentPage = 1;
		conf.solr.data.start = 0;
		conf.filterTxt = $('#filter').val();
		if ( conf.filterTxt.replace(/\s+/g, '')==='') {
			conf.filterTxt = '*';
		}
		conf.solr.data.q = "{!q.op=AND}" + conf.filterTxt;
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


	function getSearchSummary() {
		var summary = "<dl><dt>Søketekst</dt>";
		var filtertext = document.getElementById('filter').value || "(ingen)";
		summary += "<dd>"+filtertext+"</dd>";
		$('#searchfacets').children().each( function( ) {
			var heading = '<dt>'+$(this).children('h2').first().html()+'</dt>';
			var content = "";
			$(this).find('input:checked').each( function() {
				content +=  '<dd>'+$(this).next().html()+'</dd>';
			});
			$(this).children('.datefacet').children('input').each( function() {
				var $e = $(this);
				if($e.val() != '') {
					content +=  '<dd>'+$e.data('type') + ': ' + $e.val()+'</dd>';
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
		var html = '';
		if(data.response.numFound > 0){
			var dogs = data.response.docs;
			var dogslength = dogs.length;
			for(var i=0;i<dogslength;i++) {
				try {
					var dog = dogs[i];
					dog.born = dog.born.substring(0,10);
					dog.details = jQuery.parseJSON( dog.json_detailed );
					dog.counter = i;
					html += dogRenderer(dog);
					// console.log(member);
				} catch(err) {

				}
			}
		} else {
			html = "Ingen hunder funnet" + getSearchSummary();
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
	}


	function downloadJson() {
		window.open(searchrequest.url);
	}

	$('#downloadJsonBtn').click( function() { downloadJson() } );

    // Document listeners
    $(document).on('doSearch', function() { run() });
    $(document).on('filterUpdate', function() { buildSearchSummary() });

	return {
		prep: prep,
		run: run
	}
});