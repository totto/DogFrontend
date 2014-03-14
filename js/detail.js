/* Details */
define(['jQuery', 'config', 'doT', 'breeds'], function($, conf, doT, breeds){

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

	function renderDetailDog(thisDog) {
		if( typeof thisDog.breedObject == 'undefined') {
			thisDog.breedObject = breeds.getObjByName( thisDog.breed );
		}
		show( detailRenderer( thisDog ) );
	}

	var KEYCODE_ESC = 27;

	// Detailview listeners
	$('#searchresults').on('click','.member', function() {
		var thisDog = conf.bufferedData.response.docs[this.id];

		if( breeds.list.length < 1 ){
	        $.ajax('js/lib/Raser.json').done(function(data){
	        	breeds.list = data.breed;
	        	renderDetailDog(thisDog);
			});
		} else {
			renderDetailDog(thisDog);
		}
		/* Temporary force import of breed */
		$.ajax({
			url: 'http://dogpopulation.nkk.no/dogpopulation/graph/breed/import/'+thisDog.breed,
			dataType: 'jsonp'
		});
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
