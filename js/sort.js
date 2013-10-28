/* Sorting */
define(['jQuery'], function($){
	var me = {};
	var sortingParameters = {};

	me.init = function() {
		$('#searchresults').find('th').each( function(index, element) {
			if(element.id != '') {
				sortingParameters[element.id] = [element.id, ''];
			}
		});
	}

	function toggle(param, t) {
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
		$(document).trigger('doSearch');
	}

	// Sorting listeners
	$('#searchresults').on('click','.sortable', function() { toggle(this.id, this) } );

	return me;
})