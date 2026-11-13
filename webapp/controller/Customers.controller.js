sap.ui.define([
	"wui/sd/rocket2/controller/BaseController", "wui/sd/rocket2/model/formatter",
	"sap/m/MessageToast", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"
], function (BaseController, formatter, MessageToast, Filter, FilterOperator) {
	"use strict";
	return BaseController.extend("wui.sd.rocket2.controller.Customers", {
		formatter,
		onInit() {
			this._oAppViewModel = this.getOwnerComponent().getModel("appView");
			this._oDataModel = this.getOwnerComponent().getModel();
			this._oOnlineModel = this.getOwnerComponent().getModel("rocket2Online");
			this._sReadGroup = "ReadData";
			this._oOnlineModel.setDeferredGroups([this._sReadGroup]);
			this.getRouter().getRoute("customers").attachPatternMatched(this._onRouteMatched, this);
		},
		_onRouteMatched(oEvent) {
			const oParameters = oEvent.getParameters();
			if (!oParameters || !oParameters.arguments) {
				this.getRouter().getTargets().display("notFound"); return;
			}
			this._sSalesOrganization = oParameters.arguments.salesOrganization;
			this._sSalesRep = oParameters.arguments.salesRep;
			this._selectSalesRep();
			this._oAppViewModel.setProperty("/busy", true);
			this._oOnlineModel.read("/PositionSet", {groupId: this._sReadGroup,
				filters: [new Filter("SalesOrganization", FilterOperator.EQ, this._sSalesOrganization),
					new Filter("SalesRep", FilterOperator.EQ, this._sSalesRep)],
				success: (oData) => this._oDataModel.setProperty("/CustomersSet", oData.results || []),
				error: () => MessageToast.show(this.getResourceBundle().getText("customersLoadCustomersErrorMessage", [this._sSalesRep]))});
			this._oOnlineModel.submitChanges({groupId: this._sReadGroup,
				success: this._readSucceeded.bind(this), error: this._readFailed.bind(this)});
		},
		_selectSalesRep() {
			const aSalesReps = this._oDataModel.getProperty("/SalesRepSet") || [];
			const oSelected = aSalesReps.find((oEntry) => oEntry.SalesOrganization === this._sSalesOrganization &&
				oEntry.SalesRep === this._sSalesRep);
			this._oDataModel.setProperty("/SelectedSalesRep", oSelected || null);
		},
		_readSucceeded() { this._oAppViewModel.setProperty("/busy", false); },
		_readFailed() { this._oAppViewModel.setProperty("/busy", false); }
	});
});
