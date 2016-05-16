import openlayers from 'openlayers'

export default class ExportControl extends openlayers.control.Control {
  constructor(className) {
    const element = document.createElement('div')
    super({element})
    element.className = className
    element.title = 'Click to export an image of this map'
    element.innerHTML = '<a href="map.png"><i class="fa fa-download"/></a>'
    element.addEventListener('click', () => this._clicked())
  }

  _clicked() {
    const hyperlink = this.element.firstChild
    const timestamp = new Date().toISOString().replace(/(\D+|\.\d+)/g, '')
    const map = this.getMap()
    hyperlink.download = `BEACHFRONT_EXPORT_${timestamp}.png`
    map.once('postcompose', event => {
      const canvas = event.context.canvas
      hyperlink.href = canvas.toDataURL()
    })
    map.renderSync()
  }
}
