function apart_task_0($extref) {
    $extref = JSON.parse($extref);
    var num = $extref[0][$extref[1]], mul = 1;

    for (var j = 1; j < num; j++) {
		mul *= num;
	}

    $extref[2][$extref[1]] = mul;

    (function f(abc) {
		var x = abc + mul + $extref[0][0] - f.length;
	})($extref[3]);

    var a = {x: $extref[4]};
    var b = $extref[5] + $extref[6];
    var bb = $extref[5] + $extref[6];
    var obj = $extref[8];
    var c = $extref[8].prop1 + $extref[8].prop2;
    $extref[7](obj);
}

var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++)
    apart_task_0(JSON.stringify([array, i, result, smth, smthelse, window.obj1.prop1, window.obj1.prop2, window.obj1.method, window.obj2]));

console.log(result);