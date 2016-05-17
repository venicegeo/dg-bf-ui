import openlayers from 'openlayers'

export default class SearchControl extends openlayers.control.Control {
  constructor(className) {
    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Jump to a specific location or coordinate'
    element.innerHTML = '<button><i class="fa fa-search"/></button>'
    element.addEventListener('click', () => this._clicked())
  }
  
  _clicked() {
    console.debug('things');
  }
}
