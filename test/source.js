var array = [1, 2, 3, 4],
	result = new Array(array.length);

for (var i = 0; i < array.length; i++) apart:{
	var num = array[i], mul = 1;
	for (var j = 1; j < num; j++) {
		mul *= num;
	}
	result[i] = mul;
}

console.log(result);