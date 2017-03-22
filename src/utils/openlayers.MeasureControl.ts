/**
 * Copyright 2016, RadiantBlue Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

import * as ol from 'openlayers'

const MEASURE_DIALOG = `
<div style="display: flex; flex-direction: column; position: relative;">
  <div style="display: flex; flex-direction: row">
    <label for="measureUnits">Distance Units:</label>
    <select id="measureUnits" style="height: 2em; width: 4em;margin-left: 10px">
      <option selected>m</option>
      <option>km</option>
    </select>
    <div style="padding-left: 7px;">
      <button class="closeButton" type="reset" style="border: none; background-color: transparent; width: 2em; line-height: 2em; font-size: 1em; color: #555;"><i class="fa fa-close"></i></button>
    </div>
  </div>
  <label id="measureDistance" style="line-height: 2em; font-weight: 500"></label>
</div>`

export class MeasureControl extends ol.control.Control {
  private _dialog: any

  constructor(className) {
    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Measure distance between two points'
    element.innerHTML = '<button><i class="fa fa-map-o"/></button>'
    element.addEventListener('click', () => this._measureClicked())
    element.addEventListener('keyup', (event) => this._escPressed(event))
  }

  getDialog() {
    if (!this._dialog) {
      this._dialog = document.createElement('form')
      this._dialog.className = 'measure-dialog'
      this._dialog.style.display = 'block'
      this._dialog.style.position = 'absolute'
      this._dialog.style.top = '50px'
      this._dialog.style.right = '40px'
      this._dialog.style.fontSize = '16px'
      this._dialog.style.backgroundColor = 'white'
      this._dialog.style.padding = '.25em'
      this._dialog.style.width = '200px'
      this._dialog.style.height = '70px'
      this._dialog.style.boxShadow = '0 0 0 1px rgba(0,0,0,.2), 0 5px rgba(0,0,0,.1)'
      this._dialog.style.borderRadius = '2px'

      this._dialog.innerHTML = MEASURE_DIALOG
      this.getMap().getTargetElement().appendChild(this._dialog)
      this.getMap().on('measureEvent', function(event) {
        const geometry = event.geometry
        const mapProjection = event.target.getView().getProjection().getCode()
        const c1 = ol.proj.transform(geometry.getFirstCoordinate(), mapProjection, 'EPSG:4326')
        const c2 = ol.proj.transform(geometry.getLastCoordinate(), mapProjection, 'EPSG:4326')
        const wgs84Sphere = new ol.Sphere(6378137)
        const distance = wgs84Sphere.haversineDistance(c1, c2)
        let units = 1
        let unitsValue = (document.getElementById('measureUnits') as HTMLSelectElement).value
        if (unitsValue === 'km') {
          units = 1000
        }
        document.getElementById('measureDistance').innerText = (distance / units).toFixed(3).toString()
      })

      const closeDialog = this._dialog.querySelector('.closeButton')
      closeDialog.addEventListener('click', () => this._closeDialog())
    }
    return this._dialog
  }

  _escPressed(event) {
    if (event.key === 27) {
      this._closeDialog()
    }
  }

  _closeDialog() {
    this.getMap().dispatchEvent('measureToolClosed')
    this._dialog.reset()
    this._dialog.style.display = 'none'
  }

  _measureClicked() {
    this.getMap().dispatchEvent('measureToolOpened')
    this.getDialog().style.display = 'block'
  }
}
