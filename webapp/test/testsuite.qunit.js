window.suite = () => {
	"use strict";

	const oSuite = new parent.jsUnitTestSuite();
	const sContextPath = location.pathname.substring(0, location.pathname.lastIndexOf("/") + 1);

	// Add test pages to this test suite
	oSuite.addTestPage(sContextPath + "unit/unitTests.qunit.html");
	oSuite.addTestPage(sContextPath + "integration/opaTests.qunit.html");

	return oSuite;
};