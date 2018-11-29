// Code for the Stream graph, showing long-term changes in genre popularity

var margin = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10
}

var colorScale = d3.scaleOrdinal().range(d3.schemeCategory20c);

var widthy = $(window).width() - margin.left - margin.right;
var heighty = 800 - margin.top - margin.bottom;
var dataset = [];
var genreset = [];

var stream = d3.select("#streamgraph").append("div")
    .attr("width", widthy)
    .attr("height", heighty);

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

        afterDataLoads();

    });

    

}

function mainStream() {
    getAndParseData();
}

function afterDataLoads() {
    constructStream();
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

    console.log(dataset);

    percDataset = createPercDataset(dataset);
    console.log(percDataset);

    dataset = percDataset;

    var format = d3.timeParse("%Y%m%d");
    var xScale = d3.scaleLinear()
        .domain(d3.extent(dataset, function(d) { return +d['year']; }))
        .range([0, widthy - 2*margin.left - 2*margin.right]);


    var yScale = d3.scaleLinear()
        .range([0, heighty - 300]);

    var xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));;
    var yAxis = d3.axisLeft(yScale);

    var stack = d3.stack()
        .offset(d3.stackOffsetSilhouette)
        .keys(genreset);

    var area = d3.area()
        .curve(d3.curveCardinal.tension(.2))
        .x(function(d) { return xScale(d.data['year']); })
        .y0(function(d) { return yScale(d[0]); })
        .y1(function(d) { return yScale(d[1]); });

    var svg = stream.append("svg")
        .attr("width", widthy)
        .attr("height", heighty);
    var pathg = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + (heighty+200)/2 + ")");

    var layers = stack(dataset);

    // layers = layers.map(x => x.slice(0,-2));
    console.log(layers);

    yScale.domain([0, 100]);

    pathg.selectAll(".layer")
      .data(layers)
    .enter().append("path")
      .attr("class", "layer")
      .attr("d", function(d) { return area(d); })
      .style("fill", function(d, i) { return colorScale(i); })
      .on("mouseover", (d) => { console.log(d.key) });

    pathAx = pathg.append('g');
    pathAx.call(xAxis);
    pathAx.attr('transform','translate(0,230)');

    var brush = svg.append("g")
    .attr("class", "brush")
    .call(d3.brushX().extent([[margin.left,margin.top],[widthy - 2*margin.left - 2*margin.right,100 + margin.top]])
        .on("brush", ()=>{
        leftYear = Math.floor(d3.event.selection[0] * (3/73) + 1940);
        rightYear = Math.floor(d3.event.selection[1] * (3/73) + 1940);
        layers = stack(dataset.slice(leftYear-1942, rightYear-1942));

        xScale
        .domain(d3.extent(dataset.slice(leftYear-1942, rightYear-1942), function(d) { return +d['year']; }))
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
        pathAx.attr('transform','translate(0,230)');

    }));
    brush.select('.overlay')
        .attr('height', 100)
        .attr('x', margin.left)
        .attr('y', margin.top)
        .attr('width', widthy - 2*margin.left - 2*margin.right)
        .attr('fill', '#ddd');

    brushAx = brush.append('g');
    brushAx.call(xAxis);
    brushAx.attr('transform','translate('+margin.left+','+(margin.top+110)+')');

}

