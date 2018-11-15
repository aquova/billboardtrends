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

function showGraph(graphName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(graphName).style.display = "block";
    evt.currentTarget.className += " active";
}

document.getElementById("defaultOpen").click()
