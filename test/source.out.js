function apart_task_0($extref) {
    $extref = JSON.parse($extref);
    var num = $extref[0][i], mul = 1;

    for (var j = 1; $extref[1] < $extref[2]; $extref[1]++) {
		$extref[3] *= $extref[2];
	}

    $extref[4][i] = $extref[3];

    (function (abc) {
		var x = abc + mul + $extref[0][0];
	})($extref[5]);

    var a = {x: $extref[6]};
}

var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++)
    apart_task_0(JSON.stringify([array, j, num, mul, result, smth, smthelse]));

console.log(result);