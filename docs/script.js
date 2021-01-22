window.addEventListener('DOMContentLoaded', function () {
  // autocomplete part
  new Autocomplete('search', {
    delay: 500,
    clearButton: true,
    selectFirst: true,
    howManyCharacters: 2,
    // onSearch
    onSearch: (input) => {
      // api
      const api = `https://nominatim.openstreetmap.org/search?format=geojson&limit=5&city=${encodeURI(input)}`;

      // You can also use static files
      // const api = './search.json'

      /**
       * jquery
       * If you want to use jquery you have to add the
       * jquery library to head html
       * https://cdnjs.com/libraries/jquery
       */
      // return $.ajax({
      //   url: api,
      //   method: 'GET',
      // })
      //   .done(function (data) {
      //     return data
      //   })
      //   .fail(function (xhr) {
      //     console.error(xhr);
      //   });

      // OR ----------------------------------

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

      // OR ----------------------------------

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
      const regex = new RegExp(input, 'gi');

      // if the result returns 0 we
      // show the no results element
      return matches === 0 ? input : matches
        .map((element) => {
          return `
          <li class="loupe">
            <p>
              ${element.properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
            </p>
          </li> `;
        }).join('');
    },

    onSubmit: (matches, input) => {
      const { display_name } = matches.properties;
      const [lat, lng] = matches.geometry.coordinates;
      // custom id for marker
      const customId = Math.random();

      const marker = L.marker([lng, lat], {
        title: display_name,
        id: customId
      });

      marker.addTo(map).bindPopup(display_name);

      map.setView([lng, lat], 8);

      map.eachLayer(function (layer) {
        if (layer.options && layer.options.pane === "markerPane") {
          if (layer.options.id !== customId) {
            map.removeLayer(layer);
          }
        }
      });

      console.log(input, matches);
    },

    // get index and data from li element after
    // hovering over li with the mouse or using
    // arrow keys ↓ | ↑
    onSelectedItem: (index, matches) => {
      console.log('onSelectedItem:', index, matches);
    },

    // the method presents no results
    // no results
    noResults: (input, resultRender) => resultRender(`<li>No results found: "${input}"</li>`),
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