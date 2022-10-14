const commonFractions: {[key: string]: string} = {
	'0.125': '1/8',
	'0.25': '1/4',
	'0.5': '1/2',
	'0.75': '3/4'
};

/**
 * @param decimal potentially decimal number
 * @returns number or a fraction
 */
export function formatFraction(decimal: number) {
	const decimalKey = decimal.toString();
	return commonFractions[decimalKey] || decimalKey;
}

/**
 * @param number number to format
 * @returns number with groups of three digits grouped by commas
 */
export function formatNumberWithCommas(number: number) {
	return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}