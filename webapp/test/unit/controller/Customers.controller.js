sap.ui.define([
    "wui/sd/rocket2/controller/Customers.controller", "wui/sd/rocket2/test/unit/helpers",
    "sap/m/MessageToast", "sap/ui/thirdparty/sinon"
], (Controller, H, MessageToast, sinon) => {
    "use strict";
    let f;
    QUnit.module("Customers: real service schema", {
        beforeEach() {
            f = H.fixture(Controller);
            f.model.setData({SalesRepSet:[{SalesOrganization:"1000", SalesRep:"0000001001", SalesRepName:"Anna"}]});
            sinon.stub(MessageToast, "show");
        },
        afterEach() { MessageToast.show.restore(); f.destroy(); }
    });
    function load() {
        f.c._onRouteMatched(H.route({salesOrganization:"1000", salesRep:"0000001001"}));
        return f.online.read.calls[0][1];
    }
    QUnit.test("Filters positions by organization and SalesRep", (a) => {
        const options = load();
        a.deepEqual(options.filters.map((filter) => filter.sPath), ["SalesOrganization", "SalesRep"]);
        a.deepEqual(options.filters.map((filter) => filter.oValue1), ["1000", "0000001001"]);
        a.strictEqual(f.model.getProperty("/SelectedSalesRep/SalesRepName"), "Anna");
    });
    QUnit.test("Stores PositionSet results without legacy transformations", (a) => {
        const row = {SalesRep:"0000001001", CustomerNo:"0000100001", SelectedOption:1};
        load().success({results:[row]});
        a.deepEqual(f.model.getProperty("/CustomersSet/0"), row);
    });
    QUnit.test("Missing arguments open the not-found target", (a) => {
        const display = H.spy();
        f.c.getRouter = () => ({getTargets:() => ({display})});
        f.c._onRouteMatched({getParameters:() => undefined});
        a.strictEqual(display.calls[0][0], "notFound");
        a.strictEqual(f.online.read.calls.length, 0);
    });
    QUnit.test("Read completion clears busy", (a) => {
        f.c._readSucceeded(); a.strictEqual(f.app.getProperty("/busy"), false);
        f.app.setProperty("/busy", true); f.c._readFailed();
        a.strictEqual(f.app.getProperty("/busy"), false);
    });
});
