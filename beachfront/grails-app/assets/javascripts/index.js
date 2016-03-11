//= require jquery
//= require bootstrap.min
//= require ol
//= require coordinateConversion.js

//= require prototype
//= require common
//= require map
//= require menus/upload

var bf = {};
var map;
$(document).ready(
	function() {
		setupMap();
		setupContextMenu();
		updateMapSize();
	}
);
