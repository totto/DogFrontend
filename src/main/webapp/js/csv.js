/* CSV Download */
define(['jQuery', 'config', 'downloadify'], function($, conf){
	var me = {};

	function getCsvData() {

		console.log('Getting CSV Data...');

		// Store old settings
		var tempRows = conf.solr.data.rows;
		var tempFl = conf.solr.data.fl;
		
		// Set new settings
		conf.solr.data.fl = 'json_detailed';
		conf.solr.data.rows = 1000000;
		conf.solr.beforeSend = function(jqXHR, settings) {
            jqXHR.url = settings.url;
            return false;
        };

        console.log('Requesting data...');
        // Get url and make request
		var request = $.ajax(conf.solr);

        var req = new XMLHttpRequest();
        req.open("GET", request.url, false);
        req.setRequestHeader('Content-type','application/x-www-form-urlencoded');
        req.send();

        console.log('Parsing returned data...');
        // Format data
        var solrJsonData = JSON.parse( req.responseText );

        var confirmed = false;
        var csvResult;

		if(solrJsonData.response.numFound > 0){
			console.log('Found data...');
			if( solrJsonData.response.numFound > 2000 ) {
				confirmed = window.confirm('Ditt søkeresultat inneholder fler enn 2000 hunder, dette kan ta tid å laste ned. Er du sikker på at du vil fortsette?');
			} else if ( solrJsonData.response.numFound > 5000 ) {
				confirmed = window.confirm('Ditt søkeresultat inneholder fler enn 5000 hunder. Det anbefales å ha færre enn 2000 hunder. Er du sikker på at du vil fortsette?');
			} else {
				confirmed = true;
			}
		} else {
			alert('Ditt søkeresultat inneholder ingen hunder...');
		}

		if( confirmed ) {

	        var jsonData = renderSolrJsonData( solrJsonData );
	        var keys = getKeys( jsonData );
	        var csvArray = [ createCsvHead( keys ) ];

	        console.log('Rendering data...');

			for( var i = 0; i < jsonData.length; i++) {
				var docArray = [];
			    for( var j = 0; j < keys.length; j ++) {
			        docArray.push( jsonData[i][ keys[j] ] || '-' );
			    }
				csvArray.push( docArray.join(';') );
			}
			csvResult = csvArray.join('\n');
		}

        console.log('Restoring settings...');
		// Restore old settings
		conf.solr.beforeSend = function(jqXHR, settings) {};
		conf.solr.data.fl = tempFl;
		conf.solr.data.rows = tempRows;

		if( confirmed ) {
			console.log('Returning data...');	
		} else {
			console.log('No data returned...');
		}
		return csvResult;
	}

	function renderSolrJsonData(jData) {
	    var docs = jData.response.docs;
	    for ( var i = 0; i < docs.length; i++ ) {
	        var jsonDoc = docs[i].json_detailed;
	        docs[i] = JSON.flatten( JSON.parse( jsonDoc ) );
	    }
	    return docs;
	}

	function getKeys(docs) {
	    var keys = [];
	    for ( var i = 0; i < docs.length; i++ ) {
	        for( var key in docs[i] ) {
	            if( keys.indexOf( key ) < 0 ) {
	                keys.push( key );
	            }
	        }
	    }
	    return keys;
	}

	function createCsvHead(keys) {
		// \uFEFF to initiate UTF-8
		return "\uFEFF " + keys.join('; ');
	}

	JSON.flatten = function(data) {
	    var result = {};
	    function recurse (cur, prop) {
	        if (Object(cur) !== cur) {
	            result[prop] = cur;
	        } else if (Array.isArray(cur)) {
	             for(var i=0, l=cur.length; i<l; i++)
	                 recurse(cur[i], prop ? prop+"."+i : ""+i);
	            if (l == 0)
	                result[prop] = [];
	        } else {
	            var isEmpty = true;
	            for (var p in cur) {
	                isEmpty = false;
	                recurse(cur[p], prop ? prop+"."+p : p);
	            }
	            if (isEmpty)
	                result[prop] = {};
	        }
	    }
	    recurse(data, "");
	    return result;
	}

	$('#downloadCsvBtn').downloadify({
		swf: 'media/downloadify.swf',
		downloadImage: 'img/download.png',
		width: 100,
		height: 30,
		filename: 'liste.csv',
		data: function() {
			var c = getCsvData();
			if(c) {
				return c;
			}
			return;
		},
		append: true,
		transparent: true
	});

	return me;
})