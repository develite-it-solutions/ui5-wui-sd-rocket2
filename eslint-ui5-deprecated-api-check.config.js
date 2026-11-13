const globals = require("globals");
const wuiDeprecatedCheckPlugin = require("@wui/eslint-plugin-deprecated-api-plugin");
const xmlParser = require("eslint-xml-parser");

module.exports = [
	{
		ignores: [
			"dist/**",
			"mta_archives/**",
			"node_modules/**",
			"resources/**",
			".vscode",
			"thirdparty/**",
			"reports/**",
			"jsdoc/**",
			"webapp/test/testsuite.qunit.js",
			"webapp/test/integration/opaTests.qunit.js",
			"webapp/test/bootstrapping/js/ushell.index.js", // remove once solving createRednerer alternative
			"webapp/test/bootstrapping/js/ushell-mockserver.index.js", // remove once solving createRednerer alternative
			"webapp/test/bootstrapping/js/ushell.config.js"
		]
	},
    {
        files: ["**/*.js"],
        plugins: {
            "wuiDeprecatedCheckPlugin": wuiDeprecatedCheckPlugin
        },
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "script",
            globals: {
                ...globals.browser,
                ...globals.es2022,
                ...globals.node,
                ...globals.qunit,
                ...globals.jquery,
                sap: true
            }
        },
        rules: {
            "wuiDeprecatedCheckPlugin/deprecated_check": [1, { ui5version: "1.120" }]
        }
    },
    {
        files: ["**/*.xml"],
        languageOptions: {
            parser: xmlParser
        },
        plugins: {
            "wuiDeprecatedCheckPlugin": wuiDeprecatedCheckPlugin
        },
        rules: {
            "wuiDeprecatedCheckPlugin/deprecated_check": [1, { ui5version: "1.120" }]
        }
    }
]
