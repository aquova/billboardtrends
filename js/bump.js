minYear = 1984 //Can't go lower than this b/c 1984 is first year of Top 100
maxYear = 2018

var margin = {top: 60, right: 60, bottom: 60, left: 60};

window.addEventListener('load', bumpInit)

var width = $(window).width() -200 - margin.left - margin.right,
    height = 2000 - margin.top - margin.bottom;

var chart = d3.select('#chart-area')
    .append("svg")
    .attr("width", width +100 + (margin.left) + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("style", "display:block")
    .attr("style", "margin:auto")
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var brushArea = d3.select("#brush-area")
  .append("svg")
  .attr("width", $(window).width() -10- margin.left - margin.right)
  .attr("height", 400) 
  .attr("style", "display:block")
  .attr("style", "margin:auto")
  .append("g")

var selectedWeek = brushArea.append("g")
  .append("text")
  .style("fill", "black" )
  .attr("font-size", 15)
  .attr("x", 15)
  .attr("y", 250)
  .text("Week");

var selectedYear = brushArea.append("g")
  .append("text")
  .style("fill", "black" )
  .attr("font-size", 15)
  .attr("x", 15)
  .attr("y", 120)
  .text("Year");

var selectedWeek = brushArea.append("g")

d3.select("#timeDropdown")
  .attr("position", "absolute")
  .attr("center", 0)
  .attr("y", 350)
  .on("change",function(d){
    var selected = d3.select("#timeDropdown").node().value;
})

var tog = false

d3.select("#pathToggle")
  .on("click", function(d){
    if(tog == false){
      chart.selectAll("path").attr("stroke-opacity", 0)
      tog = true;
    }
    else {
      chart.selectAll("path").attr("stroke-opacity", .1)
      tog = false;
    }
  })

var colorScaleViz  = d3.scaleLinear()
      .domain([0, 300])  //incorrect
      .range(['#FFA500','#810082'])
      .interpolate(d3.interpolateHcl);

function bumpInit(){
  var bars = brushArea.selectAll(".bars")
    .data(d3.range(300), function(d) { return d; })
  .enter().append("rect")
    .attr("class", "bars")
    .attr("x", function(d, i) { return (i+(($(window).width() -10- margin.left - margin.right)/2)-200); })
    .attr("y", 300)
    .attr("height", 30)
    .attr("width", 1)
    .style("fill", function(d, i ) { return colorScaleViz(d); })

  var scaleText = brushArea.append("g")
    .append("text")
    .attr("class", "scaleText")
    .style("fill", "black" )
    .attr("font-size", 20)
    .attr("x", (($(window).width() -10- margin.left - margin.right)/2)-200)
    .attr("y", 360)
    .text("0         Weeks in Top 100         52+");

  var xScale = d3.scaleLinear()
        .domain([minYear, maxYear])
        .range([0, $(window).width() -100- margin.left - margin.right]);

  var xScaleWeek = d3.scaleLinear()
        .domain([1, 52])
        .range([0, $(window).width() -100- margin.left - margin.right]);

  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  var xAxisWeek = d3.axisBottom(xScaleWeek).tickFormat(d3.format("d"));

  var mySelections = {};

  var yearBrush = d3.brushX()
  .extent([[margin.left,0],[$(window).width() - 100 - margin.right,100]])
  .on("end", function() {
    selected = Math.floor(yearScale(d3.event.selection[0]));
    mySelections[0] = {selection: selected};
    var y = mySelections[0].selection
    readData(y, mySelections)
  })

  var g = brushArea.append("g").attr("class", "brush yearbrush").attr("style", "display:block").attr("style", "margin:auto").call(yearBrush)
  yearBrush.move(g, [yearScale.invert(2010), yearScale.invert(2011)])

  g.select('.overlay')
      .attr('height', 100)
      .attr('style', "display:block")
      .attr('style', "margin:auto")
      .attr('y', 0)
      .attr('width', $(window).width() - 100 - margin.left - margin.right)
      .attr('fill', '#ddd');

  brushAx = g.append('g');
  brushAx.call(xAxis);
  brushAx.attr("class", "axis").attr('transform','translate('+(margin.left)+','+(105)+')');

  var weekBrush = d3.brushX()
  .extent([[margin.left,130],[$(window).width() - 100 - margin.right, 230]])
  .on("end", function() {
    selected = Math.floor(weekScale(d3.event.selection[1]));
    mySelections[1] = {selection: selected};
    var y = mySelections[0].selection
    readData(y, mySelections)
  })

  var gg = brushArea.append("g").attr("class", "brush weekbrush").call(weekBrush)
  weekBrush.move(gg, [weekScale.invert(18), weekScale.invert(10)])

  gg.select('.overlay')
      .attr('height', 100)
      .attr('x', margin.left)
      .attr('y', 130)
      .attr('width', $(window).width() -100- margin.left - margin.right)
      .attr('fill', '#ddd');


  brushAx = gg.append('g');
  brushAx.call(xAxisWeek);
  brushAx.attr("class", "axis").attr('transform','translate('+margin.left+','+(245)+')');
}

//brush scales
var yearScale = d3.scaleLinear().domain([margin.left, $(window).width() -100- margin.left - margin.right]).range([minYear,maxYear])
var weekScale = d3.scaleLinear().domain([margin.left,$(window).width() -100- margin.left - margin.right]).range([52,8])

var xBrush = d3.scaleTime()
  .domain([new Date(maxYear-1, 1, 1), new Date(maxYear, 10, 20) - 1])
  .rangeRound([0, width]);

var xWidth = d3.scaleLinear()
  .range([0, width]);

function readData(year, mySelections) {
  var filepath = "data/charts/" + year + ".csv"
  d3.csv(filepath, function(data) {
    data.forEach(function(d) {
      d['chart_date'] = d['chart_date'].substring(0, 4)+"-"+d['chart_date'].substring(4,6)+"-"+d['chart_date'].substring(6, 8)
      d['class'] = d['artist'].toLowerCase().replace(/ /g, '-').replace(/[0-9]/g, 'a,b,c,d,e,f,g,h,i,j').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_')+d['track'].toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_');
      })

      bump(data, mySelections)
  })
}

