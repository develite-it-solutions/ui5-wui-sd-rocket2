sap.ui.define([
	"sap/base/Log",
	"sap/ui/core/UIComponent",
	"sap/ui/Device",
	"wui/core/IconPool",
	"wui/core/analytics/FLPStatisticTracker"
], (Log, UIComponent, Device, IconPool, FLPStatisticTracker) => {
	"use strict";

	/**
	 * The Apps root component which is the entry point when loading the UI5 application
	 *
	 * @class
	 * @name wui.sd.rocket2.Component
	 * @extends sap.ui.core.UIComponent https://ui5.sap.com/#/api/sap.ui.core.UIComponent
	 */
	return UIComponent.extend("wui.sd.rocket2.Component", {

		metadata: {
			manifest: "json"
		},

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * In this function, the FLP and device models are set and the router is initialized.
		 * @public
		 * @override
		 * @memberof wui.sd.rocket2.Component
		 */
		init() {
			// call the base component's init function
			UIComponent.prototype.init.apply(this, arguments);

			new IconPool().loadWuiIcons();

			// Init FLPStatisticTracker for custom event tracking
			this._oFLPStatisticTracker = new FLPStatisticTracker(this);

			// create the views based on the url/hash
			this.getRouter().initialize();

			Log.info("Yayyy - wui.sd.rocket2.Component successfully initialized :-)");
		},

		/**
		 * This method can be called to determine whether the sapUiSizeCompact or sapUiSizeCozy
		 * design mode class should be set, which influences the size appearance of some controls.
		 * @public
		 * @return {string} css class, either 'sapUiSizeCompact' or 'sapUiSizeCozy' - or an empty string if no css class should be set
		 * @memberof wui.sd.rocket2.Component
		 */
		getContentDensityClass() {
			if (this._sContentDensityClass === undefined) {
				// check whether FLP has already set the content density class; do nothing in this case
				if (document.body.classList.contains("sapUiSizeCozy") || document.body.classList.contains("sapUiSizeCompact")) {
					this._sContentDensityClass = "";
				} else if (!Device.support.touch) { // apply "compact" mode if touch is not supported
					this._sContentDensityClass = "sapUiSizeCompact";
				} else {
					// "cozy" in case of touch support; default for most sap.m controls, but needed for desktop-first controls like sap.ui.table.Table
					this._sContentDensityClass = "sapUiSizeCozy";
				}
			}
			return this._sContentDensityClass;
		},

		/**
		 * Returns the FLPStatisticTracker instance for this application
		 * @returns {wui.core.analytics.FLPStatisticTracker} the instance
		 */
		getFLPStatisticTracker() {
			return this._oFLPStatisticTracker;
		}

	});

});
