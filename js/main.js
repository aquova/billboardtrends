// Main.js will read in the .psv data, then pass it along to the three other files.

var psv = d3.dsvFormat("|")

d3.request("../data/genre_raw.psv")
.mimeType("text/plain")
.response(function(data) {
    return psv.parse(data.responseText)
})
.get(function(data) {
    // Pass data along to other files
    mainTile(data)
})
