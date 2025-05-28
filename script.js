const map = L.map('map').setView([20, 0], 2);
let selectedYear = document.getElementById("year-select").value;
let chart;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

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
        fillColor: '#80cbc4',
        fillOpacity: 0.4
      }
    }).addTo(map);
  });

function getCovidData(country) {
  fetch(`https://disease.sh/v3/covid-19/historical/${country}?lastdays=all`)
    .then(res => res.json())
    .then(data => {
      const timeline = data.timeline || data;

      const casesByYear = {}, deathsByYear = {}, recoveredByYear = {};
      for (let date in timeline.cases) {
        const year = date.split('/')[2];
        const y = "20" + year;
        casesByYear[y] = (casesByYear[y] || 0) + timeline.cases[date];
        deathsByYear[y] = (deathsByYear[y] || 0) + timeline.deaths[date];
        recoveredByYear[y] = (recoveredByYear[y] || 0) + timeline.recovered[date];
      }

      const year = selectedYear;
      document.getElementById('country-name').innerText = data.country || country;
      document.getElementById('cases').innerText = (casesByYear[year] || 0).toLocaleString();
      document.getElementById('deaths').innerText = (deathsByYear[year] || 0).toLocaleString();
      document.getElementById('recovered').innerText = (recoveredByYear[year] || 0).toLocaleString();

      renderChart(casesByYear, deathsByYear, recoveredByYear);
    })
    .catch(() => {
      alert("Data not available for " + country);
    });
}

document.getElementById("year-select").addEventListener("change", function () {
  selectedYear = this.value;
});

function renderChart(cases, deaths, recovered) {
  const labels = Object.keys(cases).sort();
  const casesData = labels.map(y => cases[y] || 0);
  const deathsData = labels.map(y => deaths[y] || 0);
  const recoveredData = labels.map(y => recovered[y] || 0);

  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("chart"), {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Cases',
          data: casesData,
          borderColor: 'blue',
          fill: false
        },
        {
          label: 'Deaths',
          data: deathsData,
          borderColor: 'red',
          fill: false
        },
        {
          label: 'Recovered',
          data: recoveredData,
          borderColor: 'green',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'COVID-19 Data by Year' }
      }
    }
  });
}
