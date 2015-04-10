jQuery(document).ready(function($) {
	init();
});
function init () {
	$.bmdata = {};
	load_systems();
	if ($.bmdata.systems ) {};
	alert($.bmdata.systems)
	//load_stations();
}
function load_systems() {
	$.getJSON('assets/systems.json', function (data) {
		$.each(data, function(index, system) {
			system.appendTo($.bmdata.systems)
		});
	});
}
function load_stations() {
	$.getJSON("http://eddb.io/archive/v3/stations_lite.json", function( data ) {
		var items = [];
	});
}
function check_system (system_name) {
	// body...
}