var
	fs = require('fs'),
	recast = require('recast'),
	b = recast.builders
;

var RefCollector = recast.Visitor.extend({
	init: function (parent) {
		this.refSets = Object.create(null);
		this.decls = Object.create(parent ? parent.decls : null);
	},

	addRef: function (ref) {
		var refName = recast.prettyPrint(ref);
		(this.refSets[refName] || (this.refSets[refName] = [])).push(ref);
	},

	addDecl: function (decl) {
		this.decls[recast.prettyPrint(decl)] = decl;
	},

	visitFunctionDeclaration: function (func) {
		this.addDecl(func.id);
		this.visitFunctionExpression(func);
	},

	visitVariableDeclarator: function (decl) {
		this.addDecl(decl.id);
		this.visit(decl.init);
	},

	visitFunctionExpression: function (func) {
		var refCollector = new RefCollector(this);
		func.params.forEach(function (param) {
			refCollector.addDecl(param);
		});
		refCollector.visit(func.body);
		
		Object.keys(refCollector.refSets)
		.filter(function (refName) { return !(refName in refCollector.decls) })
		.forEach(function (refName) {
			if (!(refName in this.refSets)) {
				this.refSets[refName] = [];
			}
			this.refSets[refName] = this.refSets[refName].concat(refCollector.refSets[refName]);
		}, this);
	},

	visitProperty: function (prop) {
		this.visit(prop.value);
	},

	visitIdentifier: function (id) {
		this.addRef(id);
	},

	visitMemberExpression: function (member) {
		this.visit(member.object);
	}
});

var $extref_id = b.identifier('$extref');
var parseParamsStmt = b.expressionStatement(b.assignmentExpression('=', $extref_id, b.callExpression(b.memberExpression(b.identifier('JSON'), b.identifier('parse'), false), [$extref_id])));

var ApartVisitor = recast.Visitor.extend({
	init: function () {
		this.tasks = [];
		this.increment = 0;
	},

	visitLabeledStatement: function (statement) {
		if (statement.label.name !== 'apart') return;

		if (statement.body.type !== 'BlockStatement') {
			statement.body = b.blockStatement([statement.body]);
		}

		var refCollector = new RefCollector();
		refCollector.visit(statement.body.body);

		var id = b.identifier('apart_task_' + this.increment++);

		var func = b.functionDeclaration(
			id,
			[$extref_id],
			statement.body
		);

		this.tasks.push(func);

		var args = [];

		Object.keys(refCollector.refSets).forEach(function (refName, index) {
			args.push(recast.parse(refName).program.body[0].expression);

			var index_lit = b.literal(index);

			refCollector.refSets[refName].forEach(function (ref) {
				ref.type = 'MemberExpression';
				ref.object = $extref_id;
				ref.property = index_lit;
				ref.computed = true;
			});
		});

		statement.body.body.unshift(parseParamsStmt);

		return b.expressionStatement(b.callExpression(id, [b.callExpression(b.memberExpression(b.identifier('JSON'), b.identifier('stringify'), false), [b.arrayExpression(args)])]));
	}
});

var ast = recast.parse(fs.readFileSync('test/source.js'));

var apartVisitor = new ApartVisitor();
apartVisitor.visit(ast);

ast.program.body = apartVisitor.tasks.concat(ast.program.body);

fs.writeFileSync('test/source.out.js', recast.print(ast));