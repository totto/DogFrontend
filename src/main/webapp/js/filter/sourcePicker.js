/* Sourcepicker */
define(['jQuery','tooltip','dict'], function($, tooltip, dict){
	
	var me = {};

	// source NO, SE, ALL
	var source = 'NO';
	var source_param = {
		ALL: '',
		NO: '', //'-postalCode:Sweden -postalCode:Finland',
		SE: 'postalCode:Sweden',
		FI: 'postalCode:Finland'
	}

	function setSource(s) {
		source = s;
		$(document).trigger('filterUpdate');
	}

	// @method getDateFacet
	// @return {Array} - Returns array for insertion to solr-fq, on the form "facet1:[from TO to]"
	me.getAdditionalParams = function() {
		var params = source_param[source];
		return params;
	}

	// @method getHtml - Returns html for a given facetname. After insertion, call @method bindInput to enable datepicker functionality
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	// @return {String} - Returns two inputfields as a string for insertion into HTML
	me.getHtml = function() {
		var field = 'Source';
		var html = '<div><h2 '+tooltip.get(field)+'>'+dict.get(field)+'</h2>'
		+'<select id="sourcepicker">'
		//+'<option value="ALL">Alle</option>'
		+'<option value="NO">NKK</option>'
		//+'<option value="SE">SKK</option>'
		//+'<option value="FI">FKK</option>'
		+'</select>'
		+'</div>';
		return [html];
	}

	me.bindInput = function() {
		$('#sourcepicker').change(function(){
			setSource(this.value);
		})
	}

	me.getUrlParams = function() {
		var urlData = [];
		if(source!='ALL') urlData = ['source='+source];
		return urlData;
	}

	me.clearFilter = function($filtercontainer) {
		$filtercontainer.find('#sourcepicker').each( function( ) {
            $(this).val('ALL').trigger('change');
        });
	}


	return me;

})