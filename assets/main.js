jQuery(document).ready(function($) {
	init();
});

function init () {
	$.bmdata = {};
	load_sys();
	load_sts();
}

$("#current_sy").submit(function(e) {
	e.preventDefault();

	var start_sy = $("#start_system").val().toLowerCase();
	var radius = $('input[name=ly_radius]:checked', '#current_system').val();

	$.bmdata.current_sy = check_sy(start_sy);
	if(typeof($.bmdata.current_sy) == 'object')
	{
		console.log("Cur system: " + start_sy);
		console.log("Radius: " + radius);
		var sys = [];
		sys = get_sys_within_radius(start_sy, radius);
	}
	else
	{
		console.log(start_sy + " doesn't exist");
		//Add feedback to user
	}
});

function get_sys_within_radius (current_sy, radius) {
	var sys_with_blackmarket = [];

	for(var sy_id in $.bmdata.sys_by_id) {
		sy = $.bmdata.sys_by_id[sy_id];
		if( sy_within_radius($.bmdata.current_sy, sy, radius) )
		{
			var sts_with_blackmarket = sy_sts_with_black_market(sy);

			// If there are sts
			if(sts_with_blackmarket.length > 0)
			{
				console.log("There was a black market, pushing it into sys_with_blackmarket");
				sy.sts = sts_with_blackmarket;
				sys_with_blackmarket.push(sy);
			}
		}
	};

	console.log("Systems with blackmarket: " + sys_with_blackmarket);

	results = $("#results");
	results.html('');
	results.append('<h2>sys with black market</h2>');
	results.append('<p>Found ' + sys_with_blackmarket.length + ' sys with a potential black market</p>');
	results.append('<table class="table table-striped table-bordered"><thead><th>sy</th><th>Station</th><th>Faction</th><th>Distance to star</th><th>Distance from star</th><th>Black Market</th></thead><tbody>');

	table = $("#results table");
	
	sys_with_blackmarket.sort(sort_stars_by_distance);

	$.each(sys_with_blackmarket, function(index, sy) {
		$.each(sy.sts, function(index, station) {
			if(station.has_blackmarket)
			{
				table.append('<tr class="success"><td>' + sy.name + '</td><td>' + station.name + '</td><td>' + ($.fn.func = function(){if(station.allegiance == null){return "Unknown"}else{return station.allegiance}})() + '</td><td>' + Math.round10(distance_to_star($.bmdata.current_sy, sy), -2) + ' Ly</td><td>' + ($.fn.func = function(){if(station.distance_to_star == null){return "--"}else{return Math.round(station.distance_to_star) + ' Ls'}})() + '</td><td>Yes</td>');
			}
			else
			{
				table.append('<tr><td>' + sy.name + '</td><td>' + station.name + '</td><td>' + ($.fn.func = function(){if(station.allegiance == null){return "Unknown"}else{return station.allegiance}})() + '</td><td>' + Math.round10(distance_to_star($.bmdata.current_sy, sy), -2) + ' Ly</td><td>' + ($.fn.func = function(){if(station.distance_to_star == null){return "--"}else{return Math.round(station.distance_to_star) + ' Ls'}})() + '</td><td>Maybe</td>');
			}
		});
	});
	results.append('</tbody></table>');
}
function load_sys() {
	$.bmdata.sys_by_id = {};
	$.bmdata.sys_by_name = {};
	$.getJSON('assets/sys.json', function (data) {
		for(var i in data){
			var sy = data[i];
			$.bmdata.sys_by_id[sy.id] = sy;
			$.bmdata.sys_by_name[sy.name.toLowerCase()] = sy;
		}
	}).done(function() {
		var sy_info = $(".sy_info");
		sy_info.removeClass('downloading').addClass('downloaded');
		sy_info.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
	});
}
function load_sts() {
	$.bmdata.sts_by_sy_id = {};
	$.getJSON('assets/sts_lite.json', function (data) {
		for(var i in data){
			var station = data[i];
			if (typeof($.bmdata.sts_by_sy_id[station.sy_id]) == 'undefined')
			{
				$.bmdata.sts_by_sy_id[station.sy_id] = [];
			}
			else
			{
				$.bmdata.sts_by_sy_id[station.sy_id].push(station);
			}
		}
	}).done(function() {
		var station_info = $(".station_info");
		station_info.removeClass('downloading').addClass('downloaded');
		station_info.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-ok');
	});
}
function sort_stars_by_distance(a, b){
	var aDistance = distance_to_star($.bmdata.current_sy, a);
	var bDistance = distance_to_star($.bmdata.current_sy, b); 
	return ((aDistance < bDistance) ? -1 : ((aDistance > bDistance) ? 1 : 0));
}
function sy_within_radius (cur_sy, sy, radius) {
	vector = Math.sqrt( Math.pow((sy.x - cur_sy.x), 2) + Math.pow((sy.y - cur_sy.y), 2) + Math.pow((sy.z - cur_sy.z), 2));
	if(radius > vector && sy.id != cur_sy.id)
	{
		return true;
	}
	return false;
}
function sy_sts_with_black_market(sy) {
	console.log("sy_sts_with_black_market: sy: " + sy.name);
	var sts_in_sys = $.bmdata.sts_by_sy_id[sy.id];
	console.log("sy_sts_with_black_market: sts_in_sys: " + sts_in_sys);
	var sts_with_blackmarket = [];

	$.each(sts_in_sys, function(index, station) {	
		if( station.has_blackmarket == true || station.has_blackmarket == null)
		{
			sts_with_blackmarket.push(station);
		}
	});
	return sts_with_blackmarket;
}
function distance_to_star (cur_sy, sy) {
	return Math.sqrt( Math.pow((sy.x - cur_sy.x), 2) + Math.pow((sy.y - cur_sy.y), 2) + Math.pow((sy.z - cur_sy.z), 2));
}
function check_sy (sy_name) {
	return $.bmdata.sys_by_name[sy_name.toLowerCase()];
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
