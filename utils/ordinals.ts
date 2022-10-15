/**
 * Convert a number to its ordinal format
 * @param number the number to be ordinalized
 * @returns the ordinal-formatted version of `number`
 */
function ordinal(number: number) {
	if (number >= 11 && number <= 19) {
		return `${number}th`;
	}

	const lastDigit = number % 10;

	switch(lastDigit) {
		case 1:
			return `${number}st`;
		case 2:
			return `${number}nd`;
		case 3:
			return `${number}rd`;
		default:
			return `${number}th`;
	}
}

export default ordinal;