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

	var start_system = $("#start_system").val().toLowerCase();
	var radius = $('input[name=ly_radius]:checked', '#current_system').val();

	$.bmdata.current_system = check_system(start_system);
	if(typeof($.bmdata.current_system) == 'object')
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
	var systems_with_blackmarket = [];

	for(var system in $.bmdata.systems_by_id) {

		if( is_system_within_radius($.bmdata.current_system, system, radius) )
		{
			var stations_with_blackmarket = system_stations_with_black_market(system);

			// If there are stations
			if(stations_with_blackmarket.length > 0)
			{
				system.stations = stations_with_blackmarket;
				systems_with_blackmarket.push(system);
			}
		}
	};

	results = $("#results");
	results.html('');
	results.append('<h2>Systems with black market</h2>');
	results.append('<p>Found ' + systems_with_blackmarket.length + ' systems with a potential black market</p>');
	results.append('<table class="table table-striped table-bordered"><thead><th>System</th><th>Station</th><th>Faction</th><th>Distance to star</th><th>Distance from star</th><th>Black Market</th></thead><tbody>');

	table = $("#results table");
	
	systems_with_blackmarket.sort(sort_stars_by_distance);

	$.each(systems_with_blackmarket, function(index, system) {
		$.each(system.stations, function(index, station) {
			if(station.has_blackmarket)
			{
				table.append('<tr class="success"><td>' + system.name + '</td><td>' + station.name + '</td><td>' + ($.fn.func = function(){if(station.allegiance == null){return "Unknown"}else{return station.allegiance}})() + '</td><td>' + Math.round10(distance_to_star($.bmdata.current_system, system), -2) + ' Ly</td><td>' + ($.fn.func = function(){if(station.distance_to_star == null){return "--"}else{return Math.round(station.distance_to_star) + ' Ls'}})() + '</td><td>Yes</td>');
			}
			else
			{
				table.append('<tr><td>' + system.name + '</td><td>' + station.name + '</td><td>' + ($.fn.func = function(){if(station.allegiance == null){return "Unknown"}else{return station.allegiance}})() + '</td><td>' + Math.round10(distance_to_star($.bmdata.current_system, system), -2) + ' Ly</td><td>' + ($.fn.func = function(){if(station.distance_to_star == null){return "--"}else{return Math.round(station.distance_to_star) + ' Ls'}})() + '</td><td>Maybe</td>');
			}
		});
	});
	results.append('</tbody></table>');
}
function load_systems() {
	$.bmdata.systems_by_id = {};
	$.bmdata.systems_by_name = {};
	$.getJSON('assets/systems.json', function (data) {
		for(var i in data){
			var system = data[i];
			$.bmdata.systems_by_id[system.id] = system;
			$.bmdata.systems_by_name[system.name.toLowerCase()] = system;
		}
	}).done(function() {
		var system_info = $(".system_info");
		system_info.removeClass('downloading').addClass('downloaded');
		system_info.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
	});
}
function load_stations() {
	$.bmdata.stations_by_system_id = {};
	$.getJSON('assets/stations_lite.json', function (data) {
		for(var i in data){
			var station = data[i];
			if (typeof($.bmdata.stations_by_system_id[station.system_id]) == 'undefined')
			{
				$.bmdata.stations_by_system_id[station.system_id] = [];
			}
			else
			{
				$.bmdata.stations_by_system_id[station.system_id].push(station);
			}
		}
	}).done(function() {
		var station_info = $(".station_info");
		station_info.removeClass('downloading').addClass('downloaded');
		station_info.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
	});
}
function sort_stars_by_distance(a, b){
	var aDistance = distance_to_star($.bmdata.current_system, a);
	var bDistance = distance_to_star($.bmdata.current_system, b); 
	return ((aDistance < bDistance) ? -1 : ((aDistance > bDistance) ? 1 : 0));
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
	var stations_in_systems = $.bmdata.stations_by_system_id[system.id];
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
function check_system (system_name) {
	return $.bmdata.systems_by_name[name.toLowerCase()];
}
function getObjects(obj, key, val) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(getObjects(obj[i], key, val));
        } else if (i == key && obj[key].toString().toLowerCase() == val.toString().toLowerCase()) {
            objects.push(obj);
        }
    }
    return objects;
}
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
})();
