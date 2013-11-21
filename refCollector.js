var
	recast = require('recast'),
	RefNode = require('./refNode')
;

var RefCollector = module.exports = recast.Visitor.extend({
	init: function (parent) {
		this.refTree = new RefNode();
		this.decls = Object.create(parent ? parent.decls : null);
	},

	declare: function (decl) {
		this.decls[decl.name] = decl;
	},

	visitFunctionDeclaration: function (func) {
		this.declare(func.id);
		this.visitFunctionExpression(func);
	},

	visitVariableDeclarator: function (decl) {
		this.declare(decl.id);
		this.visit(decl.init);
	},

	visitFunctionExpression: function (func) {
		var refCollector = new RefCollector(this);

		if (func.id) {
			refCollector.declare(func.id);
		}

		func.params.forEach(function (param) {
			refCollector.declare(param);
		});

		refCollector.visit(func.body);

		this.refTree.importRefs(refCollector.refTree);
	},

	visitLabeledStatement: function (stmt) {
		this.visit(stmt.body);
	},

	visitProperty: function (prop) {
		this.visit(prop.value);
	},

	reference: function (parentRef, name, asn, onStaticResult) {
		if (parentRef.isUsed) return;

		var ref = parentRef.getSub(name, [asn]);
		onStaticResult ? onStaticResult.call(this, ref) : ref.use();
	},

	visitIdentifier: function (id, onStaticResult) {
		this.reference(
			this.refTree,
			id.name,
			id,
			onStaticResult
		);
	},

	visitMemberExpression: function (member, onStaticResult) {
		if (member.computed && member.property.type !== 'Literal') {
			this.visit(member.object);
			this.visit(member.property);
		} else
		if (member.object.type === 'MemberExpression' || member.object.type === 'Identifier') {
			this['visit' + member.object.type](member.object, function (staticParent) {
				this.reference(
					staticParent,
					member.property.type === 'Literal' ? String(member.property.value) : member.property.name,
					member,
					onStaticResult
				);
			});
		} else {
			this.visit(member.object);
		}
	}
});