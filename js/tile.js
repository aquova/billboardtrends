// Code for the Tile graph, which will weekly popularity in genres.
// Used this source as an initial template: https://bl.ocks.org/ganezasan/52fced34d2182483995f0ca3960fe228

// These are percentages
const tileWidth = 100
const tileHeight = 100
const tileScale = d3.scaleOrdinal().range(d3.schemeCategory20c)
var loadedWidth

var tileXscale = d3.scaleLinear().domain([0, tileWidth]).range([0, tileWidth])
var tileYscale = d3.scaleLinear().domain([0, tileHeight]).range([0, tileHeight])
var div = d3.select("#tilegraph")

window.onload = function() {
    var brushSection = d3.select("#tilebrush").append("svg").attr("height", 70).attr("width", "100%")
    // This needs to be made dynamic
    loadedWidth = document.getElementById("tilegraph").clientWidth
    var brushScale = d3.scaleLinear().domain([0, loadedWidth]).range([1941, 2018])

    var brush = d3.brushX()
    .extent([[0, 0],[loadedWidth, 50]])
    .on("end", function() {
        var avgSelection = (d3.event.selection[0] + d3.event.selection[1]) / 2
        var new_year = Math.floor(brushScale(avgSelection)).toString()
        readData(new_year)
    })

    var g = brushSection.append("g").attr("class", "brush tileBrush").call(brush)
    brush.move(g, [brushScale.invert(2012), brushScale.invert(2013)])

    var yearLabel = brushSection.append("g")
        .append("text")
        .style("fill", "black")
        .attr("font-size", 15)
        .attr("x", 15)
        .attr("y", 15)
        .text("Year")

    var visScale = d3.scaleLinear().domain([1941, 2018]).range([0, loadedWidth])

    var xAxis = d3.axisBottom(visScale).tickFormat(d3.format("d"))
    var brushAxis = brushSection.append("g").call(xAxis)
    brushAxis.attr("transform", "translate(0," + 50 + ")").attr("fill", "black")

    readData("2012")
}

function readData(year) {
    var filepath = "data/charts/" + year + ".csv"
    d3.csv(filepath, function(data) {
        mainTile(year, data)
    })
}

