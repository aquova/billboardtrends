# billboardtrends

Visualizing musical trends throughout time

Austin Bricker, Ethan Jaynes, Alex Cort

Webpage: https://washuvis.github.io/billboardtrends

Repository: https://github.com/washuvis/billboardtrends

Process Book: https://washuvis.github.io/billboardtrends/processbook.html

## File Descriptions

While most of the files contained within the repo were written by the three of us, there are some library files that we included locally. These include:

- `css/bootstrap.min.css`
- `js/jquery-3.3.1.min.js`
- Everything in `js/d3`
- Everything in `js/unpkg`

The raw data for our project was obtained from [UMD Music](http://www.umdmusic.com/) and [Last.fm](https://www.last.fm/api), and is located in the files `data/us_albums.psv` and `data/us_billboard.psv`. The files were then cleaned using Python scripts we wrote, and saved into the `data/charts` directory.

The `img` directory contains screenshots used in the Process Book.

The main bulk of the code we wrote relevant to the project is:

- `index.html`
- `css/style.css`
- `js/main.js`
- `js/tile.js`
- `js/alluvial.js`
- `js/stream.js`
- `js/tile.js`

## Non-Obvious Features

One feature that isn't self-explanitory is that if the user clicks on the stream graph (the 'Genres Over Time' tab), then a new page will open containing a Youtube video of a representative song from the year and genre that was clicked.

Another much smaller detail is that to obtain our student ID's from the main page, you simply hover over our names to reveal them.
