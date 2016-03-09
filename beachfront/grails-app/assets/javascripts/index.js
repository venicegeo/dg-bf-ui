//= require jquery
//= require bootstrap.min
//= require ol
//= require coordinateConversion.js

//= require map

var map;
$(document).ready(
	function() {
		setupMap();
		updateMapSize();
	}
);
