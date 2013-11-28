define(['jQuery', 'dict', 'tooltip', 'doT'], function($, dict, tooltip, doT){

	// facets = { facetname1: [facet1, facet2, facet3], facetname2: [facet4, facet5] }
	var facets = {};	
	var facetTemplate = '<li><input type="checkbox" name="{{=it.facetname}}" value="{{=it.facet}}" class="{{=it.cls}}" id="{{=it.id}}" {{? it.checked }}checked{{?}}/><label for="{{=it.id}}">{{=it.label}}</label></li>',
	facetRenderer = doT.template(facetTemplate);


	var me = {};
	
	me.getHtml = function(kwargs) {
		var facets = kwargs.facets;
		var facethtml = "";
        for( var facet in facets ){
            var content = "";
            var facetLength = facets[facet].length;
            for ( var i=0; i < facetLength; i+=2 ) {
                var facetdata = {
                    facetname: facet,
                    facet: facets[facet][i],
                    label: dict.get(facets[facet][i]),
                    count: facets[facet][i+1],
                    cls: 'facetcheckbox',
                    id: facet+'_'+facets[facet][i].replace(/\W/g,'')
                }
                content += facetRenderer(facetdata);
            }
            var facetfilter = "";
            // Insert textinput for filtering the list of checkboxes for lists longer than 10 items
            if( facetLength > 10 ) facetfilter = '<input type="text" class="facetfilter"/>';
            facethtml += '<div><h2 '+tooltip.get(facet.replace('_exact',''))+'>'+dict.get(facet.replace('_exact',''))+'</h2>'+facetfilter+'<ul>'+content+'</ul></div>';
        };
        return facethtml;
	}
	me.getSolrParams = function() {
        var results = [];
        var result = "";
        for( var f in facets ) {
            if( facets[f].length > 0 ) {
                result = f + ':("' + facets[f].join('" OR "') + '")';
                results.push(result);
            }
        }
        return results;
	}
	me.getUrlParams = function() {
		var urlData = [];
		$('#searchfacets').find('ul').children().each( function( ) {
			var filterCheckbox = $(this).children().first();
			if( filterCheckbox.prop('checked') ) {
				urlData.push( filterCheckbox.prop('id').split('_').join("=") );
			}
		});
		return urlData;
	}


	// @method filterFacetList
	// - User jQuery to filter out the list of checkboxes for a list of facets generated using @method showFacets
	// - Must bind a listener to keyup event on the facetfilterclass within the container
	function filterFacetList(t) {
        var value = $(t).val();
		$(t).next().children().each(function(){
            if ($(this).text().search( new RegExp(value, 'i') ) > -1 || value == "") {
                $(this).show();
            } else {
                $(this).hide();
            }
		});
	}

	function toggleFacet(facet,facetname,t) {
		// fq:['location:(oslo OR gothenburg)','department:software engineering']
		var facetentry = facetname+":"+facet;
		if(t){
			addFacet(facet, facetname);
		} else {
			removeFacet(facet, facetname);
		}
		$(document).trigger('filterUpdate');
	}

	function addFacet(facet, facetname) {
		if(facets[facetname] === undefined)
			facets[facetname] = [];
		facets[facetname].push(facet);
	}

	function removeFacet(facet, facetname) {
		removeFromArray(facets[facetname], facet)
	}

/* Helper functions */

	function removeFromArray(array, item) {
		var i = array.indexOf(item);
		if(i >= 0) {
			array.splice(i, 1);
		}
	}


	// Search listeners
	$('#searchfacets').on('keyup','.facetfilter', function() { filterFacetList(this) } );
	$('#searchfacets').on('change','.facetcheckbox', function() { toggleFacet(this.value, this.name, this.checked) } );

	return me;
})