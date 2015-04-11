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
	var blob = new Blob([seperateWorker()]);
	var blobURL = window.URL.createObjectURL(blob);

	var worker = new Worker(blobURL);
	worker.postMessage();
});

function seperateWorker(){
	var start_system = $("#start_system").val();
	var radius = $('input[name=ly_radius]:checked', '#current_system').val();

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
}

function get_systems_within_radius (current_system, radius) {
	var systems_with_blackmarket = [];

	$.bmdata.current_system_data = getObjects($.bmdata.systems, 'name', current_system);
	$.each($.bmdata.systems, function(index, system) {

		if( is_system_within_radius($.bmdata.current_system_data[0], system, radius) )
		{
			var stations_with_blackmarket = system_stations_with_black_market(system);

			// If there are stations
			if(stations_with_blackmarket.length > 0)
			{
				system.stations = stations_with_blackmarket;
				systems_with_blackmarket.push(system);
			}
		}
	});

	results = $("#results");
	results.html();
	results.append('<h2>Systems with black market</h2>');
	results.append('<p>' + systems_with_blackmarket.length + ' systems with a black market</p>');
	results.append('<table class="table table-striped table-bordered"><thead><th>System</th><th>Station</th><th>Faction</th><th>Distance to star</th><th>Distance from star</th><th>Black Market</th></thead><tbody>');

	table = $("#results table");
	
	systems_with_blackmarket.sort(sort_stars_by_distance);

	$.each(systems_with_blackmarket, function(index, system) {
		$.each(system.stations, function(index, station) {
			if(station.has_blackmarket)
			{
				table.append('<tr class="success"><td>' + system.name + '</td><td>' + station.name + '</td><td>' + station.allegiance + '</td><td>' + Math.round10(distance_to_star($.bmdata.current_system_data[0], system), -2) + ' Ly</td><td>' + $(function(){if(station.distance_to_star == null){return "--"}else{return Math.round(station.distance_to_star) + ' Ls'}}) + '</td><td>Yes</td>');
			}
			else
			{
				table.append('<tr class="info"><td>' + system.name + '</td><td>' + station.name + '</td><td>' + station.allegiance + '</td><td>' + Math.round10(distance_to_star($.bmdata.current_system_data[0], system), -2) + ' Ly</td><td>' + $(function(){if(station.distance_to_star == null){return "--"}else{return Math.round(station.distance_to_star) + ' Ls'}}) + '</td><td>Maybe</td>');
			}
		});
	});
	results.append('</tbody></table>');
}
function sort_stars_by_distance(a, b){
	var aDistance = distance_to_star($.bmdata.current_system_data[0], a);
	var bDistance = distance_to_star($.bmdata.current_system_data[0], b); 
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
