( function () {

/* Label translation */

	var dict = {
		'false': 'Nei',
		'true': 'Ja',
		'breed': 'Hunderaser'
	}

	function getLabel(word) {
		if (dict[word.toLowerCase()]) {
			word = dict[word.toLowerCase()];
		} 
		return word;
	}

/* Tooltip for label */

	var tooltip = {
		'false': 'Nei',
		'true': 'Ja',
		'breed': 'Filtrerer etter alle personer som eier en hund av en gitt rase. Kan krysse av for flere, da finner man alle som eier minst 1 av de avkryssede rasene. Søkeboksen ovenfor avkrysningsboksene kan brukes til å finne en rase kjapt.'
	}

	function getTooltip(word) {
		var tip = "";
		if (tooltip[word.toLowerCase()]) {
			tip = 'data-tooltip="'+tooltip[word.toLowerCase()]+'"';
		} 
		return tip;
	}

/* Rendering */
	
	var facetTemplate = '<li><input type="checkbox" name="{{=it.facetname}}" value="{{=it.facet}}" class="{{=it.cls}}" id="{{=it.id}}" {{? it.checked }}checked{{?}}/><label for="{{=it.id}}">{{=it.label}}</label></li>',
	facetRenderer = doT.template(facetTemplate);

	function renderResults(data) {
		var html = '';
		if(data.response.numFound > 0){
			var dogs = data.response.docs;
			var dogslength = dogs.length;
			for(var i=0;i<dogslength;i++) {
				try {
					var dog = dogs[i];
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

	function buildSearchSummary() {
		var summary = getSearchSummary();
		$('#searchsummary').html( summary );
	}

	function getSearchSummary() {
		var summary = "<dl><dt>Søketekst</dt>";
		var filtertext = document.getElementById('filter').value || "(ingen)";
		summary += "<dd>"+filtertext+"</dd>";
		$('#searchfacets').children().each( function( ) {
			if( $(this).is('h2') ) {
				summary += '<dt>'+$(this).html()+'</dt>';
			}
			if( $(this).is('ul') ) {
				$(this).children().each( function() {
					if(  $(this).children().first().prop('checked') ) {
						summary +=  '<dd>'+$(this).children().last().html()+'</dd>';
					}
				});
			}
			if( $(this).is('#paymentList') ) {
				$(this).children().each( function() {
					summary +=  '<dd>'+$(this).html()+'</dd>';
				});
			}
		});
		summary+="</dl>";
		summary+='<button class="clearBtn">Fjern alle filtere</button>';
		return summary;
	}

/* Helper functions */

	function removeFromArray(array, item) {
		var i = array.indexOf(item);
		if(i >= 0) {
			array.splice(i, 1);
		}
	}

/* Date-facets */

	var dateInputTemplate = '{{=it.value}}<input type="text" data-type="{{=it.value}}" id="{{=it.name}}{{=it.value}}" placeholder="Velg dato"/>';
	var dateInputRenderer = doT.template(dateInputTemplate);
	// dateFacets format: { facetname: [fromDate, toDate] }
	var dateFacets = {};

	// @method getDateFacetInput - Returns inputfields for a given facetname. After insertion, call @method bindDateFacetInput to enable datepicker functionality
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	// @return {String} - Returns two inputfields as a string for insertion into HTML
	function getDateFacetInput(facetname) {
		var obj = {
			name: facetname,
			value: "Fra"
		};
		var html = dateInputRenderer(obj);
		obj.value = "Til";
		html += dateInputRenderer(obj);
		return html;
	}

	// @method bindDateFacetInput - Binds pickadate.js-datepicker to the inputfields. Called after insertion of inputfields from @method getDateFacetInput
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	function bindDateFacetInput(facetname) {
		var opt = {
			onSet: function(event) {
				var thistype = "";
				var element = this.$node[0];
				if(element.dataset !== undefined) { // standard approach
				    thistype = element.dataset.type;
				} else {
				    thistype = element.getAttribute('data-type'); // IE approach
				}
				setDateFacet(facetname, thistype, this.get());
				if ( thistype == "Fra") {
					var facetvalue = "Til";
					limitDateFacetInput(facetname, thistype, facetvalue);
				}
		    }
		}
		$('#'+facetname+'Fra').pickadate(opt);
		$('#'+facetname+'Til').pickadate(opt);
	}

	// @method setDateFacet
	// - Sets value for a given facetname to the dateFacets-object
	// - Calls @method updateFq to build facets (solrdata.fq) and do a new search with the chosen facets
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	// @param {String} facetvalue - 'Fra' or 'Til' (from or to-value)
	// @param {String} value - The actual date-value in the format 'yyyy-mm-dd'
	function setDateFacet(facetname, facetvalue, value) {
		var facetvalues = ['Fra', 'Til']
		var index = facetvalues.indexOf(facetvalue);
		if(typeof dateFacets[facetname] === 'undefined') {
			dateFacets[facetname] = ['*','*'];
		}
		if( value == '' ) {
			value = '*';
		} else if (facetvalue == "Fra") {
			value += 'T00:00:00Z';
		} else if (facetvalue == "Til") {
			value += 'T23:59:59Z';
		}
		dateFacets[facetname][index] = value;
		updateFq();
	}

	// @method getDateFacet
	// @return {Array} - Returns array for insertion to solr-fq, on the form "facet1:[from TO to]"
	function getDateFacets() {
		var fq = [];
		for( key in dateFacets ) {
			if(dateFacets[key].join('') != '**') {
				fq.push( key + ':[' + dateFacets[key].join(' TO ') + ']' );
			}
		}
		return fq;
	}

	function limitDateFacetInput(facetname, thistype, facetvalue) {
		
		var $frominput = $('#'+facetname+thistype);
		var $toinput = $('#'+facetname+facetvalue);
		
		var fromdate = $frominput.pickadate('picker').get().split('-');
		var todate = $toinput.pickadate('picker').get().split('-');

		fromdate = stringToDate(fromdate);
		
		$toinput.pickadate('picker').set({
			min: fromdate
		})
		if (todate) {
			todate = stringToDate(todate);

			if( fromdate > todate ) {
				$toinput.pickadate('picker').set({
					min: fromdate,
					select: fromdate
				});
			}
		}

	}

	// @method stringToDate 
	// - Turns a yyyy-mm-dd to a date object.
	// - Month starts from 0, for some reason.
	// @param {String} date - in format yyy-mm-dd
	// @return {Date} - Date-object converted from String
	function stringToDate(date) {
		return new Date(date[0], date[1]-1, date[2]);
	}

/* FQ Facets */

	// @method showFacets 
	// - Generates and adds the controls for facets returned from the first solr-search. 
	// - Facet with regular checkboxes that we want to show must be in solrdata['facet.field']
	// - Requires getLabel and getToolTip + other control-generators
	// @param {Object} facets - facetdata from solr-search
	function showFacets(facets) {
		var facethtml = "";
		for( var facet in facets ){
			var content = "";
			var facetLength = facets[facet].length;
			for ( var i=0; i < facetLength; i+=2 ) {
				var facetdata = {
					facetname: facet,
					facet: facets[facet][i],
					label: getLabel(facets[facet][i]),
					count: facets[facet][i+1],
					cls: 'facetcheckbox',
					id: facet+'_'+facets[facet][i].replace(/\W/g,'')
				}
				content += facetRenderer(facetdata);
			}
			var facetfilter = "";
			// Insert textinput for filtering the list of checkboxes for lists longer than 10 items
			if( facetLength > 10 ) facetfilter = '<input type="text" class="facetfilter"/>';
			facethtml += '<h2 '+getTooltip(facet.replace('_exact',''))+'>'+getLabel(facet.replace('_exact',''))+'</h2>'+facetfilter+'<ul>'+content+'</ul>';
		};

		facethtml += '<h2>Registrert</h2>'+getDateFacetInput('registrationDate');
		facethtml += '<h2>Født</h2>'+getDateFacetInput('born');

		// Insert facets into div#searchfacets 
		$("#searchfacets").html( facethtml );

		bindDateFacetInput('registrationDate');
		bindDateFacetInput('born');

		// Autocomplete payment clubs
		$('#paymentClub').autocomplete({
			source: clubs
		});
	}

	// @method filterFacetList
	// - User jQuery to filter out the list of checkboxes for a list of facets generated using @method showFacets
	// - Must bind a listener to keyup event on the facetfilterclass within the container
	function filterFacetList(t) {
        var value = $(t).val();
		$(t).next().children().each(function(){
            if ($(this).text().search( new RegExp(value, 'i') ) > -1 || value == "") {
                $(this).show();
            } else {
                $(this).hide();
            }
		});
	}

	function toggleFacet(facet,facetname,t,checkit) {
		// fq:['location:(oslo OR gothenburg)','department:software engineering']
		var facetentry = facetname+":"+facet;
		if(t){
			addFacet(facet, facetname);
		} else {
			removeFacet(facet, facetname);
		}
		updateFq();
		if(checkit){
			document.getElementById( facet.replace(' ','') ).checked = true;
		}
	}

	// facets = { facetname1: [facet1, facet2, facet3], facetname2: [facet4, facet5] }
	var facets = {};

	function addFacet(facet, facetname) {
		if(facets[facetname] === undefined)
			facets[facetname] = [];
		facets[facetname].push(facet);
	}

	function removeFacet(facet, facetname) {
		removeFromArray(facets[facetname], facet)
	}

	function updateFq(fqType) {
		var results = [];
		var result = "";
		for( var f in facets ) {
			if( facets[f].length > 0 ) {
				result = f + ':("' + facets[f].join('" OR "') + '")';
				results.push(result);
			}
		}
		results = results.concat( getDateFacets() );
		solrdata.fq = results;
		gotoPage(1);
		buildSearchSummary();
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
			if( $(this).is('h2') ) {
				summary += '<dt>'+$(this).html()+'</dt>';
			}
			if( $(this).is('ul') ) {
				$(this).children().each( function() {
					if(  $(this).children().first().prop('checked') ) {
						summary +=  '<dd>'+$(this).children().last().html()+'</dd>';
					}
				});
			}
			if( $(this).is('#paymentList') ) {
				$(this).children().each( function() {
					summary +=  '<dd>'+$(this).html()+'</dd>';
				});
			}
		});
		summary+="</dl>";
		summary+='<button class="clearBtn">Fjern alle filtere</button>';
		return summary;
	}

	function clearFilters() {
		$('#searchfacets').children().each( function( ) {
			if( $(this).is('ul') ) {
				$(this).children().each( function() {
					if(  $(this).children().first().prop('checked') ) {
						$(this).children().last().click();
					}
				});
			}
			if( $(this).is('#paymentList') ) {
				$(this).children().each( function() {
					$(this).click();
				});
			}
		});
	}

/* Sorting */

	var sortingParameters = {
		name: ['name', 'asc'],
		breed: ['breed', ''],
		postalCode: ['postalCode', '']
	};

	function setSortingParameters() {
		sortingParameters = [];
		$('#searchresults').find('th').each( function(index, element) {
			if(element.id != '') {
				sortingParameters[element.id] = [element.id, ''];
			}
		});
	}

	function toggleSorting(param, t) {
		for (var k in sortingParameters) {
			if( k != param ) {
				sortingParameters[k][1] = "";
				$('#'+k).removeClass('sortdesc sortasc');
			}
		}
		if(	sortingParameters[param][1] == "asc") {
			sortingParameters[param][1] = "desc";
			$(t).addClass('sortdesc').removeClass('sortasc');
		} else {
			sortingParameters[param][1] = "asc";
			$(t).addClass('sortasc').removeClass('sortdesc');
		}
		solrdata.sort = sortingParameters[param].join(' ');
		doSearch();
	}

/* Pagenavigation */

	var numberOfPages = 1;
	var currentPage = 1;

	function generatePageNav(numfound) {
		numberOfPages = Math.ceil( numfound / solrdata.rows );
		var currentFirst = (currentPage-1) * solrdata.rows + 1;
		var currentLast = currentPage * solrdata.rows;
		if(currentLast > numfound){ 
			currentLast = numfound; 
		}
		var html = '<p>'+currentFirst+' - '+currentLast+' av '+numfound+'</p>';
		if(numberOfPages>1){
			var prevBtn = '<button id="prevpagebtn">&lt;</button>';
			var select = '<select id="selectpage">';
			for(var i = 1; i<numberOfPages+1; i++){
				select+= '<option value="'+i+'">Side '+ i +'</option>';
			}
			select += '</select>';
			var nextBtn = '<button id="nextpagebtn">&gt;</button>';
			html = html+prevBtn+select+nextBtn;
		}
		$('#pagenavigation').html(html);
		$("#selectpage").val(currentPage);
	}

	function gotoPage(pageNum) {
		currentPage = pageNum;
		solrdata.start = (currentPage-1) * solrdata.rows;
		doSearch();
	}

	function prevPage() {
		if( currentPage > 0 ) {
			gotoPage(--currentPage);
		}
	}

	function nextPage() {
		if( currentPage < numberOfPages ) {
			gotoPage(++currentPage);
		}
	}

/* Search */

	var solrurl = "/dogservice/dogs/select",
	solrdata = {
		q:'*',
		wt:'json',
		indent:'true',
		facet:'true',
		'facet.field': ['breed', 'gender'],
		'facet.limit':'-1',
		sort: 'name asc',
		fl: '*',
		rows:50,
		start:0
	},
	bufferedData = {},
	clubs = [],
	totalCount = -1,
	filterTxt = '',
	hasParameters = false,
	ajaxSettings = {
		type:"get",
		url: solrurl,
		data: solrdata,
		traditional: true
	};

	var initiated = false,
	firstrun = true;

	function prepSearch(t) {
		currentPage = 1;
		solrdata.start = 0;
		filterTxt = $('#filter').val();
		if ( filterTxt.replace(/\s+/g, '')==='') {
			filterTxt = '*';
		}
		solrdata.q = "{!q.op=AND}" + filterTxt;
		doSearch();
	}

	function doSearch() {
		if(typeof searchrequest !== 'undefined'){
			searchrequest.abort();
		}
		searchrequest = $.ajax(ajaxSettings).done(function( data ) {
			data = jQuery.parseJSON( data );
			bufferedData = data;
			renderResults(data);
			if(firstrun) {
				showFacets(data.facet_counts.facet_fields);
				applyInitData();
				firstrun = false;
			}
			updateUrl();
			generatePageNav(data.response.numFound);
		});
	}


	function updateUrl() {
		if( window.history.replaceState ) {
			var newurl = location.origin + location.pathname;

			var urlData = [];
			filtervalue = document.getElementById('filter').value;
			if( filtervalue.length > 0 ){
				urlData.push("q="+filtervalue);
			}
			$('#searchfacets').children().each( function( ) {
				if( $(this).is('ul') ) {
					$(this).children().each( function() {
						var filterCheckbox = $(this).children().first();
						if( filterCheckbox.prop('checked') ) {
							urlData.push( filterCheckbox.prop('id').split('_').join("=") );
						}
					});
				}
				if( $(this).is('#paymentList') ) {
					$(this).children().each( function() {
						urlData.push("payment=" + $(this).val() );
					});
				}
			});
			if( currentPage > 1 ) {
				urlData.push("page="+currentPage);
			}

			newurl += "?" + urlData.join('&'); //+ urlData.join("&");
			window.history.replaceState({}, "title", newurl);
		} else {
			console.log('IE9 does not support history-manipulation through replaceState().');
		}
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
			for( key in initData ) {
				switch(key) {
					case 'q':
						document.getElementById('filter').value = decodeURI( initData[key][0] );
						prepSearch();
						break;
					case 'page':
						if( typeof initData[key][0] === "number" ) {
							gotoPage( initData[key][0] );
						}
						break;
					case 'payment':
						for(var i=0, l = initData[key].length; i<l; i++) {
							var p = decodeURI( initData[key][i] ).split('_');
							addPayment(p[0],p[1]);
						}
						break;
					default:
					for(var i=0, l = initData[key].length; i<l; i++) {
						$( "#"+key+"_"+initData[key][i] ).click();
					}
				}
			}
		}
		initiated = true;
	}

	function toggleCheckbox(id, state) {
		if( document.getElementById(id).checked != state ) {
			$('#'+id).click();
		}
	}

/* Detailview */

	function showDetails(counter) {

		var isAuthenticated = auth.isAuthenticated();
		var dog = bufferedData.response.docs[counter];
		if( isAuthenticated ) {
			dog.owner = jQuery.parseJSON( dog.json_detailed );
		} else {
			dog.owner = false;
		}
		$('#detailcontent').html( dogDetailRenderer(dog) );
		//objectToNestedList( $('#detailcontent'), jQuery.parseJSON( bufferedData.response.docs[counter].json_detailed ) );
		$('#detail').show(200);
	}

	function hideDetails() {
		$('#detail').hide(200, function() {
			$('#detailcontent').empty();
		});
	}

	function showHelp() {
		$('#detailcontent').html( $('#helptext').html() );
		$('#detail').show(200);
	}

/* Init */


	function init() {

		auth.authenticate();

		dogTemplate = $('#tabletemplate').text();
		dogDetailTemplate = $('#detailtemplate').text();

		dogRenderer = doT.template(dogTemplate);
		dogDetailRenderer = doT.template(dogDetailTemplate);

		if( auth.isAuthenticated() ) {		    
		    $('#loginform').before( 'Velkommen ' + auth.getUserName() );
		    $('#loginbutton').remove();
		} else {
			$('#searchresults').find('thead tr').children().slice(3).remove();
			$('#loginform').before('Du må logge inn.');
		    $('#logoutbutton').remove();
		}

		setSortingParameters();

		$('#filter').keyup( function(event) {
			prepSearch(this);
		});
		
		bindListeners();

		prepSearch();

	}

	function bindListeners() {

		var KEYCODE_ESC = 27;

		// Search listeners
		$('#searchfacets').on('change','.facetcheckbox', function() { toggleFacet(this.value, this.name, this.checked) } );
		$('#searchfacets').on('keyup','.facetfilter', function() { filterFacetList(this) } );

		// Detailview listeners
		$('#searchresults').on('click','.member', function() { showDetails(this.id) } );
		$('#detailmask').click( function() { hideDetails() } );
		$('#detail').on('click','button', function() { hideDetails() } );
		$(document).keyup(function(e) { if (e.keyCode == KEYCODE_ESC) { hideDetails(); } });

		// Show help listeners
		$('header').on('click','h1', function() { showHelp() } );
		
		// Page navigation listeners
		$('#pagenavigation').on('click','#nextpagebtn', function() { nextPage() } );
		$('#pagenavigation').on('click','#prevpagebtn', function() { prevPage() } );
		$('#pagenavigation').on('change','#selectpage', function() { gotoPage(this.value) } );
		
		// Sorting listeners
		$('#searchresults').on('click','.sortable', function() { toggleSorting(this.id, this) } );

		// Clear all
		$('#searchsummary').on('click', '.clearBtn', function() { clearFilters() } );
		$('#searchresults').on('click', '.clearBtn', function() { clearFilters() } );

		// Tools
		$('#sendMailBtn').click( function() { showMail() } );
	}

/* Reveal */

	init();

}());