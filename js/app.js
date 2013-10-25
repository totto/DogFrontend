define(['jQuery', 'doT', 'auth', 'search', 'dict', 'tooltip', 'detail', 'config', 'pagenav',
	'picker', 'picker_date', 'picker_no'], 
	function ($, doT, auth, search, dict, tooltip, detail, conf, pagenav) {

/* FQ Facets */

	function clearFilters() {
		$('#searchfacets').find('input:checked').each( function( ) {
			$(this).click();
		});
		$('#searchfacets').find('.picker__input').each( function( ) {
			$(this).pickadate('picker').clear();
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
		conf.solr.data.sort = sortingParameters[param].join(' ');
		search.run();
	}

/* Search */



	function toggleCheckbox(id, state) {
		if( document.getElementById(id).checked != state ) {
			$('#'+id).click();
		}
	}

/* Init */


	function init() {

		auth.authenticate();

		dogTemplate = $('#tabletemplate').text();
		dogDetailTemplate = $('#detailtemplate').text();

		dogRenderer = doT.template(dogTemplate);
		detailRenderer = doT.template(dogDetailTemplate);

		if( auth.isAuthenticated() ) {		    
		    $('#loginform').before( 'Velkommen ' + auth.getUserName() );
		    $('#loginbutton').remove();
		} else {
			$('#loginform').before('Du må logge inn.');
		    $('#logoutbutton').remove();
		}

		setSortingParameters();

		$('#filter').keyup( function(event) {
			search.prep(this);
		});
		
		bindListeners();

		search.prep();

	}

	function bindListeners() {

		var KEYCODE_ESC = 27;


		// Detailview listeners
		$('#searchresults').on('click','.member', function() { detail.show( detailRenderer( conf.bufferedData.response.docs[this.id] ) ) } );
		$('#detailmask').click( function() { detail.hide() } );
		$('#detail').on('click','button', function() { detail.hide() } );
		$(document).keyup(function(e) { if (e.keyCode == KEYCODE_ESC) { detail.hide(); } });

		// Show help listeners
		$('header').on('click','h1', function() { detail.showHelp() } );
		
		// Page navigation listeners
		$('#pagenavigation').on('click','#nextpagebtn', function() { pagenav.next() } );
		$('#pagenavigation').on('click','#prevpagebtn', function() { pagenav.prev() } );
		$('#pagenavigation').on('change','#selectpage', function() { pagenav.go(this.value) } );
		
		// Sorting listeners
		$('#searchresults').on('click','.sortable', function() { toggleSorting(this.id, this) } );

		// Clear all
		$('#searchsummary').on('click', '.clearBtn', function() { clearFilters() } );
		$('#searchresults').on('click', '.clearBtn', function() { clearFilters() } );

		// Tools
		$('#sendMailBtn').click( function() { showMail() } );
	}

	return {
		init: init
	}

});