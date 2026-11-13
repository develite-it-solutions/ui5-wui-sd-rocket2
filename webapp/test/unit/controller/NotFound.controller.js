sap.ui.define(["wui/sd/rocket2/controller/NotFound.controller"], (Controller) => {
    "use strict";
    QUnit.module("NotFound: known routing defect");
    QUnit.todo("Back link should navigate to the existing salesreps route", (a) => {
        let route;
        Controller.prototype.onLinkPressed.call({
            getRouter: () => ({navTo: (name) => {route = name;}})
        });
        a.strictEqual(route, "salesreps");
    });
});
