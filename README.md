# search-console-bigquery
Tool to export data from Google Search Console and stream them to Google BigQuery

## Getting started
### Before you begin
* [Select or create a Cloud Platform project](https://console.cloud.google.com/project).
* [Enable the Google Cloud BigQuery API](https://console.cloud.google.com/flows/enableapi?apiid=bigquery.googleapis.com).
* [Enable the Google Search Console API](https://console.cloud.google.com/flows/enableapi?apiid=webmasters.googleapis.com)
* [Set up authentication with a service account](https://cloud.google.com/docs/authentication/getting-started) so you can access the API from your local workstation.
* [Add service account to your property in Google Search Console](https://search.google.com/search-console/users). 

### Installing the client library
The tool is dependent on a Google API library that is distributed on `npm`. In order to add it as a dependency, run the following command:
``` sh
$ npm install googleapis
```

Then install all remaining dependencies:
``` sh
$ npm install
```

## Running
The script takes a date as argument. If you don't provide a date, the script uses the hard coded date. For now.
``` sh
$ node search-console.js 2020-04-01
```
