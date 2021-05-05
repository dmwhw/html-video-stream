var cp = require('child_process');
const Test = {};
const ProcessUtils = {
	execCmd: function(cmd, options, callback) {
		// cwd <string> 子进程的当前工作目录。默认值: null
		// timeout <number> 默认值: 0。
		return cp.exec(cmd, options, callback);
	},
	execFile: function(file, args, options, callback) {
		// cwd <string> 子进程的当前工作目录。默认值: null
		// timeout <number> 默认值: 0。
		return cp.execFile(file, args, options, callback);
	},
	execFileSync: function(file, args, options, callback) {
		// cwd <string> 子进程的当前工作目录。默认值: null
		// timeout <number> 默认值: 0。
		return cp.execFileSync(file, args, options, callback);
	},
}
module.exports = { ProcessUtils: ProcessUtils, Test: Test }
