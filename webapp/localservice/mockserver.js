sap.ui.define([
	"sap/ui/core/util/MockServer",
	"sap/base/Log",
	"sap/base/util/UriParameters",
], (MockServer, Log, UriParameters) => {
	"use strict";

	Log.setLevel(Log.Level.ALL);

	let oMockServer;
	const _sAppModulePath = "wui/sd/rocket2/",
		_sJsonFilesModulePath = _sAppModulePath + "localservice/mockdata",
		_oLogger = Log.getLogger("wui.sd.rocket2.mockserver");

	return {

		init() {
      const oUriParameters = new UriParameters(window.location.href);
			const sJsonFilesUrl = sap.ui.require.toUrl(_sJsonFilesModulePath);
			const sMetadataUrl = sap.ui.require.toUrl(_sAppModulePath + "localservice/metadata.xml");
			const sMockServerUrl = "/sap/opu/odata/W4E/rkt2_srv/";

			oMockServer = new MockServer({
				rootUri: sMockServerUrl
			});

			// configure mock server with a delay of 1s
			MockServer.config({
				autoRespond: true,
				autoRespondAfter: +oUriParameters.get("serverDelay") || 200
			});

			oMockServer.simulate(sMetadataUrl, {
				sMockdataBaseUrl: sJsonFilesUrl,
				bGenerateMissingMockData: true
			});

			const aRequests = oMockServer.getRequests(),
				fnResponse = (iErrCode, sMessage, aRequest) => {
					aRequest.response = (oXhr) => {
						oXhr.respond(iErrCode, {
							"Content-Type": "text/plain;charset=utf-8"
						}, sMessage);
					};
				};

			// handling the metadata error test
			if (oUriParameters.get("metadataError")) {
				aRequests.forEach((aEntry) => {
					if (aEntry.path.toString().indexOf("$metadata") > -1) {
						fnResponse(500, "metadata Error", aEntry);
					}
				});
			}

			oMockServer.attachAfter("GET", (oEvent) => {
				const aEntities = oEvent.getParameter("oFilteredData")["results"];
				_oLogger.info(`Returning ${aEntities.length} entries`, "GET_PositionSet");
			}, "PositionSet");

			oMockServer.start();

			_oLogger.info("Running the app with mock data", "init");
		},

		/**
		 * returns the mockserver of the app, should be used in integration tests
		 * @public
		 * @returns {sap.ui.core.util.MockServer} the mockserver instance
		 */
		getMockServer() {
			return oMockServer;
		}
	};
});
