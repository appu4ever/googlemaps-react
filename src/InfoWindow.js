import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import App from './App'
import './App.css'
import escapeRegExp from 'escape-string-regexp'

class InfoWindow extends Component {

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

  componentWillReceiveProps() {
    this.setState({places: this.props.places})
  }

  /*
   * Function name : checkKeypress
   * Description : To handle accessibility when the user presses enter
   *               on a list item. In turn calls updateMarkers function
   * Parameters : event object
   */

  checkKeypress = (e) => {
    if (e.keyCode == 13) {
      e.target.setAttribute('aria-selected',"true")
      e.target.parentNode.setAttribute('aria-activedescendant',e.target)
      this.updateMarkers(e)
    }
  }

  /*
   * Function name : updateMarkers
   * Description : Called when alist item is clicked. Displays extra information
   *               about the location clicked and also the infowindow.
   * Parameters : event object
   */

  updateMarkers = (e) => {

    var map= this.props.map
    var selectedPlace= e.target.innerHTML
    var highlightedIcon = this.props.makeIcon('FFFF24')

    // When the list item is clicked a second time, close the information
    // window and remove focus.

    if (document.getElementsByClassName('location-info').length !== 0) {
      var el= document.querySelector('.location-info')
      el.classList.remove('show-info')
      el.tabIndex= -1
      el.parentNode.removeChild(el)
      return
    }

    this.props.infowindow.close()

    // open the information window once the list item for a place is clicked.

    this.props.info.map(place => {
      if (place.name !== '') {
        if (place.name === selectedPlace) {

          var div= document.createElement('div')
          div.innerHTML= `<p>${place.text}</p>`
          div.className= 'location-info'
          div.classList.add('show-info')
          e.target.append(div)
          div.focus()
          div.tabIndex= "0"
          place.marker.setIcon(highlightedIcon)
          this.showInfoWindow(selectedPlace,place.marker)
        }
      }
    })
  }

  /*
   * Function name : showInfoWindow
   * Description : Displays the infowindow with relevant information
   * Parameters : location, marker of the location
   */

  showInfoWindow(loc, marker) {

    var place= this.props.info.filter(place => {
      return place.name === loc
    })

    this.props.infowindow.setContent('<div class= "info-window">'+
             '<h2 style= "color: white;">' + loc + '</h2>' +
             '<div class= "main-info">' +
             '<img src='+ place[0].imgUrl +'alt= Image of '+place[0].name+ '>' +
             '<div>' +
             '<h3>Address</h3>' +
             '<p>' + place[0].address + '</p>' +
             '</div>' +
             '</div>' +
             '</div>')


    this.props.infowindow.open(this.map,marker);
  }

  /*
   * Function name : updateList
   * Description : Filters the list of places and markers based on input
   * Parameters : event object
   */

  updateList = (e) => {

    var inputText= e.target.value
    let showingPlaces= []
    let showingMarkers= [{}]
    let match = new RegExp(escapeRegExp(inputText,'i'))
    let map= this.props.map

    if (inputText !== '') {
      showingPlaces = this.props.places.filter((loc) => match.test(loc))
      showingMarkers = this.props.info.filter((loc) => !(match.test(loc.name)))
      map = null
    } else {
      showingPlaces = this.props.places
      showingMarkers = this.props.info
      map = this.props.map
    }

    showingMarkers.map(placeMarker => {
      if (placeMarker.name !== '') {
        placeMarker.marker.setMap(map)
      }
    })

    this.setState({places:showingPlaces})
  }

  render() {
    return (
      <div id= "places-of-interest">
        <div className= "places-of-interest-heading">
          <h2 role= "heading" tabIndex= "0">Places of interest</h2>
        </div>
        <div className= "places-of-interest-list">
          <input type= "text" id= "place" placeholder= "Enter the place from list below"
          onChange= {(event) => this.updateList(event)} aria-label= "Input box to filter available places" tabIndex= "0"></input>
          <ul tabIndex= "0" aria-label= "Places available to select from">
            {
              this.state.places.map(loc => {
                return (<li key= {loc} aria-label= {loc} onKeyDown= {(event) => this.checkKeypress(event)}
                       onClick= {(event) => this.updateMarkers(event)} tabIndex= "0">{loc}</li>)
              })
            }
          </ul>
        </div>
      </div>
    )
  }
}
export default InfoWindow
