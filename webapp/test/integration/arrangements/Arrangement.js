sap.ui.define([
    "sap/ui/test/Opa5",
    "wui/core/IconPool",
    "sap/ui/thirdparty/sinon"
], (Opa5, IconPool, sinon) => {
    "use strict";
    return Opa5.extend("wui.sd.rocket2.test.integration.arrangements.Arrangement", {
        iStartMyApp(options) {
            // Test scope only: icon registration is not part of the business journey.
            // Prevent the unrelated selection.json request from blocking autoWait.
            if (!this._iconStub) {
                this._iconStub = sinon.stub(IconPool.prototype, "loadWuiIcons");
            }
            this.iStartMyUIComponent({
                componentConfig: {name: "wui.sd.rocket2", async: true},
                hash: (options && options.hash) || ""
            });
            return this;
        },
        iRestoreIconLoading() {
            return this.waitFor({
                success: () => {
                    if (this._iconStub) {
                        this._iconStub.restore();
                        this._iconStub = null;
                    }
                }
            });
        }
    });
});
