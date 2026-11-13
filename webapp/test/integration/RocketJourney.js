sap.ui.define(["sap/ui/test/opaQunit", "wui/sd/rocket2/test/integration/pages/Rocket"], (opaTest) => {
    "use strict";
    QUnit.module("Rocket: sales reps and customers");
    opaTest("Loads sales reps from HeaderSet", (Given, When, Then) => {
        Given.iStartMyApp(); Then.onTheRocketPage.iSeeSalesReps(3);
        Then.iTeardownMyApp(); Given.iRestoreIconLoading();
    });
    opaTest("Selecting a sales rep loads its PositionSet rows", (Given, When, Then) => {
        Given.iStartMyApp(); When.onTheRocketPage.iSelectSalesRep("0000001001");
        Then.onTheRocketPage.iSeeCustomersForSalesRep("0000001001", 2);
        Then.iTeardownMyApp(); Given.iRestoreIconLoading();
    });
});
