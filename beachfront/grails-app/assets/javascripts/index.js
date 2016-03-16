//= require jquery
//= require bootstrap.min
//= require bootstrap-slider.min
//= require ol-debug
//= require coordinateConversion.js

//= require prototype
//= require common
//= require map
//= require layerSwitcher
//= require menus/upload

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
