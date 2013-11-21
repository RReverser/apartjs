function RefNode(asnList) {
	this.asnList = asnList || [];
	this.subTree = Object.create(null);
}

RefNode.prototype = {
	get isUsed() {
		return this.subTree === null;
	},
	use: function () {
		this.subTree = null;
		return this;
	},
	addASNs: function (asnList) {
		if (asnList) {
			this.asnList = this.asnList.concat(asnList);
		}
		return this;
	},
	getSub: function (name, asnList) {
		if (name in this.subTree) {
			return this.subTree[name].addASNs(asnList);
		} else {
			return this.subTree[name] = new RefNode(asnList);
		}
	},
	traverse: function (callback, parentResult) {
		this.each(function (name) {
			this.traverse(callback, callback.call(this, name, parentResult));
		});
	},
	importRefs: function (refTree) {
		refTree.traverse(function (name, parent) {
			if (parent.isUsed) return;

			var copy = parent.getSub(name, this.asnList);
			if (this.isUsed) {
				copy.use();
			}
			return copy;
		}, this);
	},
	each: function (callback) {
		if (this.isUsed) return;

		for (var name in this.subTree) {
			callback.call(this.subTree[name], name);
		}
	},
	toASN: function () {
		return (function copy(src) {
			if (src !== null && typeof src === 'object') {
				var res = {};
				for (var name in src) {
					if (name === 'loc') continue;
					res[name] = copy(src[name]);
				}
				return res;
			} else {
				return src;
			}
		})(this.asnList[0]);
	}
};

module.exports = RefNode;