sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History",
	"sap/ui/core/Fragment"
], (Controller, History, Fragment) => {
	"use strict";

	/**
	 * The Apps parent Controller class which provides some fundamental coding which is used in more than one controller
	 *
	 * @class
	 * @name wui.sd.rocket2.controller.BaseController
	 * @extends sap.ui.core.mvc.Controller
	 */
	return Controller.extend("wui.sd.rocket2.controller.BaseController", {

		/**
		 * Convenience method for accessing the router.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 * @memberof wui.sd.rocket2.controller.BaseController
		 */
		getRouter() {
			return sap.ui.core.UIComponent.getRouterFor(this);
		},

		/**
		 * Convenience method for getting the view model by name.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 * @memberof wui.sd.rocket2.controller.BaseController
		 */
		getModel(sName) {
			return this.getView().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 * @memberof wui.sd.rocket2.controller.BaseController
		 */
		setModel(oModel, sName) {
			return this.getView().setModel(oModel, sName);
		},

		/**
		 * Getter for the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 * @memberof wui.sd.rocket2.controller.BaseController
		 */
		getResourceBundle() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		/**
		 * Event handler for navigating back.
		 * It there is a history entry or an previous app-to-app navigation we go one step back in the browser history
		 * If not, it will navigate to the shell home
		 * @public
		 * @memberof wui.sd.rocket2.controller.BaseController
		 */
		onNavBack() {
			const sPreviousHash = History.getInstance().getPreviousHash();

			if (sap.ushell) {
				sap.ushell.Container.getServiceAsync("CrossApplicationNavigation").then((oCrossAppNavigator) => {
					if (sPreviousHash !== undefined || (oCrossAppNavigator && !oCrossAppNavigator.isInitialNavigation()) ) {
						history.go(-1);
					} else if (oCrossAppNavigator) {
						oCrossAppNavigator.toExternal({
							target: {shellHash: "#Shell-home"}
						});
					}
				});
			} else {
				this.getRouter().navTo("home");
			}
		},

		/**
		 * load a fragment as dialog f. e.
		 * @param {string} sFragment Fragment name incl. path
		 * @param {object} oController Controller object
		 * @param {object} oDependentView View for the Dialog
		 * @returns {object} Fragment Promises
		 */
		loadFragment(sFragment, oController, oDependentView) {
			// check if the global promise store is already available
			if (!this._aFragmentLoadedPromises) {
				this._aFragmentLoadedPromises = [];
			}
			// load the fragment and keep the loading promise
			if (!this._aFragmentLoadedPromises[sFragment]) {
				this._aFragmentLoadedPromises[sFragment] = new Promise((resolve, reject) => {
					// since the oDependentView parameter is optional, try to read the provided controllers view
					oDependentView = oDependentView ? oDependentView : oController.getView();
					Fragment.load({
						id: oDependentView.getId(),
						name: sFragment,
						controller: oController
					}).then((oControl) => {
						if (oDependentView) {
							oDependentView.addDependent(oControl);
						}

						resolve(oControl);
					}).catch(function (oError) {
						reject(oError);
					});
				});
			}
			return this._aFragmentLoadedPromises[sFragment];
		},
	});

});
