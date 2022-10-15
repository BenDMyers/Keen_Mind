import { bold, italic, EmbedBuilder } from "@discordjs/builders";
import type { MagicItem } from "../types/dnd-api";
import { GREEN } from "../utils/colors";
import { createTableEmbed, extractTables } from "./tables";

function addWondrousItemDescription(mainEmbed: EmbedBuilder, wondrousItem: MagicItem, allEmbeds: EmbedBuilder[]) {
	let lines: string[] = [];
	const {desc} = wondrousItem;
	if (Array.isArray(desc) && desc.length > 0) {
		const [subtitle, ...fullDescription] = desc;
		lines.push(bold(italic(subtitle)));
		const {description, tables} = extractTables(fullDescription);
		const tableEmbeds = tables.map(table => createTableEmbed(table, GREEN));
		
		let currentDescriptionSize = lines.join('\n\n').length;
		let currentDescriptionEmbed = mainEmbed;
		for (const line of description) {
			console.log({line, allEmbeds})
			if (currentDescriptionSize + line.length > 3000) {
				const nextDescriptionEmbed = new EmbedBuilder().setColor(GREEN);
				allEmbeds.push(nextDescriptionEmbed);
				currentDescriptionEmbed = nextDescriptionEmbed;
				currentDescriptionSize = 0;
				lines = [];
			}

			lines.push(line);
			currentDescriptionSize += lines.join('\n\n').length;
			currentDescriptionEmbed.setDescription(lines.join('\n\n'));
		}
		allEmbeds.push(...tableEmbeds);
	} else if (typeof desc === 'string') {
		mainEmbed.setDescription(desc);
	}
}

function formatWondrousItemEmbed(wondrousItem: MagicItem) {
	const mainEmbed = new EmbedBuilder()
		.setTitle(wondrousItem.name)
		.setColor(GREEN);

	const embeds = [mainEmbed];
	addWondrousItemDescription(mainEmbed, wondrousItem, embeds);

	return embeds;
}

export default formatWondrousItemEmbed;