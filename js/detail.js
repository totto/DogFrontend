/* Details */
define(['jQuery'], function($){
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

	return {
		show: show,
		hide: hide,
		showHelp: showHelp
	}
});