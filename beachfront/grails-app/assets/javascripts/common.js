function convertDateFormat(dateString) {
	var date = new Date(dateString);
	var year = date.getFullYear();

	var month = date.getMonth() + 1;
	month = month < 10 ? "0" + month : month;	

	var day = date.getDate();
	day = day < 10 ? "0" + day : day;

	var hours = date.getHours();
	hours = hours < 10 ? "0" + hours : hours;

	var minutes = date.getMinutes();
	minutes = minutes < 10 ? "0" + minutes : minutes;

	var seconds = date.getSeconds();
	seconds = seconds < 10 ? "0" + seconds : seconds;
	

	return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;
}

function convertGeospatialCoordinateFormat(inputString) {
	var ddPattern = /(\-?\d{1,2}[.]?\d*)[\s+|,?]\s*(\-?\d{1,3}[.]?\d*)/;
	var dmsPattern = /(\d{2})[^\d]*(\d{2})[^\d]*(\d{2}[.]?\d*)([n|N|s|S])[^\w]*(\d{3})[^\d]*(\d{2})[^d]*(\d{2}[.]?\d*)([e|E|w|W])/;
	var mgrsPattern = /(\d{1,2})([a-zA-Z])[^\w]*([a-zA-Z])([a-zA-Z])[^\w]*(\d{5})[^\w]*(\d{5})/;

	var coordinateConversion = new CoordinateConversion();

	if (inputString.match(dmsPattern)) {  
		var latitude = coordinateConversion.dmsToDd(RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4);
		var longitude = coordinateConversion.dmsToDd(RegExp.$5, RegExp.$6, RegExp.$7, RegExp.$8);


		return [parseFloat(longitude), parseFloat(latitude)];
	}
	else if (inputString.match(ddPattern)) {
		var latitude = RegExp.$1;
		var longitude = RegExp.$2;


		return [parseFloat(longitude), parseFloat(latitude)];
	}
	else if (inputString.match(mgrsPattern)) {
		var location = coordinateConversion.mgrsToDd(RegExp.$1, RegExp.$2, RegExp.$3, RegExp.$4, RegExp.$5, RegExp.$6);


		return convertGeospatialCoordinateFormat(location);
	}
	else { return false; }
}

function displayLoadingDialog(message) {
	$("#loadingDialogMessageDiv").html(message || "");
	$("#loadingDialog").modal("show");
}

function generateRandomHue() {
	var hue = "rgb(" + 
		(Math.floor(Math.random() * 256)) + "," + 
		(Math.floor(Math.random() * 256)) + "," + 
		(Math.floor(Math.random() * 256)) + 
	")";

	
	return hue;
}

function hideLoadingDialog() { $("#loadingDialog").modal("hide"); }
