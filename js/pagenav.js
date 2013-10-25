/* Pagenavigation */
define(['jQuery', 'doT', 'config'], function($, doT, conf){

	var numberOfPages = 1;
	var currentPage = 1;
	var navTemplate =
		'<p>{{=it.first}} - {{=it.last}} av {{=it.numfound}}</p>'+
		'<button id="prevpagebtn">&lt;</button>'+
		'<select id="selectpage">'+
		'{{ for(var i=1;i<=it.numberOfPages;i++) { }}<option value="{{=i}}">Side {{=i}}</option>{{ } }}'+
		'</select>'+
		'<button id="nextpagebtn">&gt;</button>';
	var navRenderer = doT.template(navTemplate);

	function generate(numfound) {
		var rows = conf.solr.data.rows;
		numberOfPages = Math.ceil( numfound / rows );
		var currentFirst = (currentPage-1) * rows + 1;
		var currentLast = currentPage * rows;
		if(currentLast > numfound){ 
			currentLast = numfound; 
		}
		var navdata = {
			first: currentFirst,
			last: currentLast,
			numfound: numfound,
			numberOfPages: numberOfPages
		};
		var html = navRenderer(navdata);
		$('#pagenavigation').html(html);
		$("#selectpage").val(currentPage);
	}

	function go(pageNum) {
		currentPage = pageNum;
		conf.solr.data.start = (currentPage-1) * conf.solr.data.rows;
		$(document).trigger('doSearch');
	}

	function prev() {
		if( currentPage > 0 ) {
			go(--currentPage);
		}
	}

	function next() {
		if( currentPage < numberOfPages ) {
			go(++currentPage);
		}
	}

	return {
		generate: generate,
		go: go,
		prev: prev,
		next: next
	}
});