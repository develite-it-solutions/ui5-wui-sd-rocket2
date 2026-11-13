sap.ui.define([
	"wui/sd/rocket2/controller/BaseController",
	"wui/sd/rocket2/model/formatter",
	"sap/m/MessageToast",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, formatter, MessageToast, MessageBox, Filter, FilterOperator) {
	"use strict";

	/**
	 * The Customers Controller class which contains eventhandler & logic for the Customers.view.xml
	 *
	 * @class
	 * @name wui.sd.rocket2.controller.Customers
	 * @extends wui.sd.rocket2.controller.Customers
	 */
	return BaseController.extend("wui.sd.rocket2.controller.Customers", {

		formatter: formatter,

		/**
		 * Lifecycle method, called by the framework when initializing this controller
		 * @memberof wui.sd.rocket2.controller.Home
		 * @public
		 */
		onInit : function () {
			this._oAppViewModel = this.getOwnerComponent().getModel("appView");
			this._oDataModel = this.getOwnerComponent().getModel();
			this._oOnlineModel = this.getOwnerComponent().getModel("rocket2Online");

			this._sReadGroup = "ReadData";
			this._sUpdateGroup = "UpdateCustomers";
			this._oOnlineModel.setDeferredGroups([this._sReadGroup, this._sUpdateGroup]);

			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.getRoute("customers").attachPatternMatched(this._onRouteMatched, this);
			this._oOnlineModel.attachMetadataLoaded(this._onMetadataLoaded, this);
		},

		/**
		 * Routehandler: matches the customer route, navigates to the first tab, skipps browser history
		 * @param {sap.ui.base.Event} oEvent routing event
		 */
		_onRouteMatched: function (oEvent) {
			if (oEvent.getParameters() === undefined) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
			if (oEvent.getParameters().arguments === undefined) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}

			this._sSalesOrganization = oEvent.getParameter("arguments")["salesOrganization"];
			this._sSalesMan = oEvent.getParameter("arguments")["salesMan"];

			var oFilter = Array();
			oFilter.push(new Filter("SalesMan", FilterOperator.EQ, this._sSalesMan));

			var oSalesRepSet = this._oDataModel.getProperty("/SalesRepSet");
			if (oSalesRepSet === undefined) {
				this._oOnlineModel.read("/HeaderSet", {
					groupId: this._sReadGroup,
					success: function (oData) {
						if (oData.results.length >= 1) {
							oData.results.forEach(oResult => {
								if (oResult.Currency === "") { oResult.Currency = "EUR"; }
							});
						}

						this._oDataModel.setProperty("/SalesRepSet", oData.results);
						this._selectSalesRep();
					}.bind(this),
					error: function (oEvent) {
						var sMessage = this.getResourceBundle().getText("customersLoadSalesRepErrorMessage", [this._sSalesMan]);
						MessageToast.show(sMessage);
					}.bind(this)
				});
			} else {
				this._selectSalesRep();
			}
			this._oOnlineModel.read("/PositionSet", {
				groupId: this._sReadGroup,
				filters: oFilter,
				success: function (oData) {
					oData.results.forEach(oResult => {
						oResult.ZvpconvVariantOri = oResult.ZvpconvVariant;
						oResult.IsExpanded = false;

						if (Number(oResult.TOTotalPY) === 0) {
							oResult.TOTotalChange = 0.00;
						} else {
							oResult.TOTotalChange = Math.round((oResult.TOTotalAY - oResult.TOTotalPY) / oResult.TOTotalPY * 10000) / 100;
						}
						if (Number(oResult.TOPriceGroupPY) === 0) {
							oResult.TOPriceGroupChange = 0.00;
						} else {
							oResult.TOPriceGroupChange = Math.round(( oResult.TOPriceGroupAY - oResult.TOPriceGroupPY) / oResult.TOPriceGroupPY * 10000) / 100;
						}
						oResult.MarketPriceLevelTotalAY = Math.round(oResult.MarketPriceLevelTotalAY * 10000) / 100;
						oResult.MarketPriceLevelTotalPY = Math.round(oResult.MarketPriceLevelTotalPY * 10000) / 100;
						if (Number(oResult.MarketPriceLevelTotalPY) === 0) {
							oResult.MarketPriceLevelTotalChange = 0.00;
						} else {
							oResult.MarketPriceLevelTotalChange = Math.round((oResult.MarketPriceLevelTotalAY - oResult.MarketPriceLevelTotalPY) * 100) / 100;
						}
					});
					this._oDataModel.setProperty("/CustomersSet", oData.results);
				}.bind(this),
				error: function (oEvent) {
					var sMessage = this.getResourceBundle().getText("customersLoadCustomersErrorMessage", [this._sSalesMan]);
					MessageToast.show(sMessage);
				}.bind(this)
			});
			this._oOnlineModel.submitChanges({
				groupId: this._sReadGroup,
				success: this._readSucceeded.bind(this),
				error: this._readFailed.bind(this)
			})
		},

		/**
		 * Bind data to view
		 * @param {String} sObjectPath Object Path
		 */
		_bindView: function(sObjectPath) {
			this.getView().bindElement({
				path: sObjectPath,
				events: {
					change: this._onBindingChange.bind(this),
					dataReceived: function () {
						this._oAppViewModel.setProperty("/busy", false);
					}
				}
			});
		},

		/**
		 * Check, if context could be bound
		 */
		_onBindingChange: function() {
			var oView = this.getView(),
			oElementBinding = oView.getElementBinding();

			// No data for the binding
			if (!oElementBinding.getBoundContext()) {
				this.getRouter().getTargets().display("objectNotFound");
				return;
			}
		},

		/**
		 * Set busy indicator, after metadata has been loaded
		 * @param {sap.ui.base.Event} oEvent routing event
		 */
		_onMetadataLoaded: function(oEvent) {
			// Busy indicator on view should only be set if metadata is loaded,
			// otherwise there may be two busy indications next to each other on the
			// screen. This happens because route matched handler already calls '_bindView'
			// while metadata is loaded.
			this._oAppViewModel.setProperty("/busy", true);

			var sObjectPath = this._oOnlineModel.createKey("HeaderSet", {
				SalesOrganization: this._sSalesOrganization,
				SalesMan: this._sSalesMan
			});
			this._bindView(`/${sObjectPath}`);
		},

		/**
		 * Read data succeeded: Hide busy indicator
		 * @param {Object} oData Data, which has been read
		 */
		_readSucceeded: function(oData) {
			this._oAppViewModel.setProperty("/busy", false);
		},

		/**
		 * Read data failed: Hide busy indicator
		 * @param {Object} oError Error object
		 */
		_readFailed: function(oError) {
			this._oAppViewModel.setProperty("/busy", false);
		},

		/**
		 * Sales Rep selected (press-Event): Load detail data for sales rep
		 */
		_selectSalesRep: function() {
			var oSalesRepSet = this._oDataModel.getProperty("/SalesRepSet");
			oSalesRepSet.forEach(oSalesRep => {
				if (oSalesRep.SalesMan === this._sSalesMan) {
					this._oDataModel.setProperty("/SelectedSalesRep", oSalesRep);
				}
			});
		},

		/**
		 * Save button pressed: Send data to backend
		 * @param {sap.ui.base.Event} oEvent routing event
		 */
		pressSaveButton: function(oEvent) {
			var oCustomersSet = this._oDataModel.getProperty("/CustomersSet");

			var iVariant0Counter = 0;
			var iCustomerCounter = 0;
			oCustomersSet.forEach(oCustomer => {
				iCustomerCounter += 1;
				if (oCustomer.ZvpconvVariant === 0) { iVariant0Counter += 1; }
			});

			var iPercentageVariant0 = iVariant0Counter / iCustomerCounter * 100;
			var iMaxPercentageVariant0 = this._oDataModel.getProperty("/Settings").MaxPercentageVariant0;
			if (iPercentageVariant0 > iMaxPercentageVariant0) {
				// Error, to often variant 0 selected!
				var sMessage = this.getResourceBundle().getText("customersUpdateDataTooOftenVar0SelectedMessage");
				MessageToast.show(sMessage);
			} else {
				oCustomersSet.forEach(oCustomer => {
					if (oCustomer.ZvpconvVariant !== oCustomer.ZvpconvVariantOri) {
						var oUpdate = {};
						oUpdate.SalesOrganization = oCustomer.SalesOrganization;
						oUpdate.SalesMan = oCustomer.SalesMan;
						oUpdate.Customer = oCustomer.Customer;
						oUpdate.ZvpconvVariant = oCustomer.ZvpconvVariant;
						var sObjectPath = this._oOnlineModel.createKey("PositionSet", {
							SalesOrganization: this._sSalesOrganization,
							SalesMan: this._sSalesMan,
							Customer: oCustomer.Customer
						});
						this._oOnlineModel.update(
							`/${sObjectPath}`,
							oUpdate,
							{
								groupId: this._sUpdateGroup,
							}
						);
					}
				});

			this._oOnlineModel.submitChanges({
				groupId: this._sUpdateGroup,
				success: this._updateSucceeded.bind(this),
				error: this._updateFailed.bind(this)
			})
		}
		},

		/**
		 * Save data succeeded: Send data to backend
		 * @param {sap.ui.base.Event} oEvent Event Object
		 */
		_updateSucceeded: function(oData) {
			var sErrorMessage = "";
			var sMessage = "";
			oData.__batchResponses.forEach(oBatchResponse => {
				if (oBatchResponse.response !== undefined) {
					// Fehler beim Update passiert!
					var oResponse = JSON.parse(oBatchResponse.response.body);
					sErrorMessage = oResponse.error.message.value;
				}
			});

			if (sErrorMessage !== "") {
				sMessage = this.getResourceBundle().getText("customersUpdateDataErrorMessage", [sErrorMessage]);
			} else {
				sMessage = this.getResourceBundle().getText("customersUpdateDataSucceededfulMessage");

				var oCustomersSet = this._oDataModel.getProperty("/CustomersSet");
				var oSalesRepSet = this._oDataModel.getProperty("/SalesRepSet");

				var iProjectedTOChangeSalesMan = 0;
				oSalesRepSet.forEach(oSalesRep => {
					if (oSalesRep.SalesOrganization === this._sSalesOrganization && oSalesRep.SalesMan === this._sSalesMan) {
						oSalesRep.CountZvpconvVar0 = 0;
						oSalesRep.CountZvpconvVar1 = 0;
						oSalesRep.ProjectedTOChangeSalesMan = 0;

						oCustomersSet.forEach(oCustomer => {
							if (oCustomer.ZvpconvVariant === 0) {
								oSalesRep.CountZvpconvVar0 += 1;
								oSalesRep.ProjectedTOChangeSalesMan += Math.round(Number(oCustomer.ProjectedTOChangeCustomer) * 100);
							}
							if (oCustomer.ZvpconvVariant === 1) { oSalesRep.CountZvpconvVar1 += 1; }

							// Set the original value to the saved value
							// Else, if the user changes the radiobutton again and wants to save, the program doesn't update the value
							oCustomer.ZvpconvVariantOri = oCustomer.ZvpconvVariant;
						});

						oSalesRep.ProjectedTOChangeSalesMan = Math.round(oSalesRep.ProjectedTOChangeSalesMan) / 100;
					}

					iProjectedTOChangeSalesMan += Number(oSalesRep.ProjectedTOChangeSalesMan);
				});

				this._oDataModel.setProperty("/SalesRepSet", oSalesRepSet);

				iProjectedTOChangeSalesMan = Math.round(iProjectedTOChangeSalesMan * 100) / 100;
				this._oDataModel.setProperty("/ProjectedTOChangeAllSalesMan", iProjectedTOChangeSalesMan);
			}
			MessageToast.show(sMessage);
		},
		/**
		 * Save button pressed: Send data to backend
		 */
		_updateFailed: function() {
			var sMessage = this.getResourceBundle().getText("customersUpdateDataFailedMessage");
			MessageToast.show(sMessage);
		}
	});
});
