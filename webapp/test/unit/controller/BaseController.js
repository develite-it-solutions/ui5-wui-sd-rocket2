sap.ui.define(["wui/sd/rocket2/controller/BaseController"], (Controller) => {
    "use strict";
    QUnit.module("BaseController");
    QUnit.test("Model helpers delegate to the view", (a) => {
        const model={};
        const c=Object.create(Controller.prototype);
        c.getView=() => ({getModel:(n) => n==="named" ? model : null,
            setModel:(m,n) => {a.strictEqual(m,model);a.strictEqual(n,"named");return "view";}});
        a.strictEqual(c.getModel("named"),model);
        a.strictEqual(c.setModel(model,"named"),"view");
    });
    QUnit.test("Resource bundle comes from the component i18n model", (a) => {
        const bundle={};
        a.strictEqual(Controller.prototype.getResourceBundle.call({
            getOwnerComponent:() => ({getModel:(name) => {
                a.strictEqual(name,"i18n");return {getResourceBundle:() => bundle};
            }})
        }),bundle);
    });
});
