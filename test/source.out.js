function apart_task_0($extref) {
    $extref = JSON.parse($extref);

    //hi
    var num = $extref[1][$extref[0]], mul = 1;

    for (var j = 1; $extref[2] < $extref[3]; $extref[2]++) {
		$extref[4] *= $extref[3];
	}

    $extref[5][$extref[0]] = $extref[4];

    (function f(abc) {
		var x = $extref[6] + $extref[4] + $extref[1][0] - $extref[7];
	})($extref[8]);

    var a = {x: $extref[9]};
    var b = $extref[10] + $extref[11];
    var obj = $extref[13];
    var c = $extref[13].prop1 + $extref[13].prop2;
    $extref[12]($extref[14]);
}

var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++)
    apart_task_0(JSON.stringify([i, array, j, num, mul, result, abc, f.length, smth, smthelse, window.obj1.prop1, window.obj1.prop2, window.obj1.method, window.obj2, obj]));

console.log(result);