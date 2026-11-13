module.exports = (config) => {
	"use strict";

	require("./karma.conf")(config);
	config.set({
		browsers: ["ChromeHeadless"],
		singleRun: true,
		coverageReporter: {
			includeAllSources: true,
			dir: "reports/coverage",
			reporters: [{
				type: "html",
				subdir: "report-html"
			}, {
				type: "cobertura",
				subdir: "."
			}, // jenkins
			{
				type: "text"
			}],
		},
		preprocessors: {
			"{webapp,webapp/!(thirdparty|themes|test)}/!(library|*Renderer)*.js": ["coverage"]
		},
		reporters: ["progress", "coverage"]
	});
};
