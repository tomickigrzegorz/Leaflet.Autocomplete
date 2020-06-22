# Leaflet.Autocomplete search outside map

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

[Live DEMO](https://tomik23.github.io/Leaflet.Autocomplete/)

Leaflet.Autocomplete is to expand the autosugestion plugin with the ability to geocode and show data on the map in the way you think you need. The search works off the map.

We can use remote api or static files, e.g. in the GeoJSON format, but there is nothing to prevent it from being a different format.

This example uses remote api for geocoding [NOMINATIM-API](https://nominatim.org/release-docs/latest/api/Search/) in GeoJSON format

This plugin has no dependencies.

## Usage

### HTML

```html
<div class="search">
  <input type="text" id="search"  placeholder="enter the city name">
</div>
```

### JS for AUTOCOMPLETE

All plugin configuration options are available at this [AUTOCOMPLETE](https://github.com/tomik23/autosuggest)

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
  
  dataAPI: {
  
    // searchLike:true 
    // if you want to add text dynamically to the address
    searchLike: true,
  
    // path to remote api
    path: 'https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=',

    // using a static file also works in this case the GeoJSON format
    // path: '../assets/search.json',
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
        return `<li data-elements='${json}'>
          <p>
            ${properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
          </p>
        </li > `;
      }
    }).join('');
  }
});
```

### JS for MAP

This part is responsible for showing the map, reading inline json with `data-elements` which after clicking was added to `#search`

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

// set new marker and remove previous
const markers = [];
function setNewMarkerAndRemoveOlder() {
  setTimeout(() => {
    const dataElements = document
      .querySelector('#search') // id of our input field for autocomplete
      .getAttribute('data-elements');

    // parse JSON
    const { pinlat, pinlng, name } = JSON.parse(dataElements);

    // create marker
    const marker = L.marker([pinlng, pinlat], {
      title: name,
    })
      .addTo(map)
      .bindPopup(name);

    // aad to array markers
    markers.push(marker);

    // set map center
    map.setView([pinlng, pinlat], 8);

    // remove previus marker
    if (markers.length > 1) {
      for (let i = 0; i < markers.length - 1; i++) {
        map.removeLayer(markers[i]);
      }
    }
  }, 500);
}

// event handling
function handleEvent(event) {
  event.stopPropagation();
  if (event.type === 'click' || event.type === 'keyup') {
    setNewMarkerAndRemoveOlder();
  }
}

// trigger events click or keyup
const coordinates = document.querySelector('.auto-output-search');
coordinates.addEventListener('click', handleEvent);
document.addEventListener('keyup', function (e) {
  e.preventDefault();
  if (e.keyCode === 13 && e.target.id === 'search') {
    handleEvent(e);
  }
});
```
## Other options

This example geocodes addresses, but nothing prevents you from showing polygons or other things on the map. Anything you add to `data-elements` can be handled by you and shown on the map.