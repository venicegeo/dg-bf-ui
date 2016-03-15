<!DOCTYPE html>
<html>
	<head>
		<meta charset = "utf-8">
		<meta content = "IE=edge" http-equiv = "X-UA-Compatible">
		<meta content="width=device-width, initial-scale=1" name="viewport">
		<!-- The above 3 meta tags *must* come first in the head; any other head content must come *after* these tags -->

		<title>Beachfront</title>
		<link href = "${request.contextPath}/assets/beachfront_icon.ico" rel = "shortcut icon" type = "image/x-icon">
		<asset:stylesheet src = "index.css"/>
		<asset:javascript src = "index.js"/>
		<script type = "text/javascript">var contextPath = "${request.contextPath}";</script>
  	</head>
	<body>
		<div class = "container-fluid">
			<g:render template = "navigationMenu"/> 
			<div class = "row">
	 			<div class = "map" id = "map"></div>
			</div>
			<g:render template = "layerSwitcher"/>
		</div>

		<g:render template = "dialogs"/> 

		<asset:deferredScripts/>
	</body>
</html>
