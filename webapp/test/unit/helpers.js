sap.ui.define(["sap/ui/model/json/JSONModel"], (JSONModel) => {
    "use strict";
    function spy(fn) {
        const f = function () {
            f.calls.push(Array.from(arguments));
            return fn && fn.apply(this, arguments);
        };
        f.calls = [];
        return f;
    }
    return {
        spy: spy,
        fixture(Controller) {
            const model = new JSONModel({});
            const app = new JSONModel({busy: true});
            const online = {read: spy(), submitChanges: spy(), update: spy(),
                createKey: spy((set, key) => set + "(" + key.CustomerNo + ")")};
            const router = {navTo: spy(), getTargets: () => ({display: spy()})};
            const c = Object.create(Controller.prototype);
            Object.assign(c, {_oDataModel: model, _oAppViewModel: app,
                _oOnlineModel: online, _sReadGroup: "ReadData",
                _sSalesOrganization: "1000", _sSalesRep: "0000001001", _sSelectedSalesRep: "",
                getRouter: () => router,
                getResourceBundle: () => ({getText: (key) => key})});
            return {c, model, app, online, router, destroy() {model.destroy(); app.destroy();}};
        },
        route(args) {
            return {getParameters: () => ({arguments: args}), getParameter: () => args};
        }
    };
});
