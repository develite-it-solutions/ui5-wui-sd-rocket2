module.exports = (config) => {
	"use strict";

	require("./karma-coverage.conf")(config);
	config.set({
		browsers: ["ChromeHeadlessNoSandbox"],
		customLaunchers: {
			ChromeHeadlessNoSandbox: {
				base: "ChromeHeadless",
				flags: ["--no-sandbox","--window-size=1920,1080"],
			},
		},
		coverageReporter: {
			check: {
				each: {
					statements: 0,
					branches: 0,
					functions: 0,
					lines: 0
				}
			}
		}
	});
};
