# gas-yorsearch-floorplanresolver

This repo holds files relating to the Floorplan Resolver Google Apps Script app written for YorSearch.
When a user searches YorSearch, Locate links are presented for the returned items. If the user clicks one of the links, they will be shown a floorplan image and some textual information about how to find the book in the Library.

The app works by querying a Google Sheet for the floorplan image URL and textual information, according to the URL parameters passed to it by the YorSearch link. The sheet then returns an image URL and textual information for display in the floorplan web page.
The Google Sheet is maintained by Library staff who are involved in stock moves etc, so the information can be kept up-to-date quite easily.

An Excel export of the Google Sheet — `Floorplan rules.xlsx` — is provided as a starting point for anyone wanting to implement this app; this could be imported back into a new Google Sheet and adapted as needed.

More information at https://developers.exlibrisgroup.com/blog/primo-floorplans-with-google-apps-script
