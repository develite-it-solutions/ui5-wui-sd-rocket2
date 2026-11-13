sap.ui.define([
    "wui/sd/rocket2/controller/SalesReps.controller", "wui/sd/rocket2/test/unit/helpers",
    "sap/m/MessageToast", "sap/ui/thirdparty/sinon"
], (Controller, H, MessageToast, sinon) => {
    "use strict";
    let f;
    QUnit.module("SalesReps: service behavior", {
        beforeEach() { f = H.fixture(Controller); f.c._sSelectedSalesRep = ""; sinon.stub(MessageToast, "show"); },
        afterEach() { MessageToast.show.restore(); f.destroy(); }
    });
    function headerRead() {
        f.c._onRouteMatched(H.route({}));
        return f.online.read.calls[0][1];
    }
    QUnit.test("Reads only HeaderSet in the deferred group", (a) => {
        f.c._onRouteMatched(H.route({}));
        a.deepEqual(f.online.read.calls.map((call) => call[0]), ["/HeaderSet"]);
        a.strictEqual(f.online.submitChanges.calls[0][0].groupId, "ReadData");
    });
    QUnit.test("Stores headers using the real SalesRep schema", (a) => {
        headerRead().success({results:[{SalesOrganization:"1000", SalesRep:"1", Currency:""}]});
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/SalesRep"), "1");
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/Currency"), "EUR");
        a.strictEqual(f.router.navTo.calls[0][1].salesRep, "1");
    });
    QUnit.test("Row press navigates with SalesRep", (a) => {
        f.model.setProperty("/SalesRepSet", [{SalesOrganization:"1000", SalesRep:"2"}]);
        f.c.onPressSalesRep({getSource:() => ({getBindingContext:() => ({getPath:() => "/SalesRepSet/0"})})});
        a.strictEqual(f.router.navTo.calls[0][1].salesRep, "2");
    });
    QUnit.test("Cached headers are not read twice", (a) => {
        f.model.setProperty("/SalesRepSet", []);
        f.c._onRouteMatched(H.route({salesRep:"2"}));
        a.strictEqual(f.online.read.calls.length, 0);
    });
    QUnit.test("Read failure clears busy and reports an error", (a) => {
        f.c._readFailed();
        a.strictEqual(f.app.getProperty("/busy"), false);
        a.strictEqual(MessageToast.show.firstCall.args[0], "salesRepsReadDataFailedMessage");
    });
});
