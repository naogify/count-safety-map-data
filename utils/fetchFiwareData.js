const { fetch } = require('undici');
const fiwareToGeojson = require('./fiwareToGeojson');

const baseURL = 'https://pf.smartcity-takamatsu.jp/orion/v2.0/entities'
const tokenUrl = 'https://pf.smartcity-takamatsu.jp/wso2am/oauth2/token';

const Authorization = `${process.env.FIWARE_CLIENT_ID}:${process.env.FIWARE_CLIENT_SECRET}`;
const BasicAuthorization = Buffer.from(Authorization).toString('base64')

const tokenHeaders = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Authorization': `Basic ${BasicAuthorization}`
};
const tokenBody = 'grant_type=client_credentials';

const fetchFiwareData = async (DATA_CATEGORIES) => {

  let featuresByCategory = {}

  const tokenResponse = await fetch(tokenUrl, { method: 'POST', headers: tokenHeaders, body: tokenBody, rejectUnauthorized: false })
  const tokenData = await tokenResponse.json();
  const access_token = tokenData.access_token;

  for (const dataCategory of DATA_CATEGORIES) {
    // 今回クエリーするtypeのcountは開発時、最大で70件ある。
    // 念の為 max=1000 と設定しているが、ページネーション実施していないので
    // FIWAREのデータが1000個以上超えるとここを改修しないと読み込まれません。
    const url = `${baseURL}?type=${dataCategory}&max=1000`;
    const headers = {
      'Authorization': `Bearer ${access_token}`,
      'Accept': 'application/json'
    };

    try {
      const response = await fetch(url, { headers });
      const data = await response.json();

      const features = fiwareToGeojson(data)
      featuresByCategory[`cityos-kawaga-takamatsu-${dataCategory}`] = features;

    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  return featuresByCategory;
}

module.exports = fetchFiwareData;