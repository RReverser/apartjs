function RefNode(name, asnList) {
	this.name = name || '';
	this.asnList = asnList || [];
	this.subTree = Object.create(null);
}

RefNode.prototype = {
	get isUsed() {
		return this.subTree === null;
	},

	set isUsed(isUsed) {
		this.subTree = isUsed ? null : (this.subTree || Object.create(null));
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
			return this.subTree[name] = new RefNode(name, asnList);
		}
	},

	removeSub: function (name) {
		delete this.subTree[name];
	},

	traverse: function (callback, parentResult) {
		return this.each(function (ref) {
			ref.traverse(callback, callback.call(this, ref, parentResult));
		});
	},

	each: function (callback) {
		if (!this.isUsed) {
			for (var name in this.subTree) {
				callback.call(this, this.subTree[name]);
			}
		}
		return this;
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