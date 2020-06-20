window.addEventListener('DOMContentLoaded', function () {
  // AUTOSUGGEST PART
  new Autosuggest('search', {
    howManyCharacters: 2,
    delay: 500,
    placeholderError: 'something went wrong...',
    clearButton: true,
    dataAPI: {
      // enable if you want to add text
      // dynamically to the address
      searchLike: true,
      path: 'https://nominatim.openstreetmap.org/search?format=geojson&city=',

      // using a static file also works 
      // in this case the GeoJSON format
      // path: '../assets/search.json',
    },
    // nominatim GeoJSON format
    specificOutput: function (matches) {
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
          const json = JSON.stringify(jsonData);
          return `<li data-elements='${json}'>
          <p>
            ${properties.display_name.replace(regex, (str) => `<b>${str}</b>`)}
          </p>
        </li > `;
        }
      }).join('');
    }
  });


  // MAP PART
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
        .querySelector('#search')
        .getAttribute('data-elements');

      const { pinlat, pinlng, name } = JSON.parse(dataElements);

      const marker = L.marker([pinlng, pinlat], {
        title: name,
      })
        .addTo(map)
        .bindPopup(name);

      markers.push(marker);
      map.setView([pinlng, pinlat], 8);

      if (markers.length > 1) {
        for (let i = 0; i < markers.length - 1; i++) {
          map.removeLayer(markers[i]);
        }
      }
    }, 500);
  }

  // events
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
    // console.log(e.keyCode);
    if (e.keyCode === 13 && e.target.id === 'search') {
      handleEvent(e);
    }
  });

});