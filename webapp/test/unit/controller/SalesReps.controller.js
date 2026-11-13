sap.ui.define([
    "wui/sd/rocket2/controller/SalesReps.controller",
    "wui/sd/rocket2/test/unit/helpers",
    "sap/m/MessageToast", "sap/ui/thirdparty/sinon"
], (Controller, H, MessageToast, sinon) => {
    "use strict";
    let f;
    QUnit.module("SalesReps: business behavior", {
        beforeEach() {f = H.fixture(Controller); sinon.stub(MessageToast, "show");},
        afterEach() {MessageToast.show.restore(); f.destroy();}
    });
    function read(path) {
        f.c._onRouteMatched(H.route({}));
        return f.online.read.calls.find((a) => a[0] === path)[1];
    }
    QUnit.test("Reads headers and settings in the deferred read group", (a) => {
        f.c._onRouteMatched(H.route({}));
        a.deepEqual(f.online.read.calls.map((v) => v[0]), ["/HeaderSet", "/SettingSet"]);
        a.strictEqual(f.online.submitChanges.calls[0][0].groupId, "ReadData");
    });
    QUnit.test("Settings X activates editing and preserves the percentage limit", (a) => {
        read("/SettingSet").success({results: [
            {SettingId: "01", SettingValue: "X"}, {SettingId: "02", SettingValue: "25"},
            {SettingId: "03", SettingValue: "12"}, {SettingId: "04", SettingValue: "5"}
        ]});
        a.deepEqual(f.model.getProperty("/Settings"), {Editable: true, MaxPercentageVariant0: "25"});
    });
    QUnit.test("Inactive setting disables editing", (a) => {
        read("/SettingSet").success({results: [{SettingId: "01", SettingValue: ""}]});
        a.strictEqual(f.model.getProperty("/Settings/Editable"), false);
    });
    QUnit.test("Missing settings use safe editing defaults", (a) => {
        read("/SettingSet").success({results: []});
        a.deepEqual(f.model.getProperty("/Settings"), {Editable: false, MaxPercentageVariant0: 100});
    });
    QUnit.test("Header amounts aggregate and empty currency defaults to EUR", (a) => {
        read("/HeaderSet").success({results: [
            {SalesOrganization:"1000", SalesMan:"1", Currency:"", ProjectedTOChangeSalesMan:"10.25", MarketPriceLevelTotal12M:"0.95"},
            {SalesOrganization:"1000", SalesMan:"2", Currency:"EUR", ProjectedTOChangeSalesMan:"-2.10", MarketPriceLevelTotal12M:"1.05"}
        ]});
        a.strictEqual(f.model.getProperty("/ProjectedTOChangeAllSalesMan"), 8.15);
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/Currency"), "EUR");
        a.strictEqual(f.model.getProperty("/SalesRepSet/0/MarketPriceLevelTotal12M"), 95);
        a.strictEqual(f.router.navTo.calls.length, 0, "No automatic selection for multiple sales reps");
    });
    QUnit.test("Exactly one sales rep opens its customer route", (a) => {
        read("/HeaderSet").success({results: [
            {SalesOrganization:"1000", SalesMan:"1", Currency:"EUR", ProjectedTOChangeSalesMan:"0", MarketPriceLevelTotal12M:"1"}
        ]});
        a.strictEqual(f.router.navTo.calls[0][0], "customers");
        a.strictEqual(f.router.navTo.calls[0][1].salesMan, "1");
    });
    QUnit.test("Selecting the same sales rep does not navigate twice", (a) => {
        f.c._navToCustomer("1000", "1");
        f.c._navToCustomer("1000", "1");
        a.strictEqual(f.router.navTo.calls.length, 1);
        a.strictEqual(f.app.getProperty("/busy"), true);
    });
    QUnit.test("A row press uses the row binding context", (a) => {
        f.model.setProperty("/SalesRepSet", [{SalesOrganization:"1000", SalesMan:"2"}]);
        f.c.onPressSalesMan({getSource: () => ({getBindingContext: () => ({getPath: () => "/SalesRepSet/0"})})});
        a.strictEqual(f.router.navTo.calls[0][1].salesMan, "2");
    });
    QUnit.test("Cached data avoids another header read", (a) => {
        f.model.setData({SalesRepSet: [], SettingSet: []});
        f.c._onRouteMatched(H.route({salesMan: "2"}));
        a.strictEqual(f.online.read.calls.length, 0);
    });
    QUnit.test("Failed batch clears busy and informs the user", (a) => {
        f.c._readFailed();
        a.strictEqual(f.app.getProperty("/busy"), false);
        a.strictEqual(MessageToast.show.firstCall.args[0], "salesRepsReadDataFailedMessage");
    });
    QUnit.test("Successful batch clears busy", (a) => {
        f.c._readSucceeded();
        a.strictEqual(f.app.getProperty("/busy"), false);
    });
    QUnit.test("Header and settings read errors show their respective messages", (a) => {
        read("/HeaderSet").error({});
        a.strictEqual(MessageToast.show.lastCall.args[0], "salesRepsLoadHeaderSetErrorMessage");
        f.online.read.calls = [];
        read("/SettingSet").error({});
        a.strictEqual(MessageToast.show.lastCall.args[0], "salesRepsLoadSettingSetErrorMessage");
    });
});
