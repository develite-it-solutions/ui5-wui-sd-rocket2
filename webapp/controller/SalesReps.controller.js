sap.ui.define([
	"wui/sd/rocket2/controller/BaseController",
	"wui/sd/rocket2/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/f/library"
], function (BaseController, formatter, MessageToast, MessageBox, fioriLibrary) {
	"use strict";

	/**
	 * The Customers SalesReps class which contains eventhandler & logic for the SalesReps.view.xml
	 *
	 * @class
	 * @name wui.sd.rocket2.controller.SalesReps
	 * @extends wui.sd.rocket2.controller.SalesReps
	 */
	return BaseController.extend("wui.sd.rocket2.controller.SalesReps", {

		formatter: formatter,

		/**
		 * Lifecycle method, called by the framework when initializing this controller
		 * @memberof wui.sd.rocket2.controller.SalesReps
		 * @public
		 */
		onInit : function () {
			this._sSelectedSalesMan = "";

			this._oAppViewModel = this.getOwnerComponent().getModel("appView");
			this._oDataModel = this.getOwnerComponent().getModel();
			this._oOnlineModel = this.getOwnerComponent().getModel("rocket2Online");

			this._sReadGroup = "ReadData";
			this._oOnlineModel.setDeferredGroups([this._sReadGroup]);

			this.getRouter().getRoute("salesreps").attachPatternMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("customers").attachPatternMatched(this._onRouteMatched, this);
		},

		/**
		 * Routehandler: matches the customer route, navigates to the first tab, skipps browser history
		 * @param {sap.ui.base.Event} oEvent routing event
		 */
		_onRouteMatched: function (oEvent) {
			if (oEvent.getParameter("arguments") !== undefined) {
				this._sSelectedSalesMan = oEvent.getParameter("arguments")["salesMan"];
			}

			if (this._oDataModel.getProperty("/SalesRepSet") === undefined) {
				this._oOnlineModel.read("/HeaderSet", {
					groupId: this._sReadGroup,
					success: function (oData) {
						if (oData.results.length >= 1) {
							var iProjectedTOChangeSalesMan = 0;
							var sProjectedTOChangeSalesManCurrency = "";
							oData.results.forEach(oResult => {
								iProjectedTOChangeSalesMan += Math.round(Number(oResult.ProjectedTOChangeSalesMan) * 100) / 100;
								if (oResult.Currency === "") { oResult.Currency = "EUR"; }
								if (sProjectedTOChangeSalesManCurrency === "") { sProjectedTOChangeSalesManCurrency = oResult.Currency; }
								oResult.MarketPriceLevelTotal12M = Math.round(oResult.MarketPriceLevelTotal12M * 10000) / 100;
							});
							iProjectedTOChangeSalesMan = Math.round(iProjectedTOChangeSalesMan * 100) / 100;
							this._oDataModel.setProperty("/ProjectedTOChangeAllSalesMan", iProjectedTOChangeSalesMan);
							this._oDataModel.setProperty("/ProjectedTOChangeAllSalesManCurrency", sProjectedTOChangeSalesManCurrency);

							this._oDataModel.setProperty("/SalesRepSet", oData.results);

							if (oData.results.length === 1) {
								// Automatically load the customers of the first sales rep -> Load customers automatically!
								var sSalesOrganization = oData.results[0].SalesOrganization;
								var sSalesMan = oData.results[0].SalesMan;
								this._navToCustomer(sSalesOrganization, sSalesMan);
							}
						}
					}.bind(this),
					error: function (oEvent) {
						var sMessage = this.getResourceBundle().getText("salesRepsLoadHeaderSetErrorMessage");
						MessageToast.show(sMessage);
					}.bind(this)
				});
			}

			if (this._oDataModel.getProperty("/SettingSet") === undefined) {
				this._oOnlineModel.read("/SettingSet", {
					groupId: this._sReadGroup,
					success: function (oData) {
						var oSettingStructure = { Editable: false, MaxPercentageVariant0: 100 };
						oData.results.forEach(oSetting => {
							if (oSetting.SettingId === '01') {
								if (oSetting.SettingValue === 'X') {
									oSettingStructure.Editable = true;
								} else {
									oSettingStructure.Editable = false;
								}
							}
							if (oSetting.SettingId === '02') {
								oSettingStructure.MaxPercentageVariant0 = oSetting.SettingValue;
							}
						});
						this._oDataModel.setProperty("/Settings", oSettingStructure);
					}.bind(this),
					error: function (oEvent) {
						var sMessage = this.getResourceBundle().getText("salesRepsLoadSettingSetErrorMessage");
						MessageToast.show(sMessage);
					}.bind(this)
				});
			}

			this._oOnlineModel.submitChanges({
				groupId: this._sReadGroup,
				success: this._readSucceeded.bind(this),
				error: this._readFailed.bind(this)
			})
		},

		/**
		 * Row press handler for sales reps list
		 * @param {sap.ui.base.Event} oEvent routing event
		 */
		onPressSalesMan: function(oEvent) {
			var sSalesOrganizationPath = oEvent.getSource().getBindingContext().getPath();
			var sSalesOrganization = this._oDataModel.getProperty(sSalesOrganizationPath).SalesOrganization;
			var sSalesManPath = oEvent.getSource().getBindingContext().getPath();
			var sSalesMan = this._oDataModel.getProperty(sSalesManPath).SalesMan;
			this._navToCustomer(sSalesOrganization, sSalesMan);
		},

		/**
		 * Read data succeeded
		 * @param {String} sSalesOrganization Sales Organization
		 * @param {String} sSalesMan Salesman
		 */
		_navToCustomer: function(sSalesOrganization, sSalesMan) {
			if (sSalesMan !== this._sSelectedSalesMan) {
				this._oAppViewModel.setProperty("/busy", true);
				this._sSelectedSalesMan = sSalesMan;
				this.getRouter().navTo("customers", {layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded, salesOrganization: sSalesOrganization, salesMan: sSalesMan});
			}
		},

		/**
		 * Read data succeeded
		 * @param {Object} oData oData Object
		 */
		_readSucceeded: function(oData) {
			this._oAppViewModel.setProperty("/busy", false);
		},

		/**
		 * Read data failed
		 * @param {Object} oError Error Object
		 */
		_readFailed: function(oError) {
			this._oAppViewModel.setProperty("/busy", false);
			var sMessage = this.getResourceBundle().getText("salesRepsReadDataFailedMessage");
			MessageToast.show(sMessage);
		}
	});
});
