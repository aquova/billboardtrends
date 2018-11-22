// Code for the Alluvial chart, the NFL-esque visualization of Top 100 songs
// This is V1 of code without node and link format.
var margin = {top: 40, right: 10, bottom: 60, left: 60};

var width = 4000 - margin.left - margin.right,
    height = 4000 - margin.top - margin.bottom;

var svg = d3.select('#alluvialgraph')
    	.append("svg")
    	.attr("width", width + margin.left + margin.right)
    	.attr("height", height + margin.top + margin.bottom)
    	.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

filePath = "data/us_albums_short_cleaned.csv"

var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

var path = sankey.links();

getData(filePath)

function getData(filePath) {
	d3.csv(filePath, function(error, data) {
	  if (error) throw error;

	  data.forEach(function(d) {
	  	d.pos = +d.pos;
	  	d.last_pos = +d.last_pos;
	  	d.peak = +d.peak;
	  	d.num_weeks = +d.num_weeks;
	  	d.week = +d.week;
	  });

	  draw(data)
	});
}

function draw(data) {
	// console.log(data)

	text = svg.selectAll("text")
		.data(data);

	text.enter().append("g").append("text")
		.attr("x", function(d, index) { return 300*(Math.floor((index+1)/200))} )// *floor(index/200)
		.attr("y", function(d) {return d.pos*30} )
		.text(function(d) { if(d.album.length > 25)
						    	return d.pos+". "+d.album.substring(0,25)+'...';
						    else
						        return d.pos+". "+d.album;} )
}
