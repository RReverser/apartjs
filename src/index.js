var
	fs = require('fs'),
	recast = require('recast'),
	ApartTransformer = require('./apartTransformer')
;

console.log('Reading original file...');

var ast = recast.parse(fs.readFileSync(__dirname + '/../test/source.js'));

console.log('Analyzing and transformation in progress...');

var apartTransformer = new ApartTransformer();
apartTransformer.visit(ast);

ast.program.body = apartTransformer.tasks.concat(ast.program.body);

fs.writeFileSync(__dirname + '/../test/source.out.js', recast.print(ast, {useTabs: true}).code);

console.log('Finished.');