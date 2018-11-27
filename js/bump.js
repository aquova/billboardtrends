
// Parse the Data
d3.csv("data/us_albums_short_cleaned.csv", function(data) {
    //us_albums_short_cleaned.csv

  data.forEach(function(d) {
    d['class'] = d['album'].toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_').replace(/[0-9]/g,'x');
  })


var margin = {top: 60, right: 10, bottom: 60, left: 60};

var width = 2000 - margin.left - margin.right,
    height = 4000 - margin.top - margin.bottom;
    
  var chart = d3.select('#chart-area')
      .append("svg")
      .attr("width", width + (margin.left+100) + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var brush = d3.select("#brush-area")
    .append("svg")
    .attr("width", width + (margin.left+100) + margin.right)
    .attr("height", 100 + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  //brush scales
  var xBrush = d3.scaleTime()
    .domain([new Date(2017, 1, 1), new Date(2018, 10, 20) - 1])
    .rangeRound([0, width]);

  //
  brush.append("g")
    .attr("class", "axis axis--grid")
    .attr("transform", "translate(0," + 100 + ")")
    .call(d3.axisBottom(xBrush)
        .ticks(d3.timeWeek)
        .tickSize(-100)
        .tickFormat(function() { return null; }))
  .selectAll(".tick")
    .classed("tick--minor", function(d) { return d.getHours(); });

  brush.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + 100 + ")")
    .call(d3.axisBottom(xBrush)
        .ticks(d3.timeMonth)
        .tickPadding(0))
    .attr("text-anchor", null)
  .selectAll("text")
    .attr("x", 6);

//   brush.append("g")
//     .attr("class", "brush")
//     .call(d3.brushX()
//         .extent([[0, 0], [width, 100]])
//         .handleSize([6])
//         .on("brush", brushed));

//   function brushed() {
//     if (d3.event.sourceEvent.type === "brush") return;
//     var d0 = d3.event.selection.map(xBrush.invert),
//         d1 = d0.map(d3.timeWeek.round);

//     // If empty when rounded, use floor instead.
//     if (d1[0] >= d1[1]) {
//       d1[0] = d3.timeWeek.floor(d0[0]);
//       d1[1] = d3.timeWeek.offset(d1[0]);
//     }

//     brush.select(this).call(d3.event.target.move, d1.map(xBrush));
// }

  //chart scales
  var x = d3.scaleBand()
      .domain(data.map(function(d) { return d['week']; }).reverse())
      .rangeRound([25, width - 15]);

  var dates = x.domain();
  firstWeek = dates[0]
  lastWeek = dates[dates.length-1]

  var y = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d['pos'] }), d3.max(data, function(d) { return d['pos']; })])
      .range([20, height/2 - 30]);

  var size = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d['num_weeks']; }))
      .range([3, 10]);

  var yrange = d3.scaleLinear()
      .domain([1,200])
      .range([20, height - 20]);

  var weeksMax = d3.max(data, function(d) { return d.num_weeks; })

  var colorScale  = d3.scaleLinear()
      .domain([0, 52]) 
      .range(['#810082', '#FFA500'])
      .interpolate(d3.interpolateRgb);

  var xAxis = d3.axisTop(x);

  var yAxis = d3.axisLeft(yrange)
    .ticks(200);

  chart.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(-"+ x.bandwidth()/2.0 +"," + 0 + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  chart.append("text")
    .text('Billboard 200: Albums')
    .attr("text-anchor", "middle")
    .attr("class", "graph-title")
    .attr("y", -30)
    .attr("x", width / 2.0);

  chart.append("text")
    .text('Rank')
    .attr("text-anchor", "middle")
    .attr("class", "graph-title")
    .attr("y", -35)
    .attr("x", width / -4.0)
    .attr("transform", "rotate(-90)");

  console.log(dates)


  var albums = d3.map(data, function(d) {
    return d['album'];
  }).keys();



  albums.forEach(function(album) {
    var currData = data.filter(function(d) {
      if(d['album'] == album) {
        return d;
      }
    });


    var lineFunc = d3.line()
        .x(function(d) { return x(d['week']); })
        .y(function(d) { return y(d['pos']); })
        .curve(d3.curveMonotoneX);

    chart.append("path")
        .attr("class", album.toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_').replace(/[0-9]/g,'x'))
        .attr("style", "fill:none") 
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("stroke-opacity", 0.1)
        .attr("d", lineFunc(currData));
  });

  
  var node = chart.append("g")
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "point")
    .attr("cx", function(d) { return x(d['week']); })
    .attr("cy", function(d) { return y(d['pos']); })
    .attr('fill', function(d) { return colorScale(d['num_weeks']); })
    .attr("class", function(d) { return d['album'].toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_').replace(/[0-9]/g,'x') })
    .attr("r", 6)
    .attr("stroke-width", 1.5);


  var text = chart.append("g")
    .selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", function(d) { if(d['week'] == lastWeek){
      return x(d['week'])+10}
      else{
        return x(d['week']-500)
      }
    })

    .attr("y", function(d) { return y(d['pos'])+5; })
    .style("fill", "black" )
    .attr("font-size", 15)
    .text(function(d) { if(d['week'] == lastWeek || d['week'] == lastWeek){
        return d['artist']+" - "+d['album']} 
        //console.log(d['week'])
    })
    
    
  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

  var selectedNode = d3.select(null);

  chart.selectAll("circle")
      .on("mouseover", function(d) {
        chart.selectAll('.' + d['class'])
          .classed('active', true);
        var tooltipData = "Album: " + d['album'] +
            "<br/>" + "Peak Position: " + d['peak'] +
            "<br/>" + "Weeks in top 200: " + d['num_weeks'] +
            "<br/>" + "Artist: " + d['artist'];

        tooltip.html(tooltipData)
            .style("visibility", "visible")
            .style("top", event.pageY - (tooltip.node().clientHeight + 5) + "px")
            .style("left", event.pageX - (tooltip.node().clientWidth / 2.0) + "px");

        d3.select(this).attr("r", 10);
        console.log('mouseover')          
      })
      .on("mousemove", function(d) {
       

      })
      .on("mouseout", function(d) {
        chart.selectAll('.'+d['class'])
            .classed('active', false);
        d3.select(this).attr("r", 6);
        //d3.select(this).moveToFront();
        //tooltip.style("visibility", "hidden");
        // var active  = tooltip.active ? false : true,
        //       visibility = active ? "visible" : "hidden";
        tooltip.style("visibility", "hidden");
            //tooltip.active = active;
      })
      .on('click', function(d) {
        chart.selectAll('.' + d['class'])
            .classed('click-active', function(d) {
              // if (d3.select(this).classed('click-active') == true) {
              //   path.attr('fill', "#9e9e9e")
              // }
              // else {
              //   path.attr('fill', function(d) { return colorScale(d.num_weeks); })
              // }
              // toggle state
              return !d3.select(this).classed('click-active');
            })

            //.attr('fill', function(d) { return colorScale(d['num_weeks']); })
            console.log(d[0])
            var tooltipData = "Album: " + d['album'] +
            "<br/>" + "Peak Position: " + d['peak'] +
            "<br/>" + "Weeks in top 200: " + d['num_weeks'] +
            "<br/>" + "Artist: " + d['artist'];
            tooltip.html(tooltipData)
            tooltip.style("top", event.pageY - (tooltip.node().clientHeight + 5) + "px")
            .style("left", event.pageX - (tooltip.node().clientWidth / 2.0) + "px");
            
            var active  = tooltip.active ? false : true,
              visibility = active ? "visible" : "hidden";
            tooltip.style("visibility", visibility);
            tooltip.active = active;
          chart.selectAll('path.'+d.class)

      })
});






