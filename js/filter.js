/* Filters and the like */
define(['require', 'filter/modules', 'config', 'pagenav'], function(require, modules, conf, pagenav){
    
    var me = {};

    function runModuleMethod(method, params) {
        var result = [];
        var ml = modules.list.length;
        for(var i = 0; i < ml; i++) {
            if(typeof modules.list[i][method] !== 'undefined'){
                result = result.concat( modules.list[i][method](params) );
            }
        }
        return result;
    }

    function updateSolrParams() {
        var params = runModuleMethod('getSolrParams');
        conf.solr.data.fq = params;
        pagenav.go(1);
    }

    getHtml = function(facets){
        return runModuleMethod('getHtml', facets).join('');
    }

    // @method showFacets 
    // - Generates and adds the controls for facets returned from the first solr-search. 
    // - Facet with regular checkboxes that we want to show must be in conf.solr.data['facet.field']
    // - Requires getLabel and tooltip.get + other control-generators
    // @param {Object} facets - facetdata from solr-search
    me.show = function(facets){
        var facethtml = getHtml(facets);
        // Insert facets into div#searchfacets 
        $("#searchfacets").html( facethtml );
        $(document).trigger('filterAppended');
    }

    me.getUrlParams = function(){
        return runModuleMethod('getUrlParams');
    }

    function bindInputs() {
        runModuleMethod('bindInput',modules.date)
    }

    clearFilters = function() {
        $('#searchfacets').find('input:checked').each( function( ) {
            $(this).click();
        });
        $('#searchfacets').find('.picker__input').each( function( ) {
            $(this).pickadate('picker').clear();
        });
    }
    
    // Document listeners
    $(document).on('filterUpdate', function() { updateSolrParams() });
    $(document).on('filterAppended', function() { bindInputs() });
    
    // Clear all
    $('#searchsummary').on('click', '.clearBtn', function() { clearFilters() } );
    $('#searchresults').on('click', '.clearBtn', function() { clearFilters() } );

    return me;
});