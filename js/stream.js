// Code for the Stream graph, showing long-term changes in genre popularity

var emargin = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 20
}

var colorScale = d3.scaleOrdinal().range(d3.schemeCategory20c);

var widthy = $(window).width() - emargin.left - emargin.right;
var heighty = 800 - emargin.top - emargin.bottom;
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

    widthy = $(window).width() - emargin.left - emargin.right;

    // Create scales
    var format = d3.timeParse("%Y%m%d");
    var xScale = d3.scaleLinear()
        .domain(d3.extent(percDataset, function(d) { return +d['year']; }))
        .range([0, widthy - emargin.left - emargin.right]);


    var yScale = d3.scaleLinear()
        .range([0, heighty - 250]);

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
        .attr("transform", "translate(" + emargin.left + "," + ((heighty - 100)/2 + 100) + ")");

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
      .style("cursor",'pointer')
      .on("mouseover", (d) => { console.log(d.key) });

// HOVER BEHAVIOR

    // Tooltip on graph
    if (d3.select('#ethan-tip').size() == 0) {
        var tip = d3.select("body").append("div")
            .attr("class", "tooltip").attr('id','ethan-tip');
    } else {
        var tip = d3.select('#ethan-tip');
    }
    d3.selectAll('.layer').on("mousemove", function(d) {
        d3.select(event.target).style('opacity','.9');
        cursor.style('visibility','visible');
        cursor.attr('x1', event.pageX-60);
        cursor.attr('x2', event.pageX-60);
        tip.text(Math.floor(xScale.invert(event.pageX-60))+" "+d.key)
              .style("visibility", "visible")
              .style("top", event.pageY - (1.2*tip.node().clientHeight) + "px")
              .style("left", event.pageX - tip.node().clientWidth/2 + "px");
    });
    d3.selectAll('.layer').on("mouseout", function() { d3.select(event.target).style('opacity','1'); });


    d3.selectAll('.layer').on("click", function(d) {
        var query = d.key;
        if (query.includes('/')) {
            query = d.key.split('/')[Math.round(Math.random())];
        }

        var win = window.open();
        $.ajax({
            url: `https://cors-anywhere.herokuapp.com/https://www.youtube.com/results?search_query=${Math.floor(xScale.invert(event.pageX-60))}+${query}`,
            success: function(resp) {
                win.location.href = `https://www.youtube.com/${resp.match(/watch\?v=.*?"/)}`
            }
        });

    });

    // Cursor line on graph
    var cursor = pathg.append('line')
        .attr('x1',50)
        .attr('x2',50)
        .attr('y1',-1*(heighty - 250)/2)
        .attr('y2',(heighty - 250)/2)
        .attr('stroke','white')
        .style('pointer-events','none')
        .style('visibility','none');

    pathg.on('mouseout', function() { 
        tip.style("visibility", "hidden"); 
        cursor.style('visibility','hidden');
    } );

    // Append x axis below paths
    pathAx = pathg.append('g');
    pathAx.call(xAxis);
    pathAx.attr('transform','translate(0,270)').select('path').style('fill','none');

    // Create brush
    var brushScale = d3.scaleLinear();
    var brush = d3.brushX();
    console.log(emargin);
    var brushg = svg.append("g")
    .attr("class", "brush")
    .call(brush.extent([[emargin.left,emargin.top],[widthy-emargin.right,100 + emargin.top]])
        .on("brush", function() {

        // Prevent d3.move from calling the on-brush function
        if (!d3.event.sourceEvent) return;

        brushScale.domain([emargin.left, widthy - emargin.left - emargin.right]);
        brushScale.range([1941,2018]);

        leftYear = brushScale(d3.event.selection[0]);
        rightYear = brushScale(d3.event.selection[1]);
        console.log(this);
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
        .range([0, widthy - emargin.left - emargin.right]);

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

    var onDeselect = function() {
        
            leftYear = 1941;
            rightYear = 2018;

            brushScale.domain([emargin.left, widthy - emargin.left - emargin.right]);
            brushScale.range([1941,2018]);

            layers = stack(percDataset.slice(leftYear-1941, rightYear-1941));

            xScale
            .domain(d3.extent(percDataset.slice(leftYear-1941, rightYear-1941), function(d) { return +d['year']; }))
            .range([0, widthy - emargin.left - emargin.right]);

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

    brush.on("end", function() {
        if (!d3.event.selection) {
            onDeselect();
        }
    });
    $(document).on('click', function(e) {
        if (!$('.brush').is(e.target) && !d3.select(e.target).classed('layer') && 
            d3.select(brushg).node().select('.selection') != null) {
            brush.move(d3.select(brushg.node()), null);
            onDeselect();
        }
    });
    brushg.select('.overlay')
        .attr('height', 100)
        .attr('x', emargin.left)
        .attr('y', emargin.top)
        .attr('width', widthy - emargin.left - emargin.right)
        .attr('fill', '#ddd');

    brushAx = brushg.append('g');

    // responsive tick intervals
    if (parseInt(widthy/50) < brushScale.ticks().length) {
        brushAx.call(xAxis.ticks(parseInt(widthy/50)));
    } else {
        brushAx.call(xAxis.ticks((2018-1941)/5));
    }
    brushAx.attr('transform','translate('+emargin.left+','+(emargin.top+110)+')')
            .select('path').style('fill','none');


}

