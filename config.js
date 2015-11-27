module.exports = require("nconf")
    .argv({
		"dry-run": {
			describe: 'If dry-run mode is on then email objects will be console logged and not sent',
			demand: true,
			type: 'boolean'
		}
	})
    .file({file: 'config.json'})
    .get();
