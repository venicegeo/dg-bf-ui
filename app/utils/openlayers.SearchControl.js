import openlayers from 'openlayers'
import React from 'react'


export default class SearchControl extends openlayers.control.Control {
  constructor(className) {
    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Jump to a specific location or coordinate'
    element.innerHTML = '<button><a href="/searchMap"><i class="fa fa-search"/></a></button>'
    element.addEventListener('click', () => this._searchClicked())

  }


_searchClicked()
{
  //open up modal dialog
  console.log("this")
  //on submit of the modal dialog, come back here and zoom to location on the map
  //const map = this.getMap()
  var long = '38.9072'
  var lat = '77.0369'

  var ol = require('openlayers');
  var map = this.getMap()
  console.log("Long: " + long + " Lat: " + lat);
  //var olCoordinates = ol.proj.transform([long, lat],"WGS84", "EPSG:900913")
  //map.getView().setCenter(olCoordinates);
  //map.getView().setZoom(10);
  //var extent = [long, lat];
  //extent = ol.extent.applyTransform(extent, ol.proj.getTransform("EPSG:4326", "EPSG:3857"));

  //map.getView().setCenter(extent)
 //map.getView().setZoom(1)
  var view = map.getView()
  //view.setCenter([long, lat])
  view.setCenter(ol.proj.transform([long, lat], "EPSG:4326", "EPSG:3857"))
  view.setZoom(5)


}
}
