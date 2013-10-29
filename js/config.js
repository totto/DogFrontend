/* App configuration */
define([], function() {
    var solrurl = "/dogservice/dogs/select";
    var me = {
        bufferedData: {},
        filterTxt: '',
        solr: {
            type:"get",
            url: solrurl,
            data: {
                q:'*',
                wt:'json',
                indent:'true',
                facet:'true',
                'facet.field': ['breed', 'gender'],
                'facet.limit':'-1',
                sort: 'name asc',
                fl: '*',
                rows:50,
                start:0
            },
            traditional: true
        }
    }
    return me;
});