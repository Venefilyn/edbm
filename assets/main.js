jQuery(document).ready(function($) {
	init();
});

function init () {
	$.bmdata = {};
	load_systems();
	load_stations();
}

$("#current_system").submit(function(e) {
	e.preventDefault();

	var start_system = $("#start_system").val();
	var radius = 25; // $("#ly_radius").val();

	if(check_system(start_system))
	{
		console.log("Cur system: " + start_system);
		console.log("Radius: " + radius);
		var systems = [];
		systems = get_systems_within_radius(start_system, radius);
	}
	else
	{
		console.log(start_system + " doesn't exist");
		//Add feedback to user
	}
});

function get_systems_within_radius (current_system, radius) {
	var current_system_data = [];
	var systems_with_blackmarket = [];
	var stations_with_blackmarket = [];

	current_system_data = getObjects($.bmdata.systems, 'name', current_system);
	$.each($.bmdata.systems, function(index, system) {

		if( is_system_within_radius(current_system_data[0], system, radius) )
		{
			stations_with_blackmarket = system_stations_with_black_market(system);
			if(system_stations_with_black_market(system).length > 0)
			{
				systems_with_blackmarket.push(system);
			}
		}
	});
	results = $("#results");
	results.add('<p>' + stations_with_blackmarket.length + ' stations with black market found in ' + systems_with_blackmarket.length + '  systems</p>');
	results.add('<table class="table table-striped table-bordered"><thead><th>System</th><th>Station</th><th>Faction</th><th>Distance to star</th><th>Distance from star</th><th>Black Market</th></thead><tbody>');
	$.each(systems_with_blackmarket, function(index, system) {
		$.each(getObjects(stations_with_blackmarket, 'system_id', system.id), function(index, station) {
			if(station.has_blackmarket)
			{
				results.add('<tr class="success"><td>' + system.name + '</td><td>' + station.name + '</td><td>' + station.allegiance + '</td><td>' + distance_to_star(start_system, system) + '</td><td>' + station.distance_to_star + '</td><td>Yes</td>');
			}
			else
			{
				results.add('<tr class="info"><td>' + system.name + '</td><td>' + station.name + '</td><td>' + station.allegiance + '</td><td>' + distance_to_star(start_system, system) + '</td><td>' + station.distance_to_star + '</td><td>Maybe</td>');
			}
		});
	});
	results.add('</tbody></table>');
}
function is_system_within_radius (cur_system, system, radius) {
	vector = Math.sqrt( Math.pow((system.x - cur_system.x), 2) + Math.pow((system.y - cur_system.y), 2) + Math.pow((system.z - cur_system.z), 2));
	if(radius > vector && system.id != cur_system.id)
	{
		return true;
	}
	return false;
}
function system_stations_with_black_market(system) {
	var stations_in_systems = getObjects($.bmdata.stations, 'system_id', system.id)
	var stations_with_blackmarket = [];

	$.each(stations_in_systems, function(index, station) {
		if( station.has_blackmarket == true || station.has_blackmarket == null)
		{
			stations_with_blackmarket.push(station);
		}
	});
	return stations_with_blackmarket;
}
function distance_to_star (cur_system, system) {
	return Math.sqrt( Math.pow((system.x - cur_system.x), 2) + Math.pow((system.y - cur_system.y), 2) + Math.pow((system.z - cur_system.z), 2));
}
function load_systems() {
	$.bmdata = { systems:[] };
	$.getJSON('assets/systems.json', function (data) {
		$.bmdata.systems = data
	}).done(function() {
		var system_info = $(".system_info");
		system_info.removeClass('downloading').addClass('downloaded');
		system_info.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
	});
}
function load_stations() {
	$.bmdata = { stations:[] };
	$.getJSON('assets/stations_lite.json', function (data) {
		$.bmdata.stations = data
	}).done(function() {
		var station_info = $(".station_info");
		station_info.removeClass('downloading').addClass('downloaded');
		station_info.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
	});
}
function check_system (system_name) {
	if (getObjects($.bmdata.systems, 'name', system_name).length > 0){
		return true;
	}
	return false;
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