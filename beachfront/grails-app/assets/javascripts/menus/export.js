function addLayersToProxyMap() {
	$.each(
		map.getLayers().getArray(),
		function(i, x) {
			var layer = x;
			if (layer.getVisible()) {
				var source = layer.getSource();
				if (source.getTileLoadFunction) {
					var tileLoadFunction = function(image, src) {
						image.getImage().src = contextPath + "/imageProxy?proxyUrl=" + src;
					}
					source.setTileLoadFunction(tileLoadFunction);
					
					source.setProperties({
						layerLoaded: false,
						tilesLoaded:  0,
						tilesLoading: 0
					});
					
					source.on("tileloadend", function(event) { 
						var tilesLoaded = this.getProperties().tilesLoaded + 1;
						this.setProperties({ tilesLoaded: tilesLoaded });

						if (tilesLoaded == this.getProperties().tilesLoading) { this.setProperties({ layerLoaded: true }); }
					});
					source.on("tileloadstart", function(event) { 
						var tilesLoading = this.getProperties().tilesLoading + 1;
						this.setProperties({ tilesLoading: tilesLoading });		
					});
				}
				// assume a vector layer
				else if (source.getFeatures) { source.setProperties({ layerLoaded: true }); }
				// assume the layer is some kind of image
				else {
					var params = source.getParams();
					params.proxyUrl = source.getUrl();
					source.setParams(params);

					source.setProperties({ layerLoaded: false });

					source.on("imageloadend", function(event) { this.setProperties({ layerLoaded: true }); });
				}

				bf.proxyMap.addLayer(layer);
			}
		}
	);
}

function checkProxyMapLoadStatus(callbackFunction) {
	var theProxyMapHasFinishedLoading = true;
	$.each(
		bf.proxyMap.getLayers().getArray(),
		function(i, x) {
			var layerLoaded = x.getSource().getProperties().layerLoaded;
			if (layerLoaded == false) { theProxyMapHasFinishedLoading = false; }
		}
	);

	if (theProxyMapHasFinishedLoading) { getProxyMapCanvasData(callbackFunction); }
	else ( setTimeout(function() { checkProxyMapLoadStatus(callbackFunction); }, 1000) )
}

function createForm() {
	var form = document.createElement("form");
	form.method = "post";
	form.target = "_blank";
	$("body").append(form);

	var input = document.createElement("input");
	input.type = "hidden";
               
	form.appendChild(input);


	return [form, input];
}

function exportScreenshot() {	
	displayLoadingDialog("The map is taking a selfie... this may take a sec.");	
	setupProxyMap();

	var exportCanvas = function(canvasData) {
		var elements = createForm();
		var form = elements[0];
		var input = elements[1];

		form.action = contextPath + "/export/exportCanvas";
		input.name = "imageData";
		input.value = canvasData;

		form.submit();
		form.remove();

		hideLoadingDialog();
	}

	checkProxyMapLoadStatus(exportCanvas);

}

function getProxyMapCanvasData(callbackFunction) {
	bf.proxyMap.once(
		"postcompose", 
		function(event) {
			var canvasData = event.context.canvas.toDataURL().replace(/\S+,/, ""); 		
			$("#proxyMap").hide();
			callbackFunction(canvasData);
		}
	);
	bf.proxyMap.renderSync();
}

function setupProxyMap() {
	var proxyMap = $("#proxyMap");
	proxyMap.show();

	if (bf.proxyMap) { bf.proxyMap.setTarget(null); }
	bf.proxyMap = new ol.Map({
		logo: false,
		target: "proxyMap",
		view: map.getView()
	});

	// make the proxy map the same size as the normal map
	bf.proxyMap.setSize(map.getSize());

	addLayersToProxyMap();		
}
