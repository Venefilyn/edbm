jQuery(document).ready(function($) {
	init();
	check_system('Kelish');
});
function init () {
	$.bmdata = {};
	load_systems();
	load_stations();
}
function load_systems() {
	$.bmdata = { systems:[] };
	$.getJSON('assets/systems.json', function (data) {
		$.bmdata.systems = data
	});
}
function load_stations() {
	$.bmdata = { stations:[] };
	$.getJSON('assets/stations_lite.json', function (data) {
		$.bmdata.stations = data
	});
}
function check_system (system_name) {
	getObjects($.bmdata.systems, 'name', system_name);
}
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key] == val) {
            objects.push(obj);
        }
    }
    return objects;
}