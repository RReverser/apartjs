var
	fs = require('fs'),
	recast = require('recast'),
	ApartTransformer = require('./apartTransformer')
;

var ast = recast.parse(fs.readFileSync('test/source.js'));

// fs.writeFileSync('test/source.json', JSON.stringify(ast, null, '\t'));

var apartVisitor = new ApartTransformer('apart', 'apart_task_');
apartVisitor.visit(ast);

ast.program.body = apartVisitor.tasks.concat(ast.program.body);

// fs.writeFileSync('test/source.out.json', JSON.stringify(ast, null, '\t'));
fs.writeFileSync('test/source.out.js', recast.print(ast));