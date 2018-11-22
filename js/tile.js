// Code for the Tile graph, which will weekly popularity in genres.
// Used this source as an initial template: https://bl.ocks.org/ganezasan/52fced34d2182483995f0ca3960fe228

var margin = {
    top: 40,
    right: 10,
    bottom: 10,
    left: 10
}
const tileWidth = 960
const tileHeight = 500
const tileScale = d3.scaleOrdinal().range(d3.schemeCategory20c)

var div = d3.select("#tilegraph").append("div")
    .attr("width", tileWidth)
    .attr("height", tileHeight)

function readData(year) {
    var filepath = "../data/charts/" + year + ".csv"
    d3.csv(filepath, function(data) {
        mainTile(data)
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
        var subgenre = d[i].clean_genre
        var genre = d[i].genre

        // If genre not already in list
        if (!(genres.includes(genre))) {
            var artistMap = {name: artist, value: 1}
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
                        var artistMap = {name: artist, value: 1}
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
                                            break
                                        }
                                    }
                                } else {
                                    var artistMap = {name: artist, value: 1}
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

function mainTile(raw_data) {
    var data = parseData(raw_data)

    var treemap = d3.treemap().size([tileWidth, tileHeight])
    var root = d3.hierarchy(data).sum((d) => d.value)
    var tree = treemap(root)

    var node = div.datum(root).selectAll(".node")
        .data(tree.leaves())
        .enter().append("div")
        .attr("class", "node")
        .style("left", (d) => d.x0 + "px")
        .style("top", (d) => d.y0 + "px")
        .style("width", (d) => Math.max(0, d.x1 - d.x0 - 1) + "px")
        .style("height", (d) => Math.max(0, d.y1 - d.y0 - 1) + "px")
        .style("background", (d) => tileScale(d.parent.data.name))
        // .text((d) => d.parent.data.name + " - " + d.data.name)
        .text((d) => d.parent.data.name)
}

readData("2012")
