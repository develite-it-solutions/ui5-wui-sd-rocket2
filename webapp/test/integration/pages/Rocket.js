sap.ui.define([
    "sap/ui/test/Opa5",
    "sap/ui/test/actions/Press",
    "sap/ui/test/matchers/AggregationLengthEquals"
], (Opa5, Press, AggregationLengthEquals) => {
    "use strict";
    Opa5.createPageObjects({
        onTheRocketPage: {
            actions: {
                iSelectSalesRep(salesMan) {
                    return this.waitFor({
                        viewName: "SalesReps",
                        controlType: "sap.m.CustomListItem",
                        matchers: (item) => {
                            const context = item.getBindingContext();
                            return context && context.getProperty("SalesMan") === salesMan;
                        },
                        actions: new Press(),
                        errorMessage: "Sales rep " + salesMan + " was not available for selection"
                    });
                }
            },
            assertions: {
                iSeeSalesReps(count) {
                    return this.waitFor({
                        viewName: "SalesReps", controlType: "sap.m.List",
                        matchers: new AggregationLengthEquals({name: "items", length: count}),
                        success: () => Opa5.assert.ok(true, count + " sales reps are displayed"),
                        errorMessage: "Expected sales-rep count was not displayed"
                    });
                },
                iSeeCustomersForSalesRep(salesMan, count) {
                    return this.waitFor({
                        viewName: "Customers", controlType: "sap.m.List",
                        matchers: (list) => {
                            const items = list.getItems();
                            return items.length === count && items.every((item) => {
                                const context = item.getBindingContext();
                                return context && context.getProperty("SalesMan") === salesMan;
                            });
                        },
                        success: (lists) => {
                            const model = lists[0].getModel();
                            Opa5.assert.strictEqual(model.getProperty("/SelectedSalesRep/SalesMan"), salesMan);
                            Opa5.assert.strictEqual(lists[0].getItems().length, count,
                                "Customer list contains only the selected sales rep's records");
                        },
                        errorMessage: "Customer list was not loaded for " + salesMan
                    });
                },
                iSeeEditableVariants(count) {
                    return this.waitFor({
                        viewName: "Customers", controlType: "sap.m.RadioButtonGroup",
                        check: (groups) => groups.length === count &&
                            groups.every((group) => group.getEditable()),
                        success: () => Opa5.assert.ok(true, "Setting 01 enables editing for every loaded customer"),
                        errorMessage: "Expected editable variant controls were not displayed"
                    });
                }
            }
        }
    });
});
