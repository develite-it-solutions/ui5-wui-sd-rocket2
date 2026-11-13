sap.ui.define([
	"sap/base/Log"
], async (Log) => {
	"use strict";

	Log.setLevel(Log.Level.ALL);

	// initialize the ushell sandbox component
	const oRenderer = await sap.ushell.Container.createRenderer(true);
	oRenderer.placeAt("content");

});
