import { EmbedBuilder, RGBTuple } from "@discordjs/builders";
import { bold } from "discord.js";

export function extractTables(fullDescription: string[]) {
	let inTableMode = false;
	const description: string[] = [];
	const tables: string[][] = [];

	for (const line of fullDescription) {
		if (line.startsWith('|')) {
			// If necessary, start a new table
			if (!inTableMode) {
				inTableMode = true;
				tables.push([]);
			}

			const currentTable = tables[tables.length - 1];
			currentTable.push(line);
		} else {
			inTableMode = false;
			description.push(line);
		}
	}

	return {description, tables};
}

function toCells(row: string) {
	return row
		.split('|')
		.filter(contents => !!contents)
		.map(contents => contents.trim());
}

export function createTableEmbed(table: string[], color?: number | RGBTuple) {
	const tableEmbed = new EmbedBuilder();
	
	if (color) {
		tableEmbed.setColor(color);
	}

	const [headerRow, , ...rows] = table;
	const headers = toCells(headerRow).slice(1);

	for (const row of rows) {
		const [name, ...values] = toCells(row);
		const labelledCells: string[] = [];
		for (let i = 0; i < values.length; i++) {
			labelledCells.push(`${bold(headers[i] + ':')} ${values[i]}`);
		}
		tableEmbed.addFields({name, value: labelledCells.join('\n\n'), inline: true});
	}

	return tableEmbed;
}