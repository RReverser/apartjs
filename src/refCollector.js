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
		this.decls[decl.name] = true;
	},

	reference: function (parentRef, name, asn, onStaticResult) {
		if (parentRef.isUsed) return;

		var ref = parentRef.getSub(name, [asn]);
		onStaticResult ? onStaticResult.call(this, ref) : ref.isUsed = true;
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

		refCollector.refTree
		.each(function (ref) {
			if (ref.name in refCollector.decls) {
				this.removeSub(ref.name);
			}
		})
		.traverse(function (ref, destParent) {
			if (destParent.isUsed) return;

			var copy = destParent.getSub(ref.name, ref.asnList);

			if (ref.isUsed) {
				copy.isUsed = true;
			}

			return copy;
		}, this.refTree);
	},

	visitLabeledStatement: function (stmt) {
		this.visit(stmt.body);
	},

	visitProperty: function (prop) {
		this.visit(prop.value);
	},

	visitThisExpression: function (expr, onStaticResult) {
		this.reference(
			this.refTree,
			'this',
			expr,
			onStaticResult
		);
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
		} else {
			switch (member.object.type) {
				case 'MemberExpression':
				case 'Identifier':
				case 'ThisExpression':
					this['visit' + member.object.type](member.object, function (staticParent) {
						this.reference(
							staticParent,
							member.property.type === 'Literal' ? String(member.property.value) : member.property.name,
							member,
							onStaticResult
						);
					});
					break;

				default:
					this.visit(member.object);
			}
		}
	}
});