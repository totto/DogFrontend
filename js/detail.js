/* Details */
define(['jQuery', 'config', 'doT'], function($, conf, doT){

	dogDetailTemplate = $('#detailtemplate').text();
	detailRenderer = doT.template(dogDetailTemplate);

	function show(html) {
		$('#detailcontent').html( html );
		$('#detail').show(200);
	}

	function hide() {
		$('#detail').hide(200, function() {
			$('#detailcontent').empty();
		});
	}

	function showHelp() {
		$('#detailcontent').html( $('#helptext').html() );
		$('#detail').show(200);
	}

	var KEYCODE_ESC = 27;

	// Detailview listeners
	$('#searchresults').on('click','.member', function() {
		var thisDog = conf.bufferedData.response.docs[this.id];
		// Temporary force import of breed
		$.ajax({
			url: 'http://dogid.nkk.no/dogpopulation/graph/breed/import/'+thisDog.breed,
			dataType: 'jsonp'
		});
		show( detailRenderer( thisDog ) );
	});
	$('#detailmask').click( function() { hide() } );
	$('#detail').on('click','button', function() { hide() } );
	$(document).keyup(function(e) { if (e.keyCode == KEYCODE_ESC) { hide(); } });

	return {
		show: show,
		hide: hide,
		showHelp: showHelp
	}
});