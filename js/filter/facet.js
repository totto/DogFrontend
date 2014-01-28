define(['jQuery', 'dict', 'tooltip', 'doT', 'jQueryUI'], function($, dict, tooltip, doT){

	// facets = { facetname1: [facet1, facet2, facet3], facetname2: [facet4, facet5] }
	var facets = {};	
	var facetTemplate = '<li><input type="checkbox" name="{{=it.facetname}}" value="{{=it.facet}}" class="{{=it.cls}}" id="{{=it.id}}" {{? it.checked }}checked{{?}}/><label for="{{=it.id}}">{{=it.label}}</label></li>',
	facetRenderer = doT.template(facetTemplate);
	var autocompletefacets = {};

	var me = {};
	
	me.getHtml = function(kwargs) {
		var facets = kwargs.facets;
		var facethtml = "";
        for( var facet in facets ){
            var facetLength = facets[facet].length;
            var content = "";

            // If facet has less than 10 items, do a checkbox-list
            if( facetLength < 10 ) {
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
	            content = '<ul>'+content+'</ul>';

	        // If facet has more than, do a autocomplete add-list
            } else {
            	content = '<input type="text" class="autocompletefacet" id="'+facet+'_ac" name="'+facet+'"/><div id="'+facet+'_container"></div>';
            	var resultArray = [];
				// Build list for autocomplete, removing facetcounters
				for(var i = facets[facet].length-1; i--;){
					var b = facets[facet][i];
					if (typeof b !== "number" && b !== "") resultArray.push( b );
				};
            	autocompletefacets[facet] = resultArray;
            	console.log('Autocomplete:', autocompletefacets);
            }
            facethtml += '<div><h2 '+tooltip.get(facet.replace('_exact',''))+'>'+dict.get(facet.replace('_exact',''))+'</h2>'+content+'</div>';
        };
        return facethtml;
	}

	me.bindInput = function() {
		for( var acfacet in autocompletefacets ) {
			$('#'+acfacet+'_ac').autocomplete({
				source: autocompletefacets[acfacet],
				select: function( event, ui ) {
					$('#'+this.name+'_container').append('<button class="removeFacetBtn" name="'+acfacet+'">'+ui.item.value+'</button>');
					addFacet(ui.item.value, acfacet);
					this.value="";
					return false;
				}
			});
		}
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
		if(t){
			addFacet(facet, facetname);
		} else {
			removeFacet(facet, facetname);
		}
	}

	function addFacet(facet, facetname) {
		if(facets[facetname] === undefined)
			facets[facetname] = [];
		facets[facetname].push(facet);
		$(document).trigger('filterUpdate');
	}

	function removeFacet(facet, facetname) {
		removeFromArray(facets[facetname], facet);
		$(document).trigger('filterUpdate');
	}

	function removeFacetBtnClick(t) {
		console.log(t.name, t.innerHTML);
		removeFacet(t.innerHTML, t.name);
		$(t).remove();
	}

/* Helper functions */

	function removeFromArray(array, item) {
		var i = array.indexOf(item);
		if(i >= 0) {
			array.splice(i, 1);
		}
	}

	me.clearFilter = function($filtercontainer) {
        $filtercontainer.find('input:checked').each( function( ) {
            $(this).click();
        });
	}


	// Search listeners
	$('#searchfacets').on('keyup','.facetfilter', function() { filterFacetList(this) } );
	$('#searchfacets').on('click','.removeFacetBtn', function() { removeFacetBtnClick(this) } );
	$('#searchfacets').on('change','.facetcheckbox', function() { toggleFacet(this.value, this.name, this.checked) } );

	return me;
})