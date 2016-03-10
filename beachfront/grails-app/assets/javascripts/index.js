//= require jquery
//= require bootstrap.min
//= require ol
//= require coordinateConversion.js

//= require prototype
//= require common
//= require map

var bf = {};
var map;
$(document).ready(
	function() {
		setupMap();
		updateMapSize();
	}
);
