sap.ui.define(["wui/sd/rocket2/controller/App.controller"], (Controller) => {
    "use strict";
    QUnit.module("App");
    QUnit.test("Initializes view state and applies content density", (a) => {
        let model, name, style;
        Controller.prototype.onInit.call({
            getView:() => ({setModel:(m,n) => {model=m;name=n;},addStyleClass:(s) => {style=s;}}),
            getOwnerComponent:() => ({getContentDensityClass:() => "sapUiSizeCompact"})
        });
        a.strictEqual(name,"appView");
        a.deepEqual(model.getData(),{busy:false,delay:0});
        a.strictEqual(style,"sapUiSizeCompact");
        model.destroy();
    });
});
