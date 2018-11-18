import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import escapeRegExp from 'escape-string-regexp'
import InfoWindow from './InfoWindow'

//Places of interest hardcoded
const locations= ["Bangalore Palace",'Jawaharlal Nehru Planetarium','Tipu Sultan Summer palace','Karnataka Parishath', 'Lalbagh Botanical garden']

var placeInfo= []
//Credentials for foursquare API
const CLIENT_ID= 'JCJJNZDUN0NVIJPMDAZTSY0GDR1ADZLWJRXGJGYY4Q1JMCSZ'
const CLIENT_SECRET= 'ZFO4DWYCXPBR5GPIR0IPDFGP5NUUI3Z5CN1X1QWD4XWTZKZQ'

export class App extends Component {

  // State variable that stores the places hardcoded and an array that contains
  // info collected from foursquare API and marker object for each place

  state= {
    places:[],
    placesInfo: [{
      name: '',
      id: '',
      imgUrl: '',
      address: '',
      text: '',
      marker: {}
    }]
  }

  componentDidMount() {
    this.setState({places: locations})
    this.renderMap()

  }

  /*
   * Function name : renderMap
   * Description : calls loadScript JS function to initiate map loading. It in turn
                   calls the initMap callback funtion. Since initMap belongs to the
                   scope of React class, setting its scope to window object for google api.
   * Parameters : none
   */

  renderMap = () => {
    loadScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyC-VuWTUAwzuavTs7nfiC_OkO8M0Yci5to&v=3&callback=initMap")
    window.initMap= this.initMap
  }

  /*
   * Function name : initMap
   * Description : This function does the following :-
   *               1. Loads the map from google with given config variables.
   *               2. For the places provided as input, get the lat and lng
   *                  variables from GeoCoder, and initialises markers for them.
   *               3. Calls etPlacesInfo function to set the state variable
   * Parameters : none
   */

  initMap = () => {

    const mapConfig = Object.assign({}, {
      center: {lat: 12.9766, lng: 77.5993},
      zoom: 13,
      mapTypeControl: false
    })

    this.map = new window.google.maps.Map(document.getElementById('map'), mapConfig);
    this.infowindow = new window.google.maps.InfoWindow()
    var bounds = new window.google.maps.LatLngBounds()

    var placeInfo= []
    var geocoder = new window.google.maps.Geocoder()
    // Looping through all places of interest to get their lat, lng, create
    // markers and load information into the state variable.
    this.state.places.map(loc => {
      geocoder.geocode(
        {
          address: loc,
          componentRestrictions: {locality: 'Bangalore'}
        }, function(results,status) {
          if (status === window.google.maps.GeocoderStatus.OK) {

            var lat= results[0].geometry.location.lat()
            var lng= results[0].geometry.location.lng()


            var marker = new window.google.maps.Marker({
                position: results[0].geometry.location,
                map: this.map,
                title: loc,
                animation: window.google.maps.Animation.DROP
            })

            bounds.extend(results[0].geometry.location)
            var highlightedIcon = this.makeMarkerIcon('FFFF24');

            // Update the state variable with information from foursquare API
            this.getPlacesInfo(loc,lat,lng,marker)

            window.google.maps.event.addListener(marker, 'click', e => {
              //Animation icon when clicked and showing the info window
              marker.setIcon(highlightedIcon);
              this.showInfoWindow(loc,marker)
            })
          }
        }.bind(this))
    })
  }

