import { EmbedBuilder } from "@discordjs/builders";
import type { Condition } from "../types/dnd-api";
import { ORANGE } from "../utils/colors";

function formatBullets(lines: string[]) {
	if (lines.length === 1) {
		lines[0] = lines[0].replace(/^-\s/, '');
	}
	
	return lines.map(line => (
		line.startsWith('- ') ?
			line.replace(/^-/, '•') :
			line
	));
}

export default function formatConditionEmbed(condition: Condition) {
	const embed = new EmbedBuilder()
		.setTitle(condition.name)
		.setColor(ORANGE);

	let description = '';
	if (condition.desc && typeof condition.desc === 'string') {
		description = condition.desc;
	} else if (Array.isArray(condition.desc) && condition.desc?.length) {
		description = formatBullets(condition.desc).join('\n\n');
	}

	if (description) {
		embed.setDescription(description);
	}

	return [embed];
}