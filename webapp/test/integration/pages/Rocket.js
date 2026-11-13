sap.ui.define([
    "sap/ui/test/Opa5", "sap/ui/test/actions/Press", "sap/ui/test/matchers/AggregationLengthEquals"
], (Opa5, Press, AggregationLengthEquals) => {
    "use strict";
    Opa5.createPageObjects({onTheRocketPage:{
        actions:{iSelectSalesRep(salesRep) {
            return this.waitFor({viewName:"SalesReps", controlType:"sap.m.CustomListItem",
                matchers:(item) => item.getBindingContext() &&
                    item.getBindingContext().getProperty("SalesRep") === salesRep,
                actions:new Press(), errorMessage:"Sales rep " + salesRep + " was not available"});
        }},
        assertions:{
            iSeeSalesReps(count) {
                return this.waitFor({viewName:"SalesReps", id:"salesRepList",
                    matchers:new AggregationLengthEquals({name:"items", length:count}),
                    success:() => Opa5.assert.ok(true, count + " sales reps are displayed")});
            },
            iSeeCustomersForSalesRep(salesRep, count) {
                return this.waitFor({viewName:"Customers", id:"customerList", check:(list) =>
                    list.getItems().length === count && list.getItems().every((item) =>
                        item.getBindingContext().getProperty("SalesRep") === salesRep),
                    success:(list) => {
                        Opa5.assert.strictEqual(list.getModel().getProperty("/SelectedSalesRep/SalesRep"), salesRep);
                        Opa5.assert.strictEqual(list.getItems().length, count);
                    }, errorMessage:"Customer list was not loaded for " + salesRep});
            }
        }
    }});
});
