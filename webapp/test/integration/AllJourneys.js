sap.ui.define([
    "wui/sd/rocket2/localservice/mockserver",
    "sap/ui/test/Opa5",
    "wui/sd/rocket2/test/integration/arrangements/Arrangement",
    "wui/sd/rocket2/test/integration/RocketJourney"
], (mockserver, Opa5, Arrangement) => {
    "use strict";
    mockserver.init();
    Opa5.extendConfig({
        arrangements: new Arrangement(),
        viewNamespace: "wui.sd.rocket2.view",
        autoWait: true,
        timeout: 20
    });
});
