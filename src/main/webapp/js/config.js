/* App configuration */
define([], function() {
    var solrurl = "solr/select";
    var me = {
        bufferedData: {},
        filterTxt: '',
        additionalParams: '',
        solr: {
            type:"get",
            url: solrurl,
            data: {
                q:'*',
                wt:'json',
                indent:'true',
                facet:'false',
                sort: 'timestamp desc',
                fl: '*',
                rows:50,
                start:0
            },
            traditional: true
        }
    }
    return me;
});