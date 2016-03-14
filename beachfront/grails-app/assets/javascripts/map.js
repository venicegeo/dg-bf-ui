function createLayerSwitcherControl() {
        var layerSwitcherControl = function(opt_options) {

        var options = opt_options || {};

        var button = document.createElement('button');
        button.innerHTML = 'N';

        var this_ = this;
        var handleRotateNorth = function() {
          this_.getMap().getView().setRotation(0);
        };

        button.addEventListener('click', handleRotateNorth, false);
        button.addEventListener('touchstart', handleRotateNorth, false);

        var element = document.createElement('div');
        element.className = 'rotate-north ol-unselectable ol-control';
        element.appendChild(button);

        ol.control.Control.call(this, {
          element: element,
          target: options.target
        });

      };
      ol.inherits(app.RotateNorthControl, ol.control.Control);
}

function createContextMenuContent(coordinate) {
	var coordConvert = new CoordinateConversion();
	var latitude = coordinate[1];
	var longitude = coordinate[0];
	var dd = latitude.toFixed(6) + ", " + longitude.toFixed(6);
	var dms = coordConvert.ddToDms(latitude, "lat") + " " + coordConvert.ddToDms(longitude, "lon");
	var mgrs = coordConvert.ddToMgrs(latitude, longitude);

	$("#contextDialog .modal-body").html("<div align = 'center' class = 'row'>You clicked here:</div>");
	$("#contextDialog .modal-body").append("<div align = 'center' class = 'row'>" + dd + " // " + dms + " // " + mgrs + "</div>");
}

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
	map.getView().setCenter(ol.proj.transform(point, "EPSG:4326", "EPSG:3857"));
}

function setupContextMenu() {
	map.getViewport().addEventListener("contextmenu", 
		function (event) {	
			event.preventDefault();
			var pixel = [event.layerX, event.layerY];
			var coordinate = ol.proj.transform(map.getCoordinateFromPixel(pixel), "EPSG:3857", "EPSG:4326");
			createContextMenuContent(coordinate);
			$("#contextDialog").modal("show");
		}
	);
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
	var navigationMenu = $("#navigationMenu");
	var mapHeight = windowHeight - navigationMenu.height();
	$("#map").height(mapHeight);
	map.updateSize();
}
