This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
# Neighbourhood Map Project

This application allows you to view detailed information about 5 places, marked on the map of
Bangalore. The information can be viewed in the following 2 ways.
  - Clicking on the markers opens an info window that gives a photo and address of the place.
  - Clicking on the name of the place from the list in the side bar gives extra information.
  - Input text that filters the places and respective markers.

## Available Scripts
- public
  - index.html (Loads all HTML from the react framework)
  - service-worker-custom.js (Custom service worker created to cache files and service requests offline.)
- src
  - App.js (Takes care of loading the map into the react framework and calling foursquare API to update state variable
            with place related information)
  - InfoWindow.js (Gets the API data from its parent (App) and does place list and marker updation on user events)
  - App.css (style the application)
  - index.js (Loads the react framework into the root id DOM element, also registers the service worker)
  - serviceWorker.js (default service worker provided in the react framework.)
- package.json (all package dependencies defined to run the application)

# To run the application

In the project directory, you can run:

### npm install

Installs all dependent packages.

### `npm start`

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.