  /*
   * Function name : getPlacesInfo
   * Description : Calls the foursquare API to set the state variable with
   *               the required information.
   * Parameters : location, lat andlng of the location, marker of the location
   */
  getPlacesInfo(loc,lat,lng,marker) {
    const venuesEndpoint = 'https://api.foursquare.com/v2/venues/search?'

    var markerInfo= {}
    var id, address= ''
    // Parameters for foursquare API
    var params= {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      ll: `${lat},${lng}`,
      query: `${loc}`,
      limit: 1,
      v: '20130619'
    }

    // Get the ID first so as to proceed with getting photos, info text etc
    fetch(venuesEndpoint + new URLSearchParams(params), {
      method: 'GET'
    }).then(response => response.json()).then(response => {
        if (response.meta.code === 200) {
          id= response.response.venues[0].id
          address= response.response.venues[0].location.formattedAddress.join('\n')
          markerInfo.marker= marker
          markerInfo.name= loc
          markerInfo.id= id
          markerInfo.address= address

          //Once the ID is obtained call API again to get extra Information

          const photosEndpoint = `https://api.foursquare.com/v2/venues/${id}?`
          fetch(photosEndpoint + new URLSearchParams(params), {
            method: 'GET'
          }).then(response => response.json()).then(response => {
            if (response.meta.code !== 200) {
              markerInfo.imgUrl= ''
              markerInfo.text= `Information for ${loc} could not be obtained from server due to error code: ${response.meta.code}`
            } else {
              var prefix= response.response.venue.bestPhoto.prefix
              var suffix= response.response.venue.bestPhoto.suffix

              markerInfo.imgUrl= prefix + 'original' +suffix
              markerInfo.text= response.response.venue.tips.groups[0].items[0].text
            }

            this.setState({placesInfo: this.state.placesInfo.concat([markerInfo])})
          }).catch(err => {
            alert("Could not get photos for "+loc+" due to error code: "+response.meta.code)
          })
        } else {
          alert ("Could not find venue details for "+loc + "due to " + response.meta.errorDetail+" : "+response.meta.code)
        }
    }).catch(err => {
      alert("Fetch API to foursquare failed "+err)
    })
  }

  /*
   * Function name : showInfoWindow
   * Description : Displays the infowindow with relevant information
   * Parameters : location, marker of the location
   */

  showInfoWindow(loc, marker) {

    // Filter out the place and show its info window
    var place= this.state.placesInfo.filter(place => {
      return place.name === loc
    })

    this.infowindow.setContent('<div class= "info-window">'+
             '<h2 style= "color: white;">' + loc + '</h2>' +
             '<div class= "main-info">' +
             '<img src='+ place[0].imgUrl +'alt= Image of '+place[0].name+ '>' +
             '<div>' +
             '<h3>Address</h3>' +
             '<p>' + place[0].address + '</p>' +
             '</div>' +
             '</div>' +
             '</div>')


    this.infowindow.open(this.map,marker);
  }

  /*
   * Function name : makeMarkerIcon
   * Description : Function to create custom markers
   * Parameters : Color of the marker
   */

  makeMarkerIcon = (markerColor) => {
    var markerImage = new window.google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new window.google.maps.Size(21, 34),
    new window.google.maps.Point(0, 0),
    new window.google.maps.Point(10, 34),
    new window.google.maps.Size(21,34));
    return markerImage;
  }

  render() {
    return (
      <div className= "container">
        <div className= "header" role= "heading" tabIndex= "0">
          <h1>Neighbourhood Map</h1>
        </div>
        <div className= "map-container" tabIndex= "-1">
          <InfoWindow info= {this.state.placesInfo} places= {this.state.places} map= {this.map} makeIcon= {this.makeMarkerIcon} showInfoWindow= {this.showInfoWindow} infowindow= {this.infowindow}/>
          <div id= 'map'  aria-labelledby= "map-description" role= "application" tabIndex= "-1">
            <p id= "map-description">Map indicating places of interest in the vicinity</p>
          </div>
        </div>
      </div>
    )
  }
}

/*
 * Function name : loadScript
 * Description : This function is defined outside the scope of
 *               React to create a script DOM element and load
 *               the google api call to load the map.
 * Parameters : google API url
 */

function loadScript(url) {
  var index= window.document.getElementsByTagName('script')[0]
  var script = window.document.createElement('script')
  script.src= url
  script.async= true
  script.defer= true
  index.parentNode.insertBefore(script,index)
}

export default App
