function apart_task_0($extRef) {
    $extRef = JSON.parse($extRef);
	var num = $extRef[0][$extRef[1]], mul = 1;

	for (var j = 1; j < num; j++) {
		mul *= num;
	}

	$extRef[2][$extRef[1]] = mul;

	postMessage({
	    type: "call",

	    callee: function f(abc) {
			var x = abc + mul + $extRef[0][0] - f.length;
		}.id,

	    arguments: [$extRef[3]]
	});

	var a = {x: $extRef[4]};
	var b = $extRef[5] + $extRef[6];
	var bb = $extRef[5] + $extRef[6];
	var obj = $extRef[8];
	var c = $extRef[8].prop1 + $extRef[8].prop2;

	try {
		var argCount = $extRef[7].length;
		postMessage({
		    type: "call",
		    callee: $extRef[7].id,
		    arguments: [obj]
		});
	} catch (e) {
		var exception = e;
	}

	var e2 = exception || $extRef[9];
	var outerContext = this, outerProp = this.prop;
}

var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++)
    apart_task_0(JSON.stringify([array, i, result, smth, smthelse, window.obj1.prop1, window.obj1.prop2, window.obj1.method, window.obj2, e]));

console.log(result);