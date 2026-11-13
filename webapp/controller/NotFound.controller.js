sap.ui.define([
	"wui/sd/rocket2/controller/BaseController"
], (BaseController) => {
	"use strict";

	/**
	 * The NotFound Controller class which contains eventhandler & logic for the NotFound.view.xml
	 *
	 * @class
	 * @name wui.sd.rocket2.controller.NotFound
	 * @extends wui.sd.rocket2.controller.BaseController
	 */
	return BaseController.extend("wui.sd.rocket2.controller.NotFound", {

		/**
		 * Eventhandler: Navigates to the worklist when the link is pressed
		 * @public
		 * @memberof wui.sd.rocket2.controller.NotFound
		 */
		onLinkPressed() {
			this.getRouter().navTo("salesreps");
		}

	});

});
