var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++) apart:{
	var num = array[i], mul = 1;
	for (var j = 1; j < num; j++) {
		mul *= num;
	}
	result[i] = mul;

	(function f(abc) {
		var x = abc + mul + array[0] - f.length;
	})(smth);

	var a = {x:smthelse};

	var b = window.obj1.prop1 + window.obj1.prop2;
	var bb = window.obj1['prop1'] + window.obj1['prop2'];
	var obj = window.obj2;
	var c = window.obj2.prop1 + window.obj2.prop2;
	window.obj1.method(obj);
}

console.log(result);