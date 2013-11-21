var
	recast = require('recast'),
	b = recast.builders,
	RefCollector = require('./refCollector')
;

var $extRefId = b.identifier('$extref');
var parseParamsStmt = b.expressionStatement(b.assignmentExpression('=', $extRefId, b.callExpression(b.memberExpression(b.identifier('JSON'), b.identifier('parse'), false), [$extRefId])));

module.exports = recast.Visitor.extend({
	init: function (label, prefix) {
		this.label = label;
		this.prefix = prefix;
		this.tasks = [];
	},

	visitLabeledStatement: function (stmt) {
		if (stmt.label.name !== this.label) return;

		var id = b.identifier(this.prefix + this.tasks.length);

		var func = b.functionDeclaration(
			id,
			[$extRefId],
			stmt.body.type !== 'BlockStatement' ? b.blockStatement([stmt.body]) : stmt.body
		);

		this.tasks.push(func);

		var args = [];

		var refCollector = new RefCollector();
		refCollector.visit(func);

		refCollector.refTree.traverse(function () {
			if (!this.isUsed) return;

			var indexLit = b.literal(args.push(this.toASN()) - 1);

			this.asnList.forEach(function (asn) {
				asn.type = 'MemberExpression';
				asn.object = $extRefId;
				asn.property = indexLit;
				asn.computed = true;
			});
		});

		// fs.writeFileSync('test/refs.json', JSON.stringify(refCollector.refTree, null, '\t'));

		stmt.body.body.unshift(parseParamsStmt);

		return b.expressionStatement(b.callExpression(id, [b.callExpression(b.memberExpression(b.identifier('JSON'), b.identifier('stringify'), false), [b.arrayExpression(args)])]));
	}
});