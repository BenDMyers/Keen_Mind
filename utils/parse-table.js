/**
 * Converts a Markdown table into a list of fields for a Discord Embed object.
 * This utility function assumes that the first line in `tableLines` is a header row
 * and that each table has at least two columns. It returns any lines after the table as the footer.
 * @param {[String]} tableLines array of lines making up a Markdown-formatted table
 * @returns {{fields: [{name: String, value: String, inline: Boolean}], footer: String}} array of Discord Embed fields, and any text that followed the table.
 */
function parseTable(tableLines) {
	let [headerRow, , ...rows] = tableLines;
	let footer = '';

	const tableEnd = rows.findIndex(row => (row.length && !row.startsWith('|')));
	if (tableEnd !== -1) {
		const footerLines = rows.slice(tableEnd);
		footer = footerLines.join('\n');
		footer = footer.substr(0, 2045) + '…';
		rows = rows.slice(0, tableEnd);
	}

	const headers = headerRow.split(/\W+/g).filter(header => header.length > 0).slice(1);

	if (headers.length === 1) {
		const fields = rows.map((row) => {
			const [name, value] = row.split(/\s*\|\s*/).filter(cell => cell.length > 0);
			return {name, value, inline: true};
		});
		return {fields, footer};
	} else if (headers.length > 1) {
		const fields = rows.map((row) => {
			const [name, ...values] = row.split(/\s*\|\s*/).filter(cell => cell.length > 0);
			const labelledCells = [];
			for (let i = 0; i < values.length; i++) {
				labelledCells.push(`**${headers[i]}:** ${values[i]}`);
			}
			return {name, value: labelledCells.join('\n'), inline: true};
		});
		return {fields, footer};
	}

	return {fields: [], footer: ''};
}

module.exports = parseTable;