<!DOCTYPE html>
<html>
	<head>
		<meta charset = "utf-8">
		<meta content = "IE=edge" http-equiv = "X-UA-Compatible">
		<meta content="width=device-width, initial-scale=1" name="viewport">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

		<title>Beachfront</title>
		<asset:stylesheet src = "index.css"/>
		<asset:javascript src = "index.js"/>
  	</head>
	<body>
		<div class = "container-fluid">
			<g:render template = "navigationMenu"/> 
			<div class = "row">
	 			<div class = "map" id = "map"></div>
			</div>
		</div>

		<g:render template = "dialogs"/> 

		<asset:deferredScripts/>
	</body>
</html>
