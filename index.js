const fetch = require('node-fetch');
const features = [];
const config = require('./config.json');
const fetchFiwareData = require('./utils/fetchFiwareData');

async function loadFeatures() {

  const geojsonArray = config.data;

  for (let i = 0; i < geojsonArray.length; i++) {
    const item = geojsonArray[i];
    const sources = item.sources;

    if (item.type === "fiware") {
      const featuresByCategory = await fetchFiwareData(sources);

      for (const [key, value] of Object.entries(featuresByCategory)) {

        for (let j = 0; j < value.length; j++) {
          const feature = value[j];
          features.push(feature);
        }
      }
      
    } else {

      for (let j = 0; j < sources.length; j++) {

        let url = sources[j];
  
        if (url.startsWith("./")) {
          url = url.replace("./", "https://safetymap.takamatsu-fact.com/");
        }
  
        const response = await fetch(url);
        const data = await response.json();
  
        if (data.type === "FeatureCollection") {
          const geojsonFeatures = data.features;
          features.push(...geojsonFeatures);
        }
      }
    }
  }

  console.log(`合計のFeature数: ${ features.length }`); // features配列の長さを出力
}

loadFeatures(); // loadFeatures関数を呼び出す

