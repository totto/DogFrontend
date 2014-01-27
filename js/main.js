require.config({
    urlArgs: "nocache=" + (new Date()).getTime(), // Prevent caching
    paths: {
        'jQuery': 'http://code.jquery.com/jquery-latest.min',
        'jQueryUI': 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min',
        //'jQuery': 'lib/jquery-1.9.1',
        //'jQueryUI': 'jquery-ui-1.10.3.custom.min',
        'doT': 'lib/doT.min',
        'picker': 'lib/picker',
        'picker_date': 'lib/picker.date'
    },
    shim: {
        'jQuery':       { exports: 'jQuery' },
        'jQueryUI':     { deps: ['jQuery'] },
        'picker':       { deps: ['jQuery'] },
        'picker_date':  { deps: ['picker'] }
    }
});

require(['app'], function (app) {
    app.init();
});