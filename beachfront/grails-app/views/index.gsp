<!DOCTYPE html>
<html>
	<head>
		<title>Beachfront</title>
		<asset:stylesheet src = "index.css"/>
		<asset:javascript src = "index.js"/>
  	</head>
	<body>
		<div class = "container-fluid">
			<div class = "row">
				<h1>Beachfront</h1>
				<i>... not your average sand castle</i>
			</div>
 			<div class = "map" id = "map"></div>
		</div>
		<script>
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
		</script>

		<asset:deferredScripts/>
	</body>
</html>
