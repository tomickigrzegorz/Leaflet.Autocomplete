window.addEventListener('DOMContentLoaded', function () {
  // AUTOSUGGEST PART
  new Autosuggest('search', {
    howManyCharacters: 2,
    delay: 500,
    placeholderError: 'something went wrong...',
    clearButton: true,
    noResult: 'No result',
    dataAPI: {
      // enable if you want to add text
      // dynamically to the address
      searchLike: true,
      path: 'https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=',

      // using a static file also works 
      // in this case the GeoJSON format
      //path: './search.json',
    },
    // nominatim GeoJSON format
    htmlTemplate: function (matches) {
      const regex = new RegExp(matches.searchText, 'i');
      return matches.features.map((element, index) => {
        if (index < 5) {
          const { geometry, properties } = element;
          const [lat, lng] = geometry.coordinates;
          const jsonData = {
            pinlat: lat,
            pinlng: lng,
            name: properties.display_name
          }
          return `
          <li class="autocomplete-item loupe" data-elements='${JSON.stringify(jsonData)}' role="option" aria-selected="false" tabindex="-1">
            <p>
              ${properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
            </p>
        </li > `;
        }
      }).join('');
    },
    onSubmit: (matches) => {

      setTimeout(() => {
        const dataElements = document
          .querySelector('#search')
          .getAttribute('data-elements');

        // 
        const { pinlat, pinlng, name } = JSON.parse(dataElements);

        // custom id for marker
        const customId = Math.random();

        const marker = L.marker([pinlng, pinlat], {
          title: name,
          id: customId
        })
          .addTo(map)
          .bindPopup(name);

        map.setView([pinlng, pinlat], 8);

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


  // MAP PART
  const config = {
    minZoom: 4,
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

});