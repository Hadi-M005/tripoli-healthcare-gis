const map = L.map('map').setView([34.44, 35.84], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

const boundary = L.geoJSON(null, {
  style: { color: '#222', weight: 2, fillOpacity: 0 }
}).addTo(map);

fetch('data/boundaries.geojson')
  .then(res => res.json())
  .then(data => {
    boundary.addData(data);
    map.fitBounds(boundary.getBounds());
  });

  const buffer500 = L.geoJSON(null, {
  style: { color: '#7b2d8e', weight: 2, fillOpacity: 0, dashArray: '6 4' }
}).addTo(map);

fetch('data/buffer_500m.geojson')
  .then(res => res.json())
  .then(data => buffer500.addData(data));


  const buffer1km = L.geoJSON(null, {
  style: { color: '#804800', weight: 2, fillOpacity: 0, dashArray: '6 4' }
}).addTo(map);

fetch('data/buffer_1km.geojson')
  .then(res => res.json())
  .then(data => buffer1km.addData(data));

  /*const buildings_beyond1km = L.geoJSON(null, {
  style: { color: '#aa1a1a', weight: 1, fillOpacity: 0.5 }
}).addTo(map);
fetch('data/buildings_beyond_1km.geojson')
  .then(res => res.json())
  .then(data => buildings_beyond1km.addData(data));


  const buildings_within500m = L.geoJSON(null, {
  style: { color: '#807f7fe5', weight: 1, fillOpacity: 0.5 }
}).addTo(map);
fetch('data/buildings_within_500m.geojson')
  .then(res => res.json())
  .then(data => buildings_within500m.addData(data));

  const buildings_within_500m_1km = L.geoJSON(null, {
  style: { color: '#bfc47e', weight: 1, fillOpacity: 0.5 }
}).addTo(map);
fetch('data/buildings_within_500m-1km.geojson')
  .then(res => res.json())
  .then(data => buildings_within_500m_1km.addData(data));*/

  const facilityColors = {
  hospital: '#d62728',
  clinic: '#1f77b4',
  pharmacy: '#2ca02c'
};

const facilities = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => {
   return L.circleMarker(latlng, {
      radius: 6,
      fillColor: facilityColors[feature.properties.amenity] || '#999',
      color: '#000',
      weight: 1,
      fillOpacity: 0.8
    });
  },
   onEachFeature: (feature, layer) => {
    const p = feature.properties;

    // Property names with a colon need bracket notation
    const name = p['name:en'] || p.name || 'Unnamed facility';

    // Capitalize 
    const type = p.amenity
      ? p.amenity.charAt(0).toUpperCase() + p.amenity.slice(1)
      : 'Healthcare facility';

    let text = `<strong dir="auto">${name}</strong><br>${type}`;

    
    if (p['name:en'] && p.name && p.name !== p['name:en']) {
      text += `<br><span dir="auto">${p.name}</span>`;
    }

        // Hover 
    const baseRadius = layer.options.radius;
    layer.on('mouseover', () => {
      layer.setStyle({ weight: 3 });
      layer.setRadius(baseRadius + 3);
    });
    layer.on('mouseout', () => {
      layer.setStyle({ weight: 1 });
      layer.setRadius(baseRadius);
    });

    layer.bindPopup(text);
  

  
   }})
.addTo(map);

fetch('data/healthcare_facilities.geojson')
  .then(res => res.json())
  .then(data => facilities.addData(data));



  const overlays = {
  'Healthcare facilities': facilities,
  '500 m buffer': buffer500,
  '1 km buffer': buffer1km,
  'Study area': boundary
};
L.control.layers(null, overlays).addTo(map);


const legend = L.control({ position: 'bottomright' });

legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'legend');
  div.innerHTML = `
    <h4>Legend</h4>
    <div class="legend-title">Healthcare facilities</div>
    <div><span class="dot" style="background:#d62728"></span>Hospital</div>
    <div><span class="dot" style="background:#1f77b4"></span>Clinic</div>
    <div><span class="dot" style="background:#2ca02c"></span>Pharmacy</div>
    <div class="legend-title">Distance zones</div>
    <div><span class="line" style="border-top-color:#7b2d8e"></span>500 m buffer</div>
    <div><span class="line" style="border-top-color:#1f78b4"></span>1 km buffer</div>
    <div><span class="line solid" style="border-top-color:#222"></span>Study area</div>
  `;
  return div;
};

legend.addTo(map);


const info = L.control({ position: 'topleft' });

info.onAdd = function () {
  const div = L.DomUtil.create('div', 'info-box');
  div.innerHTML = `
    <h3>Healthcare Accessibility in Tripoli, Lebanon</h3>
    <p>This map shows the mapped hospitals, clinics, and pharmacies in Tripoli,
    with 500 m and 1 km distance zones around them. Click a marker for the
    facility name and type, and use the layer control to switch layers on or off.</p>
    <p class="note"><strong>Limitations:</strong> distances are straight-line, not
    travel routes; only 14 facilities are mapped; OpenStreetMap coverage is uneven.</p>
  `;
  // Stop map clicks and scrolling from triggering when using the box
  L.DomEvent.disableClickPropagation(div);
  L.DomEvent.disableScrollPropagation(div);
  return div;
};

info.addTo(map);