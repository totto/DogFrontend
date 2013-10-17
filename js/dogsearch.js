( function () {

/* Rendering */

	function renderResults(data) {
		var html = '';
		if(data.response.numFound > 0){
			var dogs = data.response.docs;
			var dogslength = dogs.length;
			var isAuthenticated = auth.isAuthenticated();
			for(var i=0;i<dogslength;i++) {
				try {
					var dog = dogs[i];
					if( isAuthenticated ) {
						dog.owner = jQuery.parseJSON( dog.json_detailed );
					} else {
						dog.owner = false;
					}
					dog.counter = i;
					html += dogRenderer(dog);
					// console.log(member);
				} catch(err) {

				}
			}
		} else {
			html = "Ingen personer funnet" + getSearchSummary();
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

/* Sorting */

	var sortingParameters = {
		name: ['name', 'asc'],
		breed: ['breed', ''],
		postalCode: ['postalCode', '']
	};

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

	var solrurl = "/solr/dogs/select",
	solrdata = {
		q:'*',
		wt:'json',
		indent:'true',
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
			generatePageNav(data.response.numFound);
		});
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

		$('#filter').keyup( function(event) {
			prepSearch(this);
		});
		
		bindListeners();

		prepSearch();

	}

	function bindListeners() {

		var KEYCODE_ESC = 27;

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