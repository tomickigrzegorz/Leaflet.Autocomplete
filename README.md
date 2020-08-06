<h2 align="center">
Leaflet.Autocomplete GeoSearch outside map
</h2>

<p align="center">
  Leaflet.Autocomplete is to expand the autosugestion plugin with the ability to geocode and show data on the map in the way you think you need
</p>

<p align="center">
  <img src="https://img.shields.io/github/package-json/v/tomik23/Leaflet.Autocomplete">
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-green.svg">
  </a>
</p>

<p align="center">
  <img src="Leaflet.Autocomplete.png">
</p>


We can use remote api or static files, e.g. in the GeoJSON format, but there is nothing to prevent it from being a different format.

This example uses remote api for geocoding [NOMINATIM-API](https://nominatim.org/release-docs/latest/api/Search/) in GeoJSON format

This plugin has no dependencies.

This example is based on the library [autosuggest](https://github.com/tomik23/autosuggest) 

## Demo
See the demo - [example](https://tomik23.github.io/Leaflet.Autocomplete/)

## Usage

HTML

```html
<div class="search">
  <input type="text" autocomplete="off" id="search" class="full-width" placeholder="enter the city name">
</div>
```

CSS
```html
  <link rel="stylesheet" href="./autosuggest.min.css">
  <link rel="stylesheet" href="./global.min.css">
```

JS
```html
 <script src="./autosuggest.min.js"></script>
```

### JS for AUTOCOMPLETE

```js
// minimal configure
new Autosuggest('search', {
  // the number of characters entered should start searching
  howManyCharacters: 2,
  
  // delay without which the server would not survive ;)
  delay: 500, 

  // The parameter set to true adds a button to delete the text
  // from the input field, a small x to the right of the input field
  clearButton: true, 
  
  // shows the element if no results
  noResult: 'No result',

  dataAPI: {
  
    // searchLike:true 
    // if you want to add text dynamically to the address
    searchLike: true,
  
    // path to remote api
    path: 'https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=',

    // using a static file also works in this case the GeoJSON format
    // path: './search.json',
  },

  // nominatim GeoJSON format parse this part turns json into the list of
  // records that appears when you type.
  htmlTemplate: function (matches) {
    const regex = new RegExp(matches.searchText, 'i');
    return matches.features.map((element, index) => {

      // showing only 5 records
      if (index < 5) {
        const { geometry, properties } = element;
        const [lat, lng] = geometry.coordinates;
      
        // we create an object that we will insert into data-elements
        // on the input #search element
        const jsonData = {
          pinlat: lat,
          pinlng: lng,
          name: properties.display_name
        }
        // converts a JavaScript object or value to a JSON string
        const json = JSON.stringify(jsonData);
        
        // the most important part is data-elements with json
        // after clicking on li json is added to input field #search
        return `<li class="autocomplete-item loupe" data-elements='${json}' role="option" aria-selected="false" tabindex="-1">
          <p>
            ${properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
          </p>
        </li > `;
      }
    }).join('');
  },
  // we add an action to enter or click
  onSubmit: (matches) => {

    setTimeout(() => {
      // get data from input
      const dataElements = document
        .querySelector('#search')
        .getAttribute('data-elements');


      const { pinlat, pinlng, name } = JSON.parse(dataElements);

      // custom id for marker
      const customId = Math.random();

      // create marker and add to map
      const marker = L.marker([pinlng, pinlat], {
        title: name,
        id: customId
      })
        .addTo(map)
        .bindPopup(name);

      // sets the view of the map
      map.setView([pinlng, pinlat], 8);

      // removing the previous marker
      map.eachLayer(function (layer) {
        if (layer.options && layer.options.pane === "markerPane") {
          if (layer.options.id !== customId) {
            map.removeLayer(layer);
          }
        }
      });
    }, 500);
  }
});
```

### MAP initialization

```js
const config = {
  minZoom: 6,
  maxZomm: 18,
};
// magnification with which the map will start
const zoom = 3;

// coordinates
const lat = 52.22977;
const lng = 21.01178;

// calling map
const map = L.map('map', config).setView([lat, lng], zoom);

// Used to load and display tile layers on the map
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

```
## Other options

This example geocodes addresses, but nothing prevents you from showing polygons or other things on the map. Anything you add to `data-elements` can be handled by you and shown on the map.