//= require jquery
//= require bootstrap.min
//= require bootstrap-slider.min
//= require ol
//= require coordinateConversion.js

//= require prototype
//= require common
//= require map
//= require layerSwitcher
//= require menus/export
//= require menus/runAlgorithm
//= require menus/upload
//= require popupMap

var bf = {
	layers: []
};
var map;
$(document).ready(
	function() {
		setupMap();
		setupContextMenu();

		$(window).resize(function() { updateMapSize(); });
		updateMapSize();
	}
);
