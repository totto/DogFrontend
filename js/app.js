define(['jQuery', 'auth', 'search', 'sort', 'detail', 'csv'], function ($, auth, search, sort, detail) {

	function init() {

		auth.authenticate();

		if( auth.isAuthenticated() ) {		    
		    $('#loginform').before( 'Velkommen ' + auth.getUserName() );
		    $('#loginbutton').remove();
		} else {
			$('#loginform').before('Du må logge inn.');
		    $('#logoutbutton').remove();
		}

		sort.init();

		$('#filter').keyup( function(event) {
			search.prep(this);
		});

		$('header').on('click','h1', function() { detail.showHelp() } );
		
		search.prep();

	}

	return {
		init: init
	}

});