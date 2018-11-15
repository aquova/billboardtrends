// Code for the Stream graph, showing long-term changes in genre popularity

var margin = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10
}

var colorScale = d3.scaleOrdinal().range(d3.schemeCategory20c);

var width = document.body.clientWidth - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;
var dataset = {};

var div = d3.select("#streamgraph").append("div")
    .attr("width", width)
    .attr("height", height);

function getAndParseData() {

    var queue = d3.queue();
    var range = Array.from(new Array(78), (x,i) => i + 1941)

    range.forEach(function(year) {
        queue.defer(d3.csv, `data/charts/${year}.csv`);
    });

    queue.awaitAll(function(error, years) {

        for (const [i, year] of years.entries()) {
            var yearNum = i + 1941 + '';
            dataset[yearNum] = {};
            for (var song of year) {

                var genre = song['clean_genre'];
                if (genre in dataset[yearNum]) {
                    dataset[yearNum][genre] += 1;
                } else {
                    dataset[yearNum][genre] = 1;
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

