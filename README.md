# law-review-2
Creates a law journal homepage in a single-page app, with additional pages for online-only content.

This code works from the OAI-PMH feed provided by a Digital Commons institutional repository to produce an interactive single-page app for a law journal. It relies on code not yet published here to convert the OAI-PMH feed to a simple JSON file, and then uses the DataTables JQuery plugin to provide search and navigation. Similar code produces an index of online-only content for the journal's electronic supplement. 

The online only content begins life as HTML exported from Microsoft Word. The folder "HTML Conversion" contains a Chrome browser extension which cleans and augments the exported HTML. The folder "Online-Only Article" contains CSS and JavaScript to present the article on the Boston College website. 
