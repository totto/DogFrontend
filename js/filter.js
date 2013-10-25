/* Filters and the like */
define(['require', 'filter/modules', 'config', 'pagenav'], function(require, modules, conf, pagenav){
    
    var me = {};
    var ml = modules.list.length;
    
    // Document listeners
    $(document).on('filterUpdate', function() { updateSolrParams() });

    function runModuleMethod(method) {
        var result = [];
        for(var i = 0; i < ml; i++) {
            result = result.concat( modules.list[i][method]() );
        }
        return result;
    }

    function updateSolrParams() {
        var params = runModuleMethod('getSolrParams');
        conf.solr.data.fq = params;
        pagenav.go(1);
    }

    me.getHtml = function(){
        return runModuleMethod('getHtml').join('');
    }

    // @method showFacets 
    // - Generates and adds the controls for facets returned from the first solr-search. 
    // - Facet with regular checkboxes that we want to show must be in conf.solr.data['facet.field']
    // - Requires getLabel and tooltip.get + other control-generators
    // @param {Object} facets - facetdata from solr-search
    me.show = function(facets){
        var facethtml = "";
        facethtml+=modules.list[1].getHtml(facets);
        facethtml += modules.list[0].getHtml();
        // Insert facets into div#searchfacets 
        $("#searchfacets").html( facethtml );
        modules.list[0].bindInput('born');
    }

    me.getUrlParams = function(){
        return runModuleMethod('getUrlParams');
    }

    return me;
});