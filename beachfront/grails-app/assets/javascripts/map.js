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

function disableMapRotation() {
	map.removeInteraction(bf.mapInteractions.dragRotate);
	map.addInteraction(bf.mapInteractions.dragPan);
}

function enableDisableMapRotation(button) {
	var text = button.innerHTML;
	if (text.contains("Enable")) {
		enableMapRotation();
		text = text.replace("Enable", "Disable");
	}
	else {
		disableMapRotation();
		text = text.replace("Disable", "Enable");
	}
	button.innerHTML = text;
}

function enableMapRotation() {
	map.removeInteraction(bf.mapInteractions.dragPan);
	map.addInteraction(bf.mapInteractions.dragRotate);
}

function geoJump(location) {
	var point = convertGeospatialCoordinateFormat(location);
	map.getView().setCenter(point);
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
		interactions: ol.interaction.defaults({
			altShiftDragRotate: false,
			dragPan: false
                }),
		logo: false,
		target: "map",
		view: new ol.View({
			center: [0, 0],
			zoom: 2
		})
	});

	bf.mapInteractions = {
		altDragRotate: new ol.interaction.DragRotate({ condition: ol.events.condition.altKeyOnly }),
		dragPan: new ol.interaction.DragPan({ condition: ol.events.condition.noModifierKeys }),
		dragRotate: new ol.interaction.DragRotate({ condition: ol.events.condition.always })
	};
	map.addInteraction(bf.mapInteractions.altDragRotate);
	map.addInteraction(bf.mapInteractions.dragPan);
}

function updateMapSize() {
	var windowHeight = $(window).height();
	var securityClassificationHeader = $(".security-classification");
	var navigationMenu = $("#navigationMenu");
	var mapHeight = windowHeight - securityClassificationHeader.height() - navigationMenu.height();
	$("#map").height(mapHeight);
	map.updateSize();
}