function parseData(d) {
    var output = []
    // Arrays to keep track of what has already been found
    var genres = []
    var subgenres = []
    var artists = []
    for (var i = 0; i < d.length; i++) {
        var artist = d[i].artist
        var genre = d[i].clean_genre
        var subgenre = d[i].genre
        var track = d[i].track
        var pos = d[i].peak_position

        // If genre not already in list
        if (!(genres.includes(genre))) {
            var artistMap = {name: artist, songs: [track], highest: pos, value: 1}
            var subgenreMap = {name: subgenre, children: [artistMap]}
            var genreMap = {name: genre, children: [subgenreMap]}
            genres.push(genre)
            subgenres.push(subgenre)
            artists.push(artist)

            output.push(genreMap)
        } else {
            // If genre in list, but subgenre is not
            if (!(subgenres.includes(subgenre))) {
                // Search through genres to find the one that we need
                for (var j = 0; j < output.length; j++) {
                    if (output[j]["name"] == genre) {
                        var artistMap = {name: artist, songs: [track], highest: pos, value: 1}
                        var subgenreMap = {name: subgenre, children: [artistMap]}
                        artists.push(artist)
                        subgenres.push(subgenre)

                        output[j]["children"].push(subgenreMap)
                        break
                    }
                }
            } else {
                // If genre and subgenre are in list, but the artist is not. Even if artist appears more than once on Billboard, include them so they're weighted more
                // Once again, search for map where artist should belong
                for (var a = 0; a < output.length; a++) {
                    if (output[a]["name"] == genre) {
                        for (var b = 0; b < output[a]["children"].length; b++) {
                            if (output[a]["children"][b]["name"] == subgenre) {
                                if (artists.includes(artist)) {
                                    for (var c = 0; c < output[a]["children"][b]["children"].length; c++) {
                                        if (output[a]["children"][b]["children"][c]["name"] == artist) {
                                            output[a]["children"][b]["children"][c]["value"] += 1
                                            output[a]["children"][b]["children"][c]["highest"] = Math.min(output[a]["children"][b]["children"][c]["highest"], pos)
                                            if (!(output[a]["children"][b]["children"][c]["songs"].includes(track))) {
                                                output[a]["children"][b]["children"][c]["songs"].push(track)
                                            }
                                            break
                                        }
                                    }
                                } else {
                                    var artistMap = {name: artist, songs: [track], highest: pos, value: 1}
                                    artists.push(artist)
                                    output[a]["children"][b]["children"].push(artistMap)
                                    break
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return {"name": "data", "children": output}
}

function mainTile(year, raw_data) {
    // Removing any elements from the last dataset
    div.selectAll(".node").remove()
    // brushSection.selectAll("g").remove()

    var data = parseData(raw_data)

    d3.select("#tileTitle").text(year)

    var treemap = d3.treemap()
        .size([tileWidth, tileHeight])

    var root = d3.hierarchy(data)
        // For equal representation
        // .sum(function(d) {
        //     return d.value ? 1 : 0
        // })
        .sum((d) => d.value)
    var tree = treemap(root)

    var cells = div.selectAll(".node")
        .data(root.descendants())
        .enter()
        .append("div")
        .attr("class", function(d) {
            return "node level-" + d.depth
        })
        .attr("title", function(d) {
            return d.data.name
        })

    cells.style("left", function(d) {
        return tileXscale(d.x0) + "%"
    })
    .style("top", function(d) {
        return tileYscale(d.y0) + "%"
    })
    .style("width", function(d) {
        return tileXscale(d.x1) - tileXscale(d.x0) + "%"
    })
    .style("height", function(d) {
        return tileYscale(d.y1) - tileYscale(d.y0) + "%"
    })
    .style("background-color", function(d) {
        while (d.depth > 2) {
            d = d.parent
        }
        return tileScale(d.data.name)
    })
    .on("click", zoom)

    var textLabels = cells.append("p")
    .attr("class", "label")
    .text(function(d) {
        return d.data.name ? d.data.name : "---"
    })

    var extendedLabels = cells.append("p")
    .attr("class", "label hide")
    .text(function(d) {
        if (d.depth == 3) {
            var constuctedName = d.data.name + " - " + d.data.songs[0]
            for (var i = 1; i < d.data.songs.length; i++) {
                constuctedName += ", " + d.data.songs[i]
            }
            constuctedName += " - Peak position: " + d.data.highest

            return constuctedName
        }
        return ""
    })

    var parent = d3.select(".up")
    .datum(root)
    .on("click", zoom)

    // The zooming behavior was based off of here: https://codepen.io/znak/pen/qapRkQ?editors=0010
    function zoom(d) {
        var currentDepth = d.depth
        parent.datum(d.parent || root)
        tileXscale.domain([d.x0, d.x1])
        tileYscale.domain([d.y0, d.y1])

        var t = d3.transition()
        .duration(800)
        .ease(d3.easeCubicOut)

        cells.transition(t)
        .style("left", function(d) {
            return tileXscale(d.x0) + "%"
        })
        .style("top", function(d) {
            return tileYscale(d.y0) + "%"
        })
        .style("width", function(d) {
            return tileXscale(d.x1) - tileXscale(d.x0) + "%"
        })
        .style("height", function(d) {
            return tileYscale(d.y1) - tileYscale(d.y0) + "%"
        })

        // Hide this depth and above
        cells.filter(function(d) {
            return d.ancestors()
        })
        .classed("hide", function(d) {
            return d.children ? true : false
        })

        cells.filter(function(d) {
            return d.depth > currentDepth
        })
        .classed("hide", false)

        // Hide/show extended info if final leaf
        textLabels.filter(function(d) {
            return d.depth == 3
        })
        .classed("hide", function() {
            return currentDepth == 3
        })

        extendedLabels.filter(function(d) {
            return d.depth == 3
        })
        .classed("hide", function() {
            return d.depth != 3
        })
    }
}

