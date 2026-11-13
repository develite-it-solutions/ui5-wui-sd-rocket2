QUnit.config.autostart = false;

sap.ui.getCore().attachInit(() => {
	"use strict";

	sap.ui.require([
		"wui/sd/rocket2/test/integration/AllJourneys"
	], () => {
		QUnit.start();
	});
});