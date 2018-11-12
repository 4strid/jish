const repl = require('repl')
const { spawn } = require('child_process')

const Enum = require('./enum')
const Delegator = require('./delegator')

const delegator = new Delegator(process.stdin, process.stdout, process.stderr)

const [INTERNAL, SHELL] = new Enum()

const executors = {
	[INTERNAL] (cmd, args, done) {
		switch (cmd) {
		case 'exit': process.exit(0)
		}
	},
	[SHELL] (cmd, args, done) {
		const subprocess = spawn(cmd, args)
		delegator.push(subprocess)
		subprocess.on('close', () => delegator.pop())
	},
}

const commands = {
	vim: SHELL,
	echo: SHELL,
	exit: INTERNAL,
}

function input (cmd, ctx, filename, done) {
	const words = cmd.trim().split(' ')
	const [arg0, ...args] = words
	if (arg0 in commands) {
		executors[commands[arg0]](arg0, args, done)
	} else {
		try {
			done(null, eval(cmd))
		} catch (e) {
			done(e)
		}
	}
}

const pipes = delegator.Pipes()
delegator.push(pipes)
repl.start({ prompt: '(jish) $ ', eval: input, input: pipes.stdin, output: pipes.stdout })
