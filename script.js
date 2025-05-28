// Initialize the map
const map = L.map('map').setView([20, 0], 2);

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Fetch country geojson and add to map
fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
  .then(res => res.json())
  .then(data => {
    L.geoJSON(data, {
      onEachFeature: (feature, layer) => {
        layer.on('click', () => {
          const country = feature.properties.name;
          getCovidData(country);
        });
      },
      style: {
        color: '#333',
        weight: 1,
        fillColor: '#ccc',
        fillOpacity: 0.5
      }
    }).addTo(map);
  });

function getCovidData(country) {
  fetch(`https://disease.sh/v3/covid-19/countries/${country}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById('country-name').innerText = data.country || country;
      document.getElementById('cases').innerText = data.cases.toLocaleString();
      document.getElementById('deaths').innerText = data.deaths.toLocaleString();
      document.getElementById('recovered').innerText = data.recovered.toLocaleString();
    })
    .catch(() => {
      alert("Data not available for " + country);
    });
}
