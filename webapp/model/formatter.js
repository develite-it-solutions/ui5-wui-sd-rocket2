sap.ui.define([
], () => {
	"use strict";

	/**
	 * The formatter class which contains the formatting logic for the application
	 *
	 * @class
	 * @name wui.sd.rocket2.model.formatter
	 */
	return {

		/**
		 * Rounds the number unit value to 2 digits
		 * @public
		 * @param {string} sValue the number string to be rounded
		 * @returns {string} sValue with 2 digits rounded
		 * @memberof wui.sd.rocket2.model.formatter
		 */
		numberUnit(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		/**
		 * Removes the leading zeroes from a String (e.g. Vknum)
		 * @param {String} sString the string with leading zeroes
		 * @returns {String} sString without lading zeroes
		 */
		removeLeadingZeroes: function(sString){
			try {
				var iIntFromString = parseInt(sString, 10);
				return iIntFromString + "";
			} catch (oException){
				return sString;
			}
		}

	};

});
