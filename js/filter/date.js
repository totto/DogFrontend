/* Date-facets */
define(['jQuery','tooltip','dict', 'doT', 'picker', 'picker_date', 'picker_no'], function($, tooltip, dict, doT){
	
	var me = {};

	var dateInputTemplate = '<span class="datelabel">{{=it.value}}</span><input type="text" data-type="{{=it.value}}" id="{{=it.name}}{{=it.value}}" placeholder="Velg dato"/>';
	var dateInputRenderer = doT.template(dateInputTemplate);
	// dateFacets format: { facetname: [fromDate, toDate] }
	var dateFacets = {};

	// @method bindInput - Binds pickadate.js-datepicker to the inputfields. Called after insertion of inputfields from @method getDateFacetInput
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	me.bindInput = function(facetname) {
		var opt = {
			selectYears: 30,
			selectMonths: true,
			max: new Date(),
			onSet: function(event) {
				var element = $(this.$node[0]);
				var thistype = element.data('type');
				setFacet(facetname, thistype, this.get());
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
	// - Calls @method updateFq to build facets (conf.solr.data.fq) and do a new search with the chosen facets
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	// @param {String} facetvalue - 'Fra' or 'Til' (from or to-value)
	// @param {String} value - The actual date-value in the format 'yyyy-mm-dd'
	function setFacet(facetname, facetvalue, value) {
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
		$(document).trigger('filterUpdate');
	}

	// @method getDateFacet
	// @return {Array} - Returns array for insertion to solr-fq, on the form "facet1:[from TO to]"
	me.getSolrParams = function() {
		var fq = [];
		for( key in dateFacets ) {
			if(dateFacets[key].join('') != '**') {
				fq.push( key + ':[' + dateFacets[key].join(' TO ') + ']' );
			}
		}
		return fq;
	}

	// @method getUrlDateFacet
	// @return {Array} - Returns array for insertion to solr-fq, on the form "facet1:[from TO to]"
	function getUrlDateFacets() {
	}

	function limitDateFacetInput(facetname, thistype, facetvalue) {
		var $frominput = $('#'+facetname+thistype);
		var $toinput = $('#'+facetname+facetvalue);
		
		var fromdate = $frominput.pickadate('picker').get().split('-');
		var todate = $toinput.pickadate('picker').get().split('-');

		if( fromdate[0]=='' ) {
			$toinput.pickadate('picker').set({
				min: undefined
			});
		} else {

			fromdate = arrayToDate(fromdate);
			
			$toinput.pickadate('picker').set({
				min: fromdate
			})

			if ( todate[0]!='' ) {
				todate = arrayToDate(todate);

				if( fromdate > todate ) {
					$toinput.pickadate('picker').set({
						min: fromdate,
						select: fromdate
					});
				}
			}

		}

	}

	// @method arrayToDate 
	// - Turns an array [yyyy, mm, dd] to a date object.
	// - NOTE! Month starts from 0 - e.g. 0 = January, 3 = april
	// @param {array} date - in format [yyyy, mm, dd]
	// @return {Date} - Date-object converted from String
	function arrayToDate(date) {
		return new Date(date[0], date[1]-1, date[2]);
	}

	// @method getHtml - Returns html for a given facetname. After insertion, call @method bindInput to enable datepicker functionality
	// @param {String} facetname - The name of the facet, e.g. registrationDate
	// @return {String} - Returns two inputfields as a string for insertion into HTML
	me.getHtml = function() {
		facetname = 'born';
		var html = '<div><h2 '+tooltip.get(facetname)+'>'+dict.get(facetname)+'</h2>';
		html+='<div class="datefacet">';
		var obj = {
			name: facetname,
			value: "Fra"
		};
		html += dateInputRenderer(obj);
		obj.value = "Til";
		html += dateInputRenderer(obj);
		return [html+'</div></div>'];
	}

	me.getUrlParams = function() {
		var urlData = [];
		var types = ['Fra', 'Til'];
		for( key in dateFacets ) {
			for(var i=0; i<2; i++) {
				if(dateFacets[key][i] != '*') {
					urlData.push( 'fqrange=' + key + types[i] + '_' + dateFacets[key][i].substring(0,10) );
				}
			}
		}
		return urlData;
	}

	return me;

})