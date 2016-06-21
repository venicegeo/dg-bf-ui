export function generateAlgorithmDescriptor(serviceId = 'test-service-id') {
  return {
    serviceId,
    url:              'test-url',
    method:           'POST',
    resourceMetadata: {
      name:        'test-name',
      description: 'test-description',
      metadata:    {
        'ArbAttribute':        'is still arbitrary',
        'ImgReq - bands':      'coastal,swir1',
        'ImgReq - cloudCover': '12.34',
        'ImgReq - irregular':  'test-irregular-requirement',
        'Interface':           'pzsvc-ossim',
        'SvcType':             'beachfront'
      }
    }
  }
}
