sap.ui.define([
	"wui/sd/rocket2/controller/BaseController", "wui/sd/rocket2/model/formatter",
	"sap/m/MessageToast", "sap/f/library"
], function (BaseController, formatter, MessageToast, fioriLibrary) {
	"use strict";
	return BaseController.extend("wui.sd.rocket2.controller.SalesReps", {
		formatter,
		onInit() {
			this._sSelectedSalesRep = "";
			this._oAppViewModel = this.getOwnerComponent().getModel("appView");
			this._oDataModel = this.getOwnerComponent().getModel();
			this._oOnlineModel = this.getOwnerComponent().getModel("rocket2Online");
			this._sReadGroup = "ReadData";
			this._oOnlineModel.setDeferredGroups([this._sReadGroup]);
			this.getRouter().getRoute("salesreps").attachPatternMatched(this._onRouteMatched, this);
			this.getRouter().getRoute("customers").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched(oEvent) {
			const oArguments = oEvent.getParameter("arguments") || {};
			this._sSelectedSalesRep = oArguments.salesRep || "";
			if (this._oDataModel.getProperty("/SalesRepSet") !== undefined) { return; }
			this._oOnlineModel.read("/HeaderSet", {
				groupId: this._sReadGroup,
				success: (oData) => {
					const aSalesReps = oData.results || [];
					aSalesReps.forEach((oEntry) => { oEntry.Currency = oEntry.Currency || "EUR"; });
					this._oDataModel.setProperty("/SalesRepSet", aSalesReps);
					if (aSalesReps.length === 1) {
						this._navToCustomer(aSalesReps[0].SalesOrganization, aSalesReps[0].SalesRep);
					}
				},
				error: () => MessageToast.show(this.getResourceBundle().getText("salesRepsLoadHeaderSetErrorMessage"))
			});
			this._oOnlineModel.submitChanges({groupId: this._sReadGroup,
				success: this._readSucceeded.bind(this), error: this._readFailed.bind(this)});
		},
		onPressSalesRep(oEvent) {
			const oSalesRep = this._oDataModel.getProperty(oEvent.getSource().getBindingContext().getPath());
			this._navToCustomer(oSalesRep.SalesOrganization, oSalesRep.SalesRep);
		},
		_navToCustomer(sSalesOrganization, sSalesRep) {
			if (sSalesRep === this._sSelectedSalesRep) { return; }
			this._oAppViewModel.setProperty("/busy", true);
			this._sSelectedSalesRep = sSalesRep;
			this.getRouter().navTo("customers", {layout: fioriLibrary.LayoutType.TwoColumnsMidExpanded,
				salesOrganization: sSalesOrganization, salesRep: sSalesRep});
		},
		_readSucceeded() { this._oAppViewModel.setProperty("/busy", false); },
		_readFailed() {
			this._oAppViewModel.setProperty("/busy", false);
			MessageToast.show(this.getResourceBundle().getText("salesRepsReadDataFailedMessage"));
		}
	});
});
