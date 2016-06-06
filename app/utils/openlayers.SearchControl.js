import openlayers from 'openlayers'
import React from 'react'


export default class SearchControl extends openlayers.control.Control {
  constructor(className) {

    var dialog = document.createElement('coordinateDialog')
    dialog.id = 'coordinateDialog'
    dialog.innerHTML = '<div id="coordinateDialog" class="test" style="display: none;position: fixed;z-index: 1;left: 0;top: 0;width: 100%;height: 100%;overflow: auto;background-color: rgb(0,0,0);background-color: rgba(0,0,0,0.4);"><div style="background-color: #fefefe;margin: 15% auto;padding: 20px;border: 1px solid #888; width: 80%;"><span class="close">x</span><p>Some text in the Modal..</p></div></div>'
    //dialog.style.display = 'block';

    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Jump to a specific location or coordinate'
    element.id = 'searchCoordBtn'
    element.innerHTML = '<button><i class="fa fa-search"/></button>'
    element.addEventListener('click', () => this._searchClicked(dialog))


  }


  _searchClicked(obj) {

    //obj.style.display = 'block'
    var person = prompt("Please enter coordinates");
    if (person != null) {
      var res = person.split(" ");
    }
    console.log('this')
  //on submit of the modal dialog, come back here and zoom to location on the map

    //WASH DC
    //38.9072 -77.0369

    var lat = parseFloat(res[0])
    var long = parseFloat(res[1])
    var ol = require('openlayers')
    var map = this.getMap()
    console.log('Long: ' + long + ' Lat: ' + lat)
    var view = map.getView()
    view.setCenter(ol.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857'))
    view.setZoom(8)

  }
}
