$.getScript( "https://www.google.com/jsapi", function() {

  var graphLoaded = false;
  var target = 'customgraph';

  function loadGraph() {
    graphLoaded = true;
    google.load("visualization", "1", {packages:["corechart"], "callback": renderData});
  }

  function getDogs(query, fq, year) {
    $.ajax({
      url: 'http://uelnqpcuqqm3wy67dh8mf9l5.origin.no/dogservice/dogs/select',
      data: {
        wt:'json', 
        q: query,
        fq: fq,
        rows: 0
      },
      success: function(data) { 
        customData.data.push([year+'', data.response.numFound]);
        if(customData.data.length==customData.range+2) {
          drawChart();
        }
      },
      dataType: 'jsonp',
      jsonp: 'json.wrf'
    });
  }

  function renderData() {
    var it = customData;
    it.data.splice(1,999);
    for(y=it.year-it.range;y<=it.year;y++) {
      var response = getDogs('name:* '+it.query+' *', it.getYearSpan(y), y);
    }
  }

  function drawChart() {
      var graphdata = google.visualization.arrayToDataTable( customData.data );
      graphdata.sort([{column: 0}]);
      var div = document.createElement('div');
      document.getElementById(target).appendChild(div);
      var chart = new google.visualization['LineChart'](div);
      chart.draw(graphdata, { title: customData.title, width: 480, height: 240, colors: ['#428bca'] });
  }

  var customData = {
    title: 'Popularitet',
    query: '',
    year: 2013,
    range: 10,
    getYearSpan: function(year) {
      return 'born:['+year+'-01-01T00:00:00Z TO '+year+'-12-31T23:59:59Z]';
    },
    data: [
      ['År', '']
    ]
  }

  $('#graphform').submit(function(event) {
    event.preventDefault();
    document.getElementById(target).innerHTML = '';
    customData.query = document.getElementById('query').value;
    customData.data[0][1] = customData.query;
    customData.title = "Popularitet av " + customData.query + " som hundenavn";
    if(!graphLoaded) {
      loadGraph();
    } else {
      renderData();
    }
    return false;
  });

  function test() {
    console.log(graphLoaded); 
  }

});
