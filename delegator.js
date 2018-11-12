const { PassThrough } = require('stream')
const { spawn } = require('child_process')

function Delegator (stdin, stdout, stderr) {
	if (!this instanceof Delegator) {
		return new Delegator(stdin, stdout, stderr)
	}
	this.STDIO = { stdin, stdout, stderr }
	this.stack = [];
}

Delegator.prototype = {
	Pipes () {
		const stdin = new PassThrough()
		stdin.on('error', () => console.log('stdin error... whatever'))
		const stdout = new PassThrough()
		stdout.on('error', () => console.log('stdout error... whatever'))
		const stderr = new PassThrough()
		stderr.on('error', () => console.log('stderr error... whatever'))
		return { stdin, stdout, stderr }
	},
	push (io) {
		const top = this.peek()
		if (top) {
			this._forIO('unpipe', top)
		}
		this._forIO('pipe', io)
		
		this.stack.push(io)
	},
	pop () {
		const top = this.stack.pop()
		if (!top) {
			return new Error('Called pop() with no items on the stack')
		}
		this._forIO('unpipe', top)
		const prev = this.stack.peek()
		if (prev) {
			this._forIO('pipe', prev)
		}
		for (const s in this.STDIO) {
			this.STDIO[s].resume()
		}
		return null
	},
	peek () {
		return this.stack[this.stack.length - 1]
	},
	pipe (io) {

	},
	_forIO (method, dest, source) {
		source = source || this.STDIO
		source.stdin[method](dest.stdin)
		dest.stdout[method](source.stdout)
		dest.stderr[method](source.stderr)
	}
}

module.exports = Delegator
