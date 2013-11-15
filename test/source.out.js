function apart_task_0($extref) {
    $extref = JSON.parse($extref);
    var num = $extref[0][$extref[1]], mul = 1;

    for (var j = 1; $extref[2] < $extref[3]; $extref[2]++) {
		$extref[4] *= $extref[3];
	}

    $extref[5][$extref[1]] = $extref[4];

    (function (abc) {
		var x = abc + mul + $extref[0][0];
	})($extref[6]);

    var a = {x: $extref[7]};
}

var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++)
    apart_task_0(JSON.stringify([array, i, j, num, mul, result, smth, smthelse]));

console.log(result);