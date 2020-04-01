'use strict';

const {google} = require('googleapis');
const {BigQuery} = require('@google-cloud/bigquery');
const path = require('path');

const dimensions = ["page","device","query"];
const siteUrl = 'YOUR SITE URL';

const gcpProjectId = 'YOUR GCP PROJECT ID';
const datasetId = 'YOUR Google BigQuery DATASET NAME';
const tableId = 'YOUR Google BigQuery TABLE NAME';

async function getSearchConsoleResults(startRow, entryDate) {

  // Create a new JWT client using the key file downloaded from the Google Developer Console
  const auth = new google.auth.GoogleAuth({
    keyFile: path.join(__dirname, 'jwt.keys.json'),
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
  });
  const client = await auth.getClient();

  const webmasters = google.webmasters({
    version: 'v3',
    auth: auth
  });

  const res = await webmasters.searchanalytics.query({
    siteUrl: siteUrl,
    requestBody: {
      startDate: entryDate,
      endDate: entryDate,
      dimensions: dimensions,
      rowLimit : 9500,
      startRow : startRow
    },
  });

  return res.data.rows;
}

async function runExport() {

  const bqOptions = {
     keyFile: path.join(__dirname, 'jwt.keys.json'),
     projectId : gcpProjectId
   };

  const bigquery = new BigQuery(bqOptions);

  var entryDate = '2020-01-02';

  var myArgs = process.argv.slice(2);
  if( myArgs[0].match(/^\d\d\d\d-(0[1-9]|1[0-2])-(0[1-9]|[1-2]\d|3[0-1])$/) ) {
    entryDate = myArgs[0];
  }

  console.log('Fetching data for ' + entryDate);

  var resultsData = {};

  var moreToFetch = true;

  var startRow = 0;


  while( moreToFetch ) {
    console.log('Begin loop, requesting 9500 from start ' + startRow );
    await getSearchConsoleResults(startRow, entryDate).then(result => {
      if( result.length < 9500 ) {
        moreToFetch = false;
        console.log( 'Returned fewer than 9500, final loop');
      }
      startRow = startRow + 9500;

      var returnedObjects = result;
      var returnedObjectsLength = returnedObjects.length;

      var resultsData = returnedObjects;

      Object.keys(resultsData).forEach(function(key, value) {
        if( resultsData[key].hasOwnProperty('keys')) {

          Object.keys(resultsData[key].keys).forEach(function(i) {

            var thisDimension = dimensions[i];
            var thisValue = resultsData[key].keys[i];
            resultsData[key][[thisDimension]] = thisValue;

          });
          resultsData[key].website = siteUrl;
          resultsData[key].entryDate = entryDate;

          delete resultsData[key].keys;
        }
      });

      bigquery
          .dataset(datasetId)
          .table(tableId)
          .insert(resultsData);
        console.log(`Inserted ${resultsData.length} rows`);

    });
  }

  return true
}

if (module === require.main) {
  runExport().catch(console.error);
}


// Exports for unit testing purposes
module.exports = {runExport};
