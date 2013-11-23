var
	recast = require('recast'),
	RefNode = require('./refNode')
;

var RefCollector = module.exports = recast.Visitor.extend({
	init: function (parent) {
		this.refTree = new RefNode();
		this.decls = Object.create(parent ? parent.decls : null);
	},

	reference: function (parentRef, name, asn, onStaticResult) {
		if (parentRef.isUsed || (parentRef === this.refTree && this.decls[name])) return;

		var ref = parentRef.getSub(name, [asn]);
		onStaticResult ? onStaticResult.call(this, ref) : ref.isUsed = true;
	},

	visitFunctionDeclaration: function (func) {
		this.decls[func.id.name] = true;
		this.visitFunctionExpression(func);
	},

	visitVariableDeclarator: function (decl) {
		this.decls[decl.id.name] = true;
		this.visit(decl.init);
	},

	visitFunctionExpression: function (func) {
		var refCollector = new RefCollector(this);

		if (func.id) {
			refCollector.decls[func.id.name] = true;
		}

		func.params.forEach(function (param) {
			refCollector.decls[param.name] = true;
		});

		refCollector.visit(func.body);

		refCollector.refTree
		.each(function (ref) {
			if (refCollector.decls[ref.name]) {
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

	visitTryStatement: function (stmt) {
		this.visit(stmt.block);

		stmt.handlers.forEach(function (handler) {
			var
				name = handler.param.name,
				wasNameDeclared = this.decls[name]
			;
			this.decls[name] = true;
			this.visit(handler.body);
			this.decls[name] = wasNameDeclared;
		}, this);

		this.visit(stmt.finalizer);
	},

	visitLabeledStatement: function (stmt) {
		this.visit(stmt.body);
	},

	visitProperty: function (prop) {
		this.visit(prop.value);
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