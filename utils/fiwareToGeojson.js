const extractValue = (property) => (
  typeof property === 'object' && 'value' in property ?
  property.value : property
);

const fiwareToGeojson = (data) => {

  const features = [];

  for (const item of data) {

    const geoPointKey = Object.keys(item).find(key => item[key]["type"] === "geo:point");
    const [lat, lon] = item[geoPointKey]["value"].replace(/\s+/g, "").split(",");

    // geojson feature を作成
    const feature = {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [parseFloat(lon), parseFloat(lat)]
      },
      "properties": {}
    };

    for (const [key, rawValue] of Object.entries(item)) {
      if (key === geoPointKey) continue; // 設置地点はジオメトリに含めたのでスキップ

      const value = extractValue(rawValue);
      if (key === 'id') {
        feature.id = value;
      } else {
        feature.properties[key] = value;
      }
    }

    features.push(feature);
  }

  return features;
}

module.exports = fiwareToGeojson;