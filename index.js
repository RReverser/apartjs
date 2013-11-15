var
	fs = require('fs'),
	recast = require('recast'),
	b = recast.builders
;

var ApartVisitor = recast.Visitor.extend({
	init: function () {
		this.tasks = [];
		this.increment = 0;
	},

	clear: function () {
		
	},

	visitLabeledStatement: function (statement) {
		if (statement.label.name !== 'apart') return;

		var id = b.identifier('apart_task_' + this.increment++);

		this.tasks.push(b.functionDeclaration(
			id,
			[],
			statement.body
		));

		return b.expressionStatement(b.callExpression(id, []));
	}
});

var ast = recast.parse(fs.readFileSync('test/source.js'));

var apartVisitor = new ApartVisitor();
apartVisitor.visit(ast);
apartVisitor.clear();

ast.program.body = apartVisitor.tasks.concat(ast.program.body);

fs.writeFileSync('test/source.out.js', recast.print(ast));