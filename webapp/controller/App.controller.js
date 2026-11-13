sap.ui.define([
	"wui/sd/rocket2/controller/BaseController",
	"sap/ui/model/json/JSONModel"
], (BaseController, JSONModel) => {
	"use strict";

	/**
	 * The App Controller class which contains eventhandler & logic for the App.view.xml
	 *
	 * @class
	 * @name wui.sd.rocket2.controller.App
	 * @extends wui.sd.rocket2.controller.BaseController
	 */
	return BaseController.extend("wui.sd.rocket2.controller.App", {

		/**
		 * Lifecycle method, called by the framework when initializing this controller
		 * @memberof wui.sd.rocket2.controller.App
		 * @public
		 */
		onInit() {
			const oModel = new JSONModel({
				busy : false,
				delay : 0
			});
			this.getView().setModel(oModel, "appView");

			// apply content density mode to root
			this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());
		}

	});

});
