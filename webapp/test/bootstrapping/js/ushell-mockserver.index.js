sap.ui.define([
	"sap/base/Log",
	"wui/sd/rocket2/localservice/mockserver"
], async (Log, mockserver) => {
	"use strict";

	Log.setLevel(Log.Level.ALL);

	mockserver.init();

	// initialize the ushell sandbox component
	const oRenderer = await sap.ushell.Container.createRenderer(true);
	oRenderer.placeAt("content");

});
