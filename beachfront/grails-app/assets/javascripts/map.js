function createMousePositionControl() {
	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: function(coordinate) {
			var lat = coordinate[1];
			var lon = coordinate[0];
			var coordConvert = new CoordinateConversion();
			switch(mousePositionControl.coordinateDisplayFormat) {
				case 0: return coordinate[1].toFixed(6) + ", " + coordinate[0].toFixed(6); break;
				case 1: return coordConvert.ddToDms(lat, "lat") + " " + coordConvert.ddToDms(lon, "lon"); break;
				case 2: return coordConvert.ddToMgrs(lat, lon); break;
			}
		},
		projection: "EPSG:4326"
	});

	mousePositionControl.coordinateDisplayFormat = 0;
	$(mousePositionControl.element).click(function() {
		mousePositionControl.coordinateDisplayFormat++;
		if (mousePositionControl.coordinateDisplayFormat >= 3) { mousePositionControl.coordinateDisplayFormat = 0; }
	});


	return mousePositionControl;
}

function setupMap() {
	map = new ol.Map({
		controls: ol.control.defaults().extend([
			createMousePositionControl(),
			new ol.control.FullScreen()
		]),
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM({ 
					// take away the default attributions button
					attributions: [] 
				})
			})
		],
		logo: false,
		target: "map",
		view: new ol.View({
			center: [0, 0],
			zoom: 2
		})
	});
}

function updateMapSize() {
	var windowHeight = $(window).height();
	var navigationMenu = $("#navigationMenu");
	var mapHeight = windowHeight - navigationMenu.height();
	$("#map").height(mapHeight);
	map.updateSize();
}
