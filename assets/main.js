jQuery(document).ready(function($) {
	init();
});
function init () {
	$.bmdata = {};
	load_systems();
	alert($.bmdata.systems)
	//load_stations();
}
function load_systems() {
	$.bmdata = { systems:[] };
	$.getJSON('assets/systems.json', function (data) {
		$.bmdata.systems = data
	});
}
function load_stations() {
	$.getJSON("assets/stations_lite.json", function(data) {
		var items = [];
	});
}
function check_system (system_name) {
	// body...
}