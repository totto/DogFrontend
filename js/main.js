require.config({
    urlArgs: "nocache=" + (new Date()).getTime(), // Prevent caching
    paths: {
        'jQuery': 'http://code.jquery.com/jquery-latest.min',
        'jQueryUI': 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min',
        'doT': 'lib/doT.min',
        'picker': 'lib/picker',
        'picker_date': 'lib/picker.date',
        'picker_no': 'lib/no_NO'
    },
    shim: {
        'jQuery':       { exports: 'jQuery' },
        'jQueryUI':     { deps: ['jQuery'] },
        'picker':       { deps: ['jQuery'] },
        'picker_date':  { deps: ['picker'] },
        'picker_no':    { deps: ['picker'] },
    }
});

require(['app'], function (app) {
    app.init();
});