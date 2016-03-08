/* Field Search */
define(['jQuery','tooltip','dict'], function($, tooltip, dict){
	
	var me = {};

	// queries format: { field1: 'query', field2: 'query' }
	var queries = {};

	function setQuery(field, query) {
		queries[field] = query;
		$(document).trigger('filterUpdate');
	}

	// @method getDateFacet
	// @return {Array} - Returns array for insertion to solr-fq, on the form "facet1:[from TO to]"
	me.getAdditionalParams = function() {
		var params = [];
		for( key in queries ) {
			if(queries[key] !== '') {
				params.push( 'json_detailed:"' + key + ' ' + queries[key] + '"~25' );
			}
		}
		return params.join(' ');
	}

	// @method getHtml - Returns html for a given facetname. After insertion, call @method bindInput to enable datepicker functionality
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	// @return {String} - Returns two inputfields as a string for insertion into HTML
	me.getHtml = function(kwargs) {
		var fields = kwargs.modules.fieldSearch;
		var html = '';
		for(var i = 0; i<fields.length; i++){
			html += htmlRender(fields[i]);
		}
		return [html];
	}

	function htmlRender(field) {
		return html = '<div><h2 '+tooltip.get(field)+'>'+dict.get(field)+'</h2><input type="text" class="fieldsearch" id="'+field+'_q"/></div>';
	}

	me.bindInput = function(modules) {
		var fields = modules.fieldSearch;
		for(var i = 0; i<fields.length; i++){
			$('#'+fields[i]+'_q').on( 'keyup change', function(){
				setQuery( this.id.replace('_q',''), this.value );
			});
		}
	}

	me.getUrlParams = function() {
		var urlData = [];
		for( key in queries ) {
			if(queries[key] != ''){
				urlData.push('fieldSearch='+key+'_'+queries[key]);
			}
		}
		return urlData;
	}

	me.clearFilter = function($filtercontainer) {
		$filtercontainer.find('.fieldsearch').each( function( ) {
            $(this).val('').trigger('change');
        });
	}

	return me;

})