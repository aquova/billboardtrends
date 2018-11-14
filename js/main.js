// Main.js will read in the .psv data, then pass it along to the three other files.

var psv = d3.dsvFormat("|")

d3.request("https://raw.githubusercontent.com/washuvis/billboardtrends/master/data/genre_raw.psv?token=AXcS7CuHkU_POy_25CXNceWWUCND5C3tks5b9ODdwA%3D%3D")
.mimeType("text/plain")
.response(function(data) {
    return psv.parse(data.responseText)
})
.get(function(data) {
    // Pass data along to other files
    mainTile(data)
})
