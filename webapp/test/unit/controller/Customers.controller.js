sap.ui.define([
    "wui/sd/rocket2/controller/Customers.controller",
    "wui/sd/rocket2/test/unit/helpers",
    "sap/m/MessageToast", "sap/ui/thirdparty/sinon"
], (Controller, H, MessageToast, sinon) => {
    "use strict";
    let f;
    QUnit.module("Customers: loading and saving", {
        beforeEach() {
            f = H.fixture(Controller);
            f.model.setData({SalesRepSet: [{SalesOrganization:"1000", SalesMan:"0000001001", ProjectedTOChangeSalesMan:0}],
                Settings:{Editable:true, MaxPercentageVariant0:25}, CustomersSet:[]});
            sinon.stub(MessageToast, "show");
        },
        afterEach() {MessageToast.show.restore(); f.destroy();}
    });
    function customer(id, variant, original) {
        return {SalesOrganization:"1000", SalesMan:"0000001001", Customer:id,
            ZvpconvVariant:variant, ZvpconvVariantOri:original, ProjectedTOChangeCustomer:"12.34"};
    }
    function load(rows) {
        f.c._onRouteMatched(H.route({salesOrganization:"1000", salesMan:"0000001001"}));
        f.online.read.calls.find((v) => v[0] === "/PositionSet")[1].success({results:rows});
    }
    QUnit.test("Customer loading filters by the selected sales rep", (a) => {
        load([]);
        const filter = f.online.read.calls[0][1].filters[0];
        a.strictEqual(filter.sPath, "SalesMan");
        a.strictEqual(filter.oValue1, "0000001001");
        a.strictEqual(f.model.getProperty("/SelectedSalesRep/SalesMan"), "0000001001");
        a.strictEqual(f.online.submitChanges.calls[0][0].groupId, "ReadData");
    });
    QUnit.test("Calculates positive and negative turnover changes", (a) => {
        const row = Object.assign(customer("1",0,0), {TOTotalAY:"125",TOTotalPY:"100",
            TOPriceGroupAY:"80",TOPriceGroupPY:"100", MarketPriceLevelTotalAY:"1.05",MarketPriceLevelTotalPY:"1.00"});
        load([row]);
        a.strictEqual(row.TOTotalChange,25);
        a.strictEqual(row.TOPriceGroupChange,-20);
        a.strictEqual(row.MarketPriceLevelTotalAY,105);
        a.strictEqual(row.MarketPriceLevelTotalChange,5);
        a.strictEqual(row.IsExpanded,false);
        a.strictEqual(row.ZvpconvVariantOri,0);
    });
    QUnit.test("Zero prior-year values avoid division by zero", (a) => {
        const row = Object.assign(customer("1",1,1), {TOTotalAY:"125",TOTotalPY:"0",
            TOPriceGroupAY:"80",TOPriceGroupPY:"0", MarketPriceLevelTotalAY:"1",MarketPriceLevelTotalPY:"0"});
        load([row]);
        a.strictEqual(row.TOTotalChange,0);
        a.strictEqual(row.TOPriceGroupChange,0);
        a.strictEqual(row.MarketPriceLevelTotalChange,0);
    });
    QUnit.test("More than the allowed variant-0 share blocks updates", (a) => {
        f.model.setProperty("/CustomersSet",[customer("1",0,1),customer("2",1,1)]);
        f.c.pressSaveButton();
        a.strictEqual(f.online.update.calls.length,0);
        a.strictEqual(f.online.submitChanges.calls.length,0);
        a.strictEqual(MessageToast.show.firstCall.args[0],"customersUpdateDataTooOftenVar0SelectedMessage");
    });
    QUnit.test("Exactly the allowed percentage saves only changed customers", (a) => {
        f.model.setProperty("/CustomersSet",[
            customer("1",0,1),customer("2",1,1),customer("3",1,1),customer("4",1,1)]);
        f.c.pressSaveButton();
        a.strictEqual(f.online.update.calls.length,1);
        a.deepEqual(f.online.update.calls[0][1], {
            SalesOrganization:"1000",SalesMan:"0000001001",Customer:"1",ZvpconvVariant:0});
        a.strictEqual(f.online.update.calls[0][2].groupId,"UpdateCustomers");
        a.strictEqual(f.online.submitChanges.calls[0][0].groupId,"UpdateCustomers");
    });
    QUnit.test("Unchanged customers do not create update requests", (a) => {
        f.model.setProperty("/CustomersSet",[customer("1",1,1)]);
        f.c.pressSaveButton();
        a.strictEqual(f.online.update.calls.length,0);
    });
    QUnit.test("Successful save resets original values and recalculates totals", (a) => {
        f.model.setProperty("/CustomersSet",[customer("1",0,1),customer("2",1,0)]);
        f.model.setProperty("/SalesRepSet/1",{SalesOrganization:"1000",SalesMan:"2",ProjectedTOChangeSalesMan:"2.10"});
        f.c._updateSucceeded({__batchResponses:[{__changeResponses:[{statusCode:"204"}]}]});
        a.strictEqual(f.model.getProperty("/CustomersSet/0/ZvpconvVariantOri"),0);
        a.strictEqual(f.model.getProperty("/CustomersSet/1/ZvpconvVariantOri"),1);
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/CountZvpconvVar0"),1);
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/CountZvpconvVar1"),1);
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/ProjectedTOChangeSalesMan"),12.34);
        a.strictEqual(f.model.getProperty("/ProjectedTOChangeAllSalesMan"),14.44);
    });
    QUnit.test("Batch error preserves unsaved originals", (a) => {
        f.model.setProperty("/CustomersSet",[customer("1",0,1)]);
        f.c._updateSucceeded({__batchResponses:[{response:{
            body:JSON.stringify({error:{message:{value:"Backend rejected"}}})}}]});
        a.strictEqual(f.model.getProperty("/CustomersSet/0/ZvpconvVariantOri"),1);
        a.strictEqual(MessageToast.show.firstCall.args[0],"customersUpdateDataErrorMessage");
    });
    QUnit.test("Transport error displays a failure message", (a) => {
        f.c._updateFailed();
        a.strictEqual(MessageToast.show.firstCall.args[0],"customersUpdateDataFailedMessage");
    });
    QUnit.test("Read completion clears busy on both outcomes", (a) => {
        f.c._readSucceeded(); a.strictEqual(f.app.getProperty("/busy"),false);
        f.app.setProperty("/busy",true);
        f.c._readFailed(); a.strictEqual(f.app.getProperty("/busy"),false);
    });
    QUnit.test("Missing route arguments display the not-found target", (a) => {
        const display=H.spy();
        f.c.getRouter=() => ({getTargets:() => ({display})});
        f.c._onRouteMatched({getParameters:() => undefined});
        f.c._onRouteMatched({getParameters:() => ({})});
        a.strictEqual(display.calls.length,2);
        a.strictEqual(display.calls[0][0],"objectNotFound");
        a.strictEqual(f.online.read.calls.length,0);
    });
});
