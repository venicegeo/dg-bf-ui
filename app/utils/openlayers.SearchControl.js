import openlayers from 'openlayers'
import React from 'react'

export default class SearchControl extends openlayers.control.Control {
  constructor(className) {

    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Jump to a specific location or coordinate'
    element.id = 'searchCoordBtn'
    element.innerHTML = '<button><i class="fa fa-search"/></button>'
    element.addEventListener('click', () => this._searchClicked())

  }


  getDialog(){
    if(!this._dialog){
      this._dialog = document.createElement('form')
      this._dialog.className = 'coordinate-dialog'
      this._dialog.style.display = 'block'
      this._dialog.style.position = 'absolute'
      this._dialog.style.top = '300px'
      this._dialog.style.left = '50%'
      this._dialog.style.transform = 'translateX(-50%)'
      this._dialog.innerHTML = '<input style="width: 400px; height: 26px" name="coordinate">&nbsp;<button style="vertical-align: bottom" type="submit"><i class="fa fa-search fa-2x"/></button>'
      this._dialog.addEventListener('submit', (event) => this._formSubmitted(event))
      this.getMap().getTarget().appendChild(this._dialog)
    }
    return this._dialog
  }

  _formSubmitted(event){
    console.log(this._dialog.querySelector("input").value)
    event.preventDefault()

    var res = this._dialog.querySelector("input").value
    var [x,y] = res.split(" ")
    var lat = parseFloat(y)
    var long = parseFloat(x)
    var map = this.getMap()
    console.log('Long: ' + long + ' Lat: ' + lat)
    var view = map.getView()
    view.setCenter(openlayers.proj.transform([long, lat], 'EPSG:4326', 'EPSG:3857'))
    view.setZoom(8)
  }

  _searchClicked() {
    this.getDialog().style.display = 'block'
  }


  
}
