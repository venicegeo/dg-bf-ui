import openlayers from 'openlayers'
import React from 'react'


export default class SearchControl extends openlayers.control.Control {
  constructor(className) {
    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Jump to a specific location or coordinate'
    element.innerHTML = '<button><i class="fa fa-search"/></button>'
    element.addEventListener('click', () => this._searchClicked())


    const dialog = document.createElement('div')
    dialog.id = 'coordinateDialog'
    dialog.innerHTML = '<dialog>This is a dialog</dialog>'
  }


  _searchClicked() {



    document.getElementById('coordinateDialog').showModal()
  //open up modal dialog


    console.log('this')
  //on submit of the modal dialog, come back here and zoom to location on the map
  //const map = this.getMap()
  //23.7002° S, 133.8806° E
    var lat = 38.9072
    var long = -77.0369

    var ol = require('openlayers')
    var map = this.getMap()
    console.log('Long: ' + long + ' Lat: ' + lat)


    var view = map.getView()
  //view.setCenter([long, lat])
    view.setCenter(ol.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857'))
    view.setZoom(5)


  }
}
