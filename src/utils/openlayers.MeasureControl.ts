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
import {Application} from '../components/Application'

const MEASURE_DIALOG = `
<div style="display: flex; position: relative;">
  <label>Distance in KM: <span id="distanceInKm"></span></label>
  <button class="closeButton" type="reset" align='right' style="border: none; background-color: transparent; width: 2em; line-height: 2em; font-size: 1em; color: #555;"><i class="fa fa-close"></i></button>
</div>`

export class MeasureControl extends ol.control.Control {
  private _dialog: any
  private _distance: number

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
      this._dialog.style.width = '150px'
      this._dialog.style.boxShadow = '0 0 0 1px rgba(0,0,0,.2), 0 5px rgba(0,0,0,.1)'
      this._dialog.style.borderRadius = '2px'

      this._dialog.innerHTML = MEASURE_DIALOG
      this.getMap().getTargetElement().appendChild(this._dialog)

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
    Application.setMeasureToolInUse(false)
    this._dialog.reset()
    this._dialog.style.display = 'none'
  }

  _measureClicked() {
    Application.setMeasureToolInUse(true)
    // Map mode needs to be updated here
    this.getDialog().style.display = 'block'
  }

  _setDistance(distInKm) {
    this._distance = distInKm
  }
}
