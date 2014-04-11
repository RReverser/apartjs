var
	recast = require('recast'),
	b = recast.types.builders,
	RefCollector = require('./refCollector'),
	jsonParseExpr = b.memberExpression(b.identifier('JSON'), b.identifier('parse'), false),
	jsonStringifyExpr = b.memberExpression(b.identifier('JSON'), b.identifier('stringify'), false),
	extRefId = b.identifier('$extRef'),
	parseParamsStmt = b.expressionStatement(b.assignmentExpression(
		'=',
		extRefId,
		b.callExpression(jsonParseExpr, [extRefId])
	))
;

module.exports = recast.Visitor.extend({
	init: function () {
		this.tasks = [];
	},

	visitLabeledStatement: function (stmt) {
		if (stmt.label.name !== 'apart') return;

		var id = b.identifier('apart_task_' + this.tasks.length);

		var func = b.functionDeclaration(
			id,
			[extRefId],
			stmt.body.type !== 'BlockStatement' ? b.blockStatement([stmt.body]) : stmt.body
		);

		this.tasks.push(func);

		var args = [];

		var refCollector = new RefCollector();
		refCollector.visit(func);

		refCollector.refTree.traverse(function (ref) {
			if (!ref.isUsed) return;

			var indexLit = b.literal(args.push(ref.toASN()) - 1);

			ref.asnList.forEach(function (asn) {
				asn.type = 'MemberExpression';
				asn.object = extRefId;
				asn.property = indexLit;
				asn.computed = true;
			});
		});

		stmt.body.body.unshift(parseParamsStmt);

		return b.expressionStatement(b.callExpression(
			id,
			[b.callExpression(jsonStringifyExpr, [b.arrayExpression(args)])]
		));
	}
});