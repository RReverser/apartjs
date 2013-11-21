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
		if (member.computed) {
			this.visit(member.property);
		}

		switch (member.object.type) {
			case 'MemberExpression':
			case 'Identifier':
				return this['visit' + member.object.type](member.object, function (staticParent) {
					if (!member.computed) {
						this.reference(
							staticParent,
							member.property.name,
							member,
							onStaticResult
						);
					} else {
						staticParent.use();
					}
				});

			default:
				return this.visit(member.object);
		}
	}
});