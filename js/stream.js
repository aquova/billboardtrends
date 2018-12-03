// Code for the Stream graph, showing long-term changes in genre popularity

var margin = {
    top: 10,
    right: 30,
    bottom: 30,
    left: 10
}

var colorScale = d3.scaleOrdinal().range(d3.schemeCategory20c);

var widthy = $(window).width() - margin.left - margin.right;
var heighty = 800 - margin.top - margin.bottom;
var dataset = [];
var percDataset;
var genreset = [];

var stream = d3.select("#streamgraph").append("div")
    .attr("width", widthy)
    .attr("height", heighty);

// Name effects
$('.our-name').hover(function() { 
    $(this).text($(this).attr('id')).fadeIn();
}, function() {
    $(this).text($(this).attr('name')).fadeIn();
});

mainStream();

function getAndParseData() {

    var queue = d3.queue();
    var range = Array.from(new Array(78), (x,i) => i + 1941)

    range.forEach(function(year) {
        queue.defer(d3.csv, `data/charts/${year}.csv`);
    });

    queue.awaitAll(function(error, years) {

        for (const [i, year] of years.entries()) {
            var yearNum = i + 1941 + '';

            thisYear = {};
            thisYear['total'] = 0;
            for (var song of year) {

                var genre = song['clean_genre'];
                thisYear['total']++;

                // Keep count of genre
                if (genre in thisYear) {
                    thisYear[genre] += 1;
                } else {
                    thisYear[genre] = 1;
                }

                // Keep track of seen genres
                if (genreset.indexOf(genre) === -1) {
                    genreset.push(genre);
                }

            }

            thisYear['year'] = yearNum
            dataset.push(thisYear);
        }

        for (var year of dataset){
            for (var genre of genreset) {
                if (!(genre in year)) {
                    year[genre] = 0;
                }
            }
        }

        // Convert dataset to percentages
        percDataset = createPercDataset(dataset);
        afterDataLoads();

    });

    

}

function mainStream() {
    getAndParseData();
}

function afterDataLoads() {
    constructStream();
    $(window).resize(function() {
        stream.selectAll('*').remove();
        constructStream();
    })
}

function createPercDataset(dataset) {

    for (var year of dataset) {
        for (var genre of genreset) {
            if (genre in year) {
                year[genre] = (year[genre] / year['total']) * 100;
            }
        }
    }

    return dataset;
}

