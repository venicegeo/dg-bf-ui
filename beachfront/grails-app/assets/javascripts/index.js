//= require jquery
//= require bootstrap.min
//= require ol

$(document).ready(
	function() {
		setupMap();
	}
);

function setupMap() {
	var map = new ol.Map({
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
