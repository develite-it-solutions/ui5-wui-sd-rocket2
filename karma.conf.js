module.exports = (config) => {
	"use strict";

	config.set({
		frameworks: ["ui5"],
		reporters: ["progress"],
		browsers: ["ChromeHeadless"],
		browserConsoleLogOptions: {
			level: "info",
		},
		ui5: {
			configPath: "ui5-local.yaml"
		},
		browserNoActivityTimeout: 120000
	});
};