function constructStream() {

    widthy = $(window).width() - margin.left - margin.right;

    // Create scales
    var format = d3.timeParse("%Y%m%d");
    var xScale = d3.scaleLinear()
        .domain(d3.extent(percDataset, function(d) { return +d['year']; }))
        .range([0, widthy - 2*margin.left - 2*margin.right]);


    var yScale = d3.scaleLinear()
        .range([0, heighty - 200]);

    var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    var yAxis = d3.axisLeft(yScale);

    // Generate area function from data
    var stack = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(genreset);

    var area = d3.area()
        .curve(d3.curveCardinal.tension(.2))
        .x(function(d) { return xScale(d.data['year']); })
        .y0(function(d) { return yScale(d[0]); })
        .y1(function(d) { return yScale(d[1]); });

    // Create svg and paths template
    var svg = stream.append("svg")
        .attr("width", widthy)
        .attr("height", heighty);
    var pathg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + ((heighty - 130)/2 + 130) + ")");

    var layers = stack(percDataset);

    // layers = layers.map(x => x.slice(0,-2));
    console.log(layers);

    yScale.domain([0, 100]);

    // Bind data to paths
    pathg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d); })
      .style("fill", function(d, i) { return colorScale(i); })
      .style("stroke", "none")
      .on("mouseover", (d) => { console.log(d.key) });

    // Tooltip on graph
    if (d3.select('#ethan-tip').size() == 0) {
        var tip = d3.select("body").append("div")
            .attr("class", "tooltip").attr('id','ethan-tip');
    } else {
        var tip = d3.select('#ethan-tip');
    }
    d3.selectAll('.layer').on("mousemove", function(d) {
        tip.text(d.key)
              .style("visibility", "visible")
              .style("top", event.pageY - (1.2*tip.node().clientHeight) + "px")
              .style("left", event.pageX - tip.node().clientWidth/2 + "px");
          });
    pathg.on('mouseout', function() { tip.style("visibility", "hidden"); } );

    // Append x axis below paths
    pathAx = pathg.append('g');
    pathAx.call(xAxis);
    pathAx.attr('transform','translate(0,290)').select('path').style('fill','none');

    // Create brush
    var brushScale = d3.scaleLinear();
    var brush = d3.brushX();
    var brushg = svg.append("g")
    .attr("class", "brush")
    .call(brush.extent([[margin.left,margin.top],[widthy - 2*margin.left - 2*margin.right,100 + margin.top]])
        .on("brush", function() {

        brushScale.domain([margin.left, widthy - 2*margin.left - 2*margin.right]);
        brushScale.range([1941,2018]);

        leftYear = brushScale(d3.event.selection[0]);
        rightYear = brushScale(d3.event.selection[1]);

        // Set minimum brush size
        if (rightYear - leftYear < 2) {
            brush.move(d3.select(this),[d3.event.selection[0],d3.event.selection[0]+(brushScale.invert(1995) - brushScale.invert(1993))]);
        }

        // Quantize brush selection
        // if (!Number.isInteger(leftYear) || !Number.isInteger(rightYear)){
        //     leftYear = Math.floor(leftYear);
        //     rightYear = Math.floor(rightYear);
        //     brush.move(d3.select(this),[brushScale.invert(Math.floor(leftYear)),brushScale.invert(Math.floor(rightYear))]);
        // }


        layers = stack(percDataset.slice(leftYear-1941, rightYear-1941 + 1));

        xScale
        .domain(d3.extent(percDataset.slice(leftYear-1941, rightYear-1941 + 1), function(d) { return +d['year']; }))
        .range([0, widthy - 2*margin.left - 2*margin.right]);

        pathg.selectAll(".layer")
            .data(layers)
            .attr("d", function(d) { return area(d); })
              .style("fill", function(d, i) { return colorScale(i); })
              .on("mouseover", (d) => { console.log(d.key) });

        var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));;
        pathAx.remove();
        pathAx = pathg.append('g');
        if (rightYear - leftYear < xScale.ticks().length) {
            xAxis.ticks(rightYear - leftYear);
        }
        pathAx.call(xAxis);
        pathAx.attr('transform','translate(0,290)')
            .select('path').style('fill','none');

    }));
    brush.on("end", function(){
        if (!d3.event.selection) {

            leftYear = 1941;
            rightYear = 2018;

            brushScale.domain([margin.left, widthy - 2*margin.left - 2*margin.right]);
            brushScale.range([1941,2018]);

            layers = stack(percDataset.slice(leftYear-1941, rightYear-1941));

            xScale
            .domain(d3.extent(percDataset.slice(leftYear-1941, rightYear-1941), function(d) { return +d['year']; }))
            .range([0, widthy - 2*margin.left - 2*margin.right]);

            pathg.selectAll(".layer")
                .data(layers)
                .attr("d", function(d) { return area(d); })
                  .style("fill", function(d, i) { return colorScale(i); })
                  .on("mouseover", (d) => { console.log(d.key) });

            var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));;
            pathAx.remove();
            pathAx = pathg.append('g');
            pathAx.call(xAxis);
            pathAx.attr('transform','translate(0,290)').select('path').style('fill','none');

        }
       
    });
    brushg.select('.overlay')
        .attr('height', 100)
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', widthy - 2*margin.left - 2*margin.right)
        .attr('fill', '#ddd');

    brushAx = brushg.append('g');
    brushAx.call(xAxis.ticks((2018-1941)/5));
    brushAx.attr('transform','translate('+margin.left+','+(margin.top+110)+')')
            .select('path').style('fill','none');

}

