//= require jquery
//= require bootstrap.min
//= require ol

var map;
$(document).ready(
	function() {
		setupMap();
		updateMapSize()
	}
);

function setupMap() {
	map = new ol.Map({
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			})
		],
		target: "map",
		view: new ol.View({
			center: [0, 0],
			zoom: 2
		})
	});
}

function updateMapSize() {
	var windowHeight = $(window).height();
	console.dir(windowHeight);
	var navigationMenu = $("#navigationMenu");
	console.dir(navigationMenu.height());
	var mapHeight = windowHeight - navigationMenu.height();
	$("#map").height(mapHeight);
	map.updateSize();
}
