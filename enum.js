function Enum () {
	if (!(this instanceof Enum)) {
		return new Enum()
	}
}

Enum.prototype[Symbol.iterator] = function * () {
	while(true) {
		yield Symbol()
	}
}

module.exports = Enum
