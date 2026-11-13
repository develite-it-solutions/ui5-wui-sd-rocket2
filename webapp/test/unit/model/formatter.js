sap.ui.define(["wui/sd/rocket2/model/formatter"], (formatter) => {
    "use strict";
    QUnit.module("Formatter");
    QUnit.test("Rounds amounts to two decimal places", (a) => {
        a.strictEqual(formatter.numberUnit("12.346"),"12.35");
        a.strictEqual(formatter.numberUnit("-2.1"),"-2.10");
        a.strictEqual(formatter.numberUnit("0"),"0.00");
    });
    QUnit.test("Empty amount values remain empty", (a) => {
        a.strictEqual(formatter.numberUnit(""),"");
        a.strictEqual(formatter.numberUnit(null),"");
        a.strictEqual(formatter.numberUnit(undefined),"");
    });
    QUnit.test("Removes padding from numeric identifiers", (a) => {
        a.strictEqual(formatter.removeLeadingZeroes("0000001001"),"1001");
        a.strictEqual(formatter.removeLeadingZeroes("0000"),"0");
        a.strictEqual(formatter.removeLeadingZeroes("42"),"42");
    });
});
