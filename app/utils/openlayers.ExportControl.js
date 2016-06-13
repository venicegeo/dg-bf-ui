import openlayers from 'openlayers'

export default class ExportControl extends openlayers.control.Control {
  constructor(className) {
    const element = document.createElement('div')
    super({element})
    element.className = `${className || ''} ol-unselectable ol-control`
    element.title = 'Click to export an image of this map'
    element.innerHTML = '<a href="map.png"><i class="fa fa-download"/></a>'
    const hyperlink = this.element.firstChild
    hyperlink.addEventListener('click',  this._clicked.bind(this))

  }

  _clicked() {
    const map = this.getMap()
    ///var metadata = document.createElement('div')
    //metadata.className = 'metadata-popup'
    //metadata.style.display = 'block'
    //position for now.  once we are getting coordinates from map, position will change of the metadata form
    //metadata.style.position = 'absolute'
    //metadata.style.top = '300px'
    //metadata.style.left = '50%'
    //metadata.style.transform = 'translateX(-50%)'
    //metadata.innerHTML = '<table style="width: 400px; height: 400px; background-color: #ffffff;" name="metadataTbl"><tr><td>metadata 1</td></tr><tr><td>metadata 1</td></tr><tr><td>metadata 1</td></tr><tr><td>metadata 1</td></tr></table>'

    //var overlay = new openlayers.Overlay ({
    //    element: metadata,
    //    positioning: 'top-center'
    //});

    //Set position to image is instead of 0,0
    //overlay.setPosition([0,0])
    //map.addOverlay(overlay);

    const hyperlink = this.element.firstChild
    const timestamp = new Date().toISOString().replace(/(\D+|\.\d+)/g, '')

    hyperlink.download = `BEACHFRONT_EXPORT_${timestamp}.png`
    map.once('postcompose', event => {
      const canvas = event.context.canvas

      var imageData = event.context.getImageData(0,0,canvas.width,canvas.height)

      var newCanvas = document.querySelector('canvas')
      var context = newCanvas.getContext('2d')

      newCanvas.width = canvas.width
      newCanvas.height = canvas.height

      //context.drawImage(imageData, 0,0)
      context.putImageData(imageData, 0, 0)

      var extent = map.getView().calculateExtent(map.getSize())
      extent = openlayers.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:3857')

      context.font = "14px serif"
      context.fillText('Timestamp: '+timestamp, 0, (newCanvas.height - 30))
      context.fillText('Viewport: '+extent, 0, (newCanvas.height - 10))

      hyperlink.href = newCanvas.toDataURL()
      newCanvas = null
    })
    map.renderSync()


  }
}
