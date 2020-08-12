window.addEventListener('DOMContentLoaded', function () {
  // AUTOSUGGEST PART
  new Autosuggest('search', {
    delay: 500,
    clearButton: true,
    howManyCharacters: 2,
    // onSearch
    onSearch: (input) => {
      // You can also use static files
      // const api = '../static/search.json'
      const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&q=${encodeURI(input)}`;

      /**
       * axios
       * If you want to use axios you have to add the
       * axios library to head html
       * https://cdnjs.com/libraries/axios
       */
      // return axios.get(api)
      //   .then((response) => {
      //     return response.data;
      //   })
      //   .catch(error => {
      //     console.log(error);
      //   });

      /**
       * Promise
       */
      return new Promise((resolve) => {
        fetch(api)
          .then(response => response.json())
          .then(data => {
            resolve(data.features)
          })
          .catch(error => {
            console.error(error);
          })
      })
    },
    // nominatim GeoJSON format
    onResults: (matches, input) => {
      const regex = new RegExp(input, 'i');
      return matches.map((element, index) => {
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