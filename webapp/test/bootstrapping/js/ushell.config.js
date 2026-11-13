(() => {
	"use strict";

	window["sap-ushell-config"] = {
		defaultRenderer : "fiori2",
		renderers: {
			fiori2: {
				componentData: {
					config: {
						search: "hidden",
						enableSearch: false
					}
				}
			}
		},
		applications: {
			"SeedApp-display": {
				additionalInformation: "SAPUI5.Component=wui.sd.rocket2",
				applicationType: "URL",
				url: "../../",
				description: "Seed Application",
				title: "UI5 Seed App"
			}
		},
		bootstrapPlugins: {
			wuiFlpPluginStatistics: {
				component: "wui.flp.plugin.statistics",

				self: {
					name: "wui.flp.plugin.statistics"
				},
				asyncHints: {
					libs: [{
						name: "sap.ui.core"
					}],
					requests: [{
						name: "sap.ui.fl.changes",
						reference: "wui.flp.plugin.statistics.Component"
					}]
				},
				config: {
					"": ""
				}
			}
		}
	};

})();
