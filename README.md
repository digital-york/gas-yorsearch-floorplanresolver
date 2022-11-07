# gas-yorsearch-floorplanresolver

This repo holds files relating to the Floorplan Resolver Google Apps Script app written for YorSearch.
When a user searches YorSearch, Locate links are presented for the returned items. If the user clicks one of the links, they will be shown a floorplan image and some textual information about how to find the book in the Library.

The app works by querying a Google Sheet for the floorplan image URL and textual information, according to the URL parameters passed to it by the YorSearch link. The sheet then returns an image URL and textual information for display in the floorplan web page.
The Google Sheet is maintained by Library staff who are involved in stock moves etc, so the information can be kept up-to-date quite easily.

An Excel export of the Google Sheet — `Floorplan rules.xlsx` — is provided as a starting point for anyone wanting to implement this app; this could be imported back into a new Google Sheet and adapted as needed.

More information at https://developers.exlibrisgroup.com/blog/primo-floorplans-with-google-apps-script

#### Recommended process for updating the floorplan images

1. With this repo cloned locally, open the floorplan PDF file published by the Library in Acrobat Reader
2. Set the zoom level to 100%, if it's not already
3. Take a screenshot of the relevant floorplan and paste into your preferred graphics editor
4. You'll want to crop the image a bit, and resize roughly in line with the sizes of the existing images. Basically, reduce the size a little bit so that it doesn't force horizontal scrolling when the image is presented in the apps
5. Save the image as a `PNG`, overwriting the version in your local repo's `Floorplan images` folder. Do this for every floorplan in the PDF provided.
6. Visit https://tinypng.com and drag & drop the images onto the uploader widget. This should reduce the file sizes considerably.
7. A zip file of the images will then be made available to download. Download this and unpack the images, again overwriting the ones in your local repo's `Floorplan images` folder
8. Take the following steps using git:
    1. `git add .`
    2. `git commit`
    3. Write a suitable commit message
    4. `git push`
9. Take the following steps to deploy the new images to Google Drive:
    1. Navigate to the `floorplan_images` folder in Google Drive
    2. Drag & drop the images into the main pane of the browser window
    3. The updated images will be uploaded, versioned and maintain the same IDs, meaning no changes required to the image URLs in the Google Sheet