function bump(data, mySelections) {
  weekRange = mySelections[1].selection
  data = data.slice(((weekRange*100)-800),(weekRange*100))
  chart.selectAll("node").remove()
  chart.selectAll("path").remove()
  chart.selectAll("circle").remove()
  chart.selectAll("text").remove()
  chart.selectAll(".x axis").remove()
  chart.selectAll(".y axis").remove()

  var x = d3.scaleBand()
      .domain(data.map(function(d) { return d['chart_date']; }).reverse())
      .rangeRound([25, $(window).width() -100- margin.left - margin.right]);

  var dates = x.domain();
  firstWeek = dates[0]
  lastWeek = dates[dates.length-1]

  var y = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d['this_week_position'] }), d3.max(data, function(d) { return d['this_week_position']; })])
      .range([20, height -20]);

  var size = d3.scaleLinear()
      .domain(d3.extent(data, function(d) { return d['total_weeks']; }))
      .range([3, 10]);

  var yrange = d3.scaleLinear()
      .domain([d3.min(data, function(d) { return d['this_week_position'] }), 100])
      .range([20, height]);

  var weeksMax = d3.max(data, function(d) { return d.total_weeks; })

  var colorScale  = d3.scaleLinear()
      .domain([0, 52])  
      .range(['#FFA500','#810082'])
      .interpolate(d3.interpolateHcl);

  var xAxis = d3.axisTop(x);

  var yAxis = d3.axisLeft(yrange)
    .ticks(100);

  chart.append("g")
      .style("sans-serif", "15px times")
      .attr("class", "x axis")
      .attr("transform", "translate(-"+ x.bandwidth()/2.0 +"," + 0 + ")")
      .call(xAxis);

  chart.append("g")
      .attr("class", "y axis")
      .call(yAxis);

  chart.append("text")
    .text('Billboard 100: Tracks')
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

  var tracks = d3.map(data, function(d) {
    return d['class'];
  }).keys();

  tracks.forEach(function(track) {
    var currData = data.filter(function(d) {
      if(d['class'] == track) {
          return d;
      }
    });

    var lineFunc = d3.line()
        .x(function(d) { return (x(d['chart_date'])); })
        .y(function(d) { return y(d['this_week_position']); })
        .curve(d3.curveMonotoneX);

    var path = chart.append("path")
        .attr("class", track)
        .attr("style", "fill:none")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 4)
        .attr("stroke-opacity", 0.1)
        .attr("d", lineFunc(currData));

    var totalLength = path.node().getTotalLength();

    var dur = d3.select("#timeDropdown").node().value;

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
          .duration(dur)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);
  });

  var node = chart.append("g")
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr("class", "point")
    .attr("cx", function(d) { return x(d['chart_date']); })
    .attr("cy", function(d) { return y(d['this_week_position']); })
    .attr('fill', function(d) { return colorScale(d['total_weeks']); })
    .attr("class", function(d) { return d['artist'].toLowerCase().replace(/[0-9]/g, 'a,b,c,d,e,f,g,h,i,j').replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_')+d['track'].toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_'); }) //.replace(/[0-9]/g,'x')
    .attr("r", 6)
    .attr("stroke-width", 1.5);

  var text = chart.append("g")
    .selectAll("text")
    .data(data)
    .enter().append("text")
    .attr("x", function(d) { if(d['chart_date'] == lastWeek){
      return x(d['chart_date'])+10}
      else{
        return x(d['chart_date']-500)
      }
    })

    .attr("y", function(d) { return y(d['this_week_position'])+5; })
    .style("fill", "black" )
    .attr("font-size", 15)
    .text(function(d) { if(d['chart_date'] == lastWeek || d['chart_date'] == lastWeek){
        if((d['artist']+" - "+d['track']).length > 27)
                return (d['artist']+" - "+d['track']).substring(0,20)+'...';
              else
                  return d['artist']+" - "+d['track'];}
    })

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip");

  var selectedNode = d3.select(null);

  chart.selectAll("circle")
      .on("mouseover", function(d) {
        chart.selectAll('.' + d['class'])
          .classed('active', true);
        var tooltipData = "Track: " + d['track'] + 
            "<br/>" + "Artist: " + d['artist'] +
            "<br/>" + "Peak Position: " + d['peak_position'] +
            "<br/>" + "Weeks in top 100: " + d['total_weeks'];

        tooltip.html(tooltipData)
            .style("visibility", "visible")
            .style("top", event.pageY - (tooltip.node().clientHeight + 5) + "px")
            .style("left", event.pageX - (tooltip.node().clientWidth / 2.0) + "px");

        d3.select(this).attr("r", 10);
      })
      .on("mousemove", function(d) {


      })
      .on("mouseout", function(d) {
        chart.selectAll('.'+d['class'])
            .classed('active', false);
        d3.select(this).attr("r", 6);
        tooltip.style("visibility", "hidden");
      })
      .on('click', function(d) {
        chart.selectAll('.' + d['class'])
            .classed('click-active', function(d) {
              return !d3.select(this).classed('click-active');
            })
      })

      var text = brushArea.select("selectedWeek").selectAll("text")
        .data(selected)
        .enter().append("text")
        .style("fill", "black" )
        .attr("font-size", 15)
        .attr("x", 40)
        .attr("y", 250)
        .text(function (d) { return d});
}





