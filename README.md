# law-review-2
Creates a law journal homepage in a single-page app, with additional pages for online-only content.

This code works from the OAI-PMH feed provided by a Digital Commons institutional repository to produce an interactive single-page app for a law journal. It relies on code not yet published here to convert the OAI-PMH feed to a simple JSON file, and then uses the DataTables JQuery plugin to provide search and navigation. Similar code produces an index of online-only content for the journal's electronic supplement. 

The online only content begins life as HTML exported from Microsoft Word. The folder "HTML Conversion" contains a Chrome browser extension which cleans and augments the exported HTML. The folder "Online-Only Article" contains CSS and JavaScript to present the article on the Boston College website and requires Anchorme.js: https://alexcorvi.github.io/anchorme.js/.

This is a new version of the project at https://github.com/BCLawLibrary/law-review. That project includes code for harvesting the OAI-PMH feed to a Google Sheet. That is no longer our practice, but it is a functional and simple approach, so we plan to keep the old version available as well.

Requires JQuery, DataTables (https://datatables.net/); uses Google Sheets API V4 (https://developers.google.com/sheets/api).
