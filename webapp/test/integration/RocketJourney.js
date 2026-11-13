sap.ui.define([
    "sap/ui/test/opaQunit",
    "wui/sd/rocket2/test/integration/pages/Rocket"
], (opaTest) => {
    "use strict";
    QUnit.module("Rocket: sales reps and customers");

    opaTest("Loads three sales reps from the service fixtures", (Given, When, Then) => {
        Given.iStartMyApp();
        Then.onTheRocketPage.iSeeSalesReps(3);
        Then.iTeardownMyApp();
        Given.iRestoreIconLoading();
    });

    opaTest("Selecting a sales rep loads its four customers and editing settings", (Given, When, Then) => {
        Given.iStartMyApp();
        When.onTheRocketPage.iSelectSalesRep("0000001001");
        Then.onTheRocketPage.iSeeCustomersForSalesRep("0000001001", 4);
        Then.onTheRocketPage.iSeeEditableVariants(4);
        Then.iTeardownMyApp();
        Given.iRestoreIconLoading();
    });

    opaTest("Switching sales reps replaces the customer list", (Given, When, Then) => {
        Given.iStartMyApp();
        When.onTheRocketPage.iSelectSalesRep("0000001001");
        Then.onTheRocketPage.iSeeCustomersForSalesRep("0000001001", 4);
        When.onTheRocketPage.iSelectSalesRep("0000001002");
        Then.onTheRocketPage.iSeeCustomersForSalesRep("0000001002", 4);
        Then.iTeardownMyApp();
        Given.iRestoreIconLoading();
    });
});
