function addFeatureOverlay() {
	bf.featureOverlayFeatures = new ol.Collection()
	bf.featureOverlay = new ol.layer.Vector({
		source: new ol.source.Vector({ features: bf.featureOverlayFeatures }),
		style: new ol.style.Style({
			fill: new ol.style.Fill({ color: "rgba(255, 255, 0, 0.25)" }),
			stroke: new ol.style.Stroke({
				color: "rgba(255, 255, 0, 1)",
				width: 2
			})
		})
	});
	bf.featureOverlay.setMap(bf.popupMap);
}

function clearPopupMap() {
	$.each(
		bf.featureOverlay.getSource().getFeatures(), 
		function(i,x) {
			bf.featureOverlay.getSource().removeFeature(x);
		}
	);
}

function drawPolygon() {
	var draw = new ol.interaction.Draw({
		features: bf.featureOverlayFeatures,
		style: bf.featureOverlay.getStyle(),
		type: "Polygon"
	});

	draw.on("drawstart", function(event) { clearPopupMap(); });
	bf.popupMap.addInteraction(draw);

	var modify = new ol.interaction.Modify({ features: bf.featureOverlayFeatures });
	bf.popupMap.addInteraction(modify);
}

function prepareBoundingBoxInput() {
	$("#popupMapDialog").modal("show");
	setupPopupMap();
}

function selectBbox() {
	var bbox = bf.popupMap.getView().calculateExtent(bf.popupMap.getSize());
	var projection = bf.popupMap.getView().getProjection();
	var lowerLeft = new ol.geom.Point([bbox[0], bbox[1]]).transform(projection, "EPSG:4326").getCoordinates();
	var upperRight = new ol.geom.Point([bbox[2], bbox[3]]).transform(projection, "EPSG:4326").getCoordinates()
	var minX = lowerLeft[0].toFixed(6);
	var minY = lowerLeft[1].toFixed(6);
	var maxX = upperRight[0].toFixed(6);
	var maxY = upperRight[1].toFixed(6);
	$("#bboxInput").val([minX, minY, maxX, maxY].join(","));
	
	
	return;
}

function setupPopupMap() {	
	// if a map already exists, destory it
	if (bf.popupMap) { bf.popupMap.setTarget(null); }

	// determine the base layer being used
	var baseLayer;
	$.each(
		bf.baseLayers,
		function(i, x) {
			if (x.getVisible()) { baseLayer = x; }
		
		}
	);
	bf.popupMap = new ol.Map({
		controls: ol.control.defaults(),
		layers: [baseLayer],
		logo: false,
		target: "popupMap",
		view: new ol.View({
			center: [0, 0],
			zoom: 2
		})
	});

	addFeatureOverlay();
	drawPolygon();
}
