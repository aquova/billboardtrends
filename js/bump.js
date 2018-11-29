
// Parse the Data
d3.csv("data/us_albums_cleaned.csv", function(data) {
    //us_albums_short_cleaned.csv

  data.forEach(function(d) {
    d['class'] = d['artist'].toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_').replace(/[0-9]/g,'x')+d['album'].toLowerCase().replace(/ /g, '-').replace(/[.,\/#!$?%\^&\*;:{}=\-_`~()]/g,'z').replace(/&./g,'and').replace(/'./g,'').replace(/:./g,'-').replace(/\[/g,'_').replace(/\]/g,'_').replace(/[0-9]/g,'x');
  })

yearRange = [1970,2018]


var margin = {top: 60, right: 10, bottom: 60, left: 60};

var width = $(window).width() -200 - margin.left - margin.right,
    height = 4000 - margin.top - margin.bottom;
    
  var chart = d3.select('#chart-area')
      .append("svg")
      .attr("width", width +100 + (margin.left) + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var brushArea = d3.select("#brush-area")
    .append("svg")
    .attr("width", width+50)
    .attr("height", 350)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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

  var xScale = d3.scaleLinear()
        //.domain(d3.extent(data, function(d) { return +d['year']; }))
        .domain([1984, 2018])
        .range([0, width]);

  var xScaleWeek = d3.scaleLinear()
        .domain([1, 52])
        .range([0, width]);

  var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
  var xAxisWeek = d3.axisBottom(xScaleWeek).tickFormat(d3.format("d"));

  var mySelections = {};

  var yearBrush = brushArea.append("g")
    .attr("class", "yearbrush")
    .call(d3.brushX().extent([[margin.left,0],[width,100]])
        .on("end", ()=>{
        selected = Math.floor(yearScale(d3.event.selection[0]));
        // leftYear = Math.floor(d3.event.selection[0] * (3/73) + 1970);
        // rightYear = Math.floor(d3.event.selection[1] * (3/73) + 1970);
        //layers = stack(data.slice(leftYear-1970, rightYear-1970));

        // xScale
        // .domain(d3.extent(data.slice(leftYear-1970, rightYear-1970), function(d) { return +d['year']; }))
        // .range([0, width]);
        //var selectedMonth = weekBrush.select("weekbrush").select("text");
        
        //var selectedMonth = (d3.brushSelection(weekBrush.node()));

        //mySelections[this.id] = {start: selection[0], end: selection[1]};
        mySelections[0] = {selection: selected};
        //   if (selectedMonth.length > 0) {
        //       alert (id[0].value);
        // }
        // console.log(selected)
        //console.log("month")
        //console.log(selectedMonth[0])
        // pathg.selectAll(".layer")
        //     .data(layers)

        //     .attr("d", function(d) { return area(d); })
        //       .style("fill", function(d, i) { return colorScale(i); })
        //       .on("mouseover", (d) => { console.log(d.key) });
        bump(data)
        // var text = brushArea.select("selectedWeek").selectAll("text")
        //   .data(selected)
        //   .enter().append("text")
        //   .style("fill", "black" )
        //   .attr("font-size", 15)
        //   .attr("x", 40)
        //   .attr("y", 250)
        //   //.merge(text)
        //   .text(function (d) { return d});

        //text.exit().remove();

    }));
    yearBrush.select('.overlay')
        .attr('height', 100)
        .attr('x', margin.left)
        .attr('y', 0)
        .attr('width', width)
        .attr('fill', '#ddd');

    // brush.select('.selection')
    //   .call(brush)
    //   .call(brush.move, [5, 100]);


    brushAx = yearBrush.append('g');
    brushAx.call(xAxis);
    brushAx.attr("class", "axis").attr('transform','translate('+(margin.left)+','+(105)+')');


  var weekBrush = brushArea.append("g")
    .attr("class", "weekbrush")
    .call(d3.brushX().extent([[margin.left,130],[width, 230]])
        .on("end", ()=>{
        selected = Math.floor(weekScale(d3.event.selection[0]));
        //leftYear = Math.floor(d3.event.selection[0] * (3/73) + 1970);
        //rightYear = Math.floor(d3.event.selection[1] * (3/73) + 1970);
        //layers = stack(data.slice(leftYear-1970, rightYear-1970));

        //xScale
        //.domain(d3.extent(data.slice(leftYear-1970, rightYear-1970), function(d) { return +d['year']; }))
        //.range([0, width]);
        //mySelections[this.id] = {start: selection[0], end: selection[1]};
        //console.log(this.id)
        mySelections[1] = {selection: selected};
        bump(data)
        // console.log(selected)
        // console.log(mySelections)
        // pathg.selectAll(".layer")
        //     .data(layers)

        //     .attr("d", function(d) { return area(d); })
        //       .style("fill", function(d, i) { return colorScale(i); })
        //       .on("mouseover", (d) => { console.log(d.key) });

    }));
    weekBrush.select('.overlay')
        .attr('height', 100)
        .attr('x', margin.left)
        .attr('y', 130)
        .attr('width', width)
        .attr('fill', '#ddd');

    // brush.select('.selection')
    //   .call(brush)
    //   .call(brush.move, [5, 100]);


    brushAx = weekBrush.append('g');
    brushAx.call(xAxisWeek);
    brushAx.attr("class", "axis").attr('transform','translate('+margin.left+','+(245)+')');

  //brush scales
  var yearScale = d3.scaleLinear().domain([0, width]).range([1984,2018])
  var weekScale = d3.scaleLinear().domain([0,width]).range([52,8])



  var xBrush = d3.scaleTime()
    .domain([new Date(2017, 1, 1), new Date(2018, 10, 20) - 1])
    .rangeRound([0, width]);

  var xWidth = d3.scaleLinear()
    .range([0, width]);
  //
  // brush.append("g")
  //   .attr("class", "axis axis--grid")
  //   .attr("transform", "translate(0," + 100 + ")")
  //   .call(d3.axisBottom(xBrush)
  //       .ticks(d3.timeWeek)
  //       .tickSize(-100)
  //       .tickFormat(function() { return null; }))
  // .selectAll(".tick")
  //   .classed("tick--minor", function(d) { return d.getHours(); });

  // brush.append("g")
  //   .attr("class", "axis axis--x")
  //   .attr("transform", "translate(0," + 100 + ")")
  //   .call(d3.axisBottom(xBrush)
  //       .ticks(d3.timeMonth)
  //       .tickPadding(0))
  //   .attr("text-anchor", null)
  // .selectAll("text")
  //   .attr("x", 6);

  // brush.append("g")
  //   .attr("class", "brush")
  //   .call(brush.move, [xWidth(60), xWidth(120)]);
  //       //.extent([xBrush(Date(2017, 1, 1)), xBrush(Date(2018, 10, 20))])
  //       //.handleSize([6])
  //       //.on("brush", brushed));

  // function brushed() {
  //   if (d3.event.sourceEvent.type === "brush") return;
  //   var d0 = d3.event.selection.map(xBrush.invert),
  //       d1 = d0.map(d3.timeWeek.round);

  //   // If empty when rounded, use floor instead.
  //   if (d1[0] >= d1[1]) {
  //     d1[0] = d3.timeWeek.floor(d0[0]);
  //     d1[1] = d3.timeWeek.offset(d1[0]);
  //   }
    //brush.select(this).call(d3.event.target.move, d1.map(xBrush));
  // }

  // d3.selectAll('.brush>.handle').remove();

  //chart scales
  function bump(data) {
    var data2 = []
    var y = mySelections[0].selection
    data.forEach(function(d) {
      if (d['year'] == y) {
        data2.push(d);
        //console.log(d)
      }
    })

    weekRange = mySelections[1].selection
    // console.log(data2.length);
    //data = data2.slice(1600,3199)
    console.log((weekRange*200)-1599)
    console.log(weekRange*200)
    data = data2.slice(((weekRange*200)-1599),(weekRange*200))
    //data = data2.slice(((weekRange*200)-1799),(weekRange*200)-200)
    
    //data = data2;
    chart.selectAll("node").remove()
    chart.selectAll("path").remove()
    chart.selectAll("circle").remove()
    chart.selectAll("text").remove()
    chart.selectAll(".x axis").remove()
    chart.selectAll(".y axis").remove()

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
        .range(['#FFA500','#810082'])
        .interpolate(d3.interpolateRgb);

    var xAxis = d3.axisTop(x);

    var yAxis = d3.axisLeft(yrange)
      .ticks(200);

    chart.append("g")
        .style("sans-serif", "15px times")
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

    //console.log(dates)


    var albums = d3.map(data, function(d) {
      return d['class'];
    }).keys();


    //console.log(albums)

    albums.forEach(function(album) {
      var currData = data.filter(function(d) {
        if(d['class'] == album) {
            return d;  
        }
      });


      var lineFunc = d3.line()
          .x(function(d) { return x(d['week']); })
          .y(function(d) { return y(d['pos']); })
          .curve(d3.curveMonotoneX);

      var path = chart.append("path")
          .attr("class", album)
          .attr("style", "fill:none") 
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 4)
          .attr("stroke-opacity", 0.1)
          .attr("d", lineFunc(currData));

      var totalLength = path.node().getTotalLength();

      path
          .attr("stroke-dasharray", totalLength + " " + totalLength)
          .attr("stroke-dashoffset", totalLength)
          .transition()
            .duration(6000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

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
          //console.log('mouseover')          
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
              //console.log(d[0])
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

        var text = brushArea.select("selectedWeek").selectAll("text")
          .data(selected)
          .enter().append("text")
          .style("fill", "black" )
          .attr("font-size", 15)
          .attr("x", 40)
          .attr("y", 250)
          //.merge(text)
          .text(function (d) { return d});
  }
  
});






