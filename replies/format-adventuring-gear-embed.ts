import { bold, italic, EmbedBuilder } from "@discordjs/builders";
import type { Equipment, EquipmentPack, Gear, MountOrVehicle, Tool } from "../types/dnd-api";
import { GRAY } from "../utils/colors";
import { formatNumberWithCommas } from "../utils/format-numbers";
import { formatProperties } from "./format-weapon-embed";
import { createTableEmbed, extractTables } from "./tables";

function addAdventuringGearDetails(mainEmbed: EmbedBuilder, gear: Equipment) {
	const {contents} = gear as EquipmentPack;
	if (contents?.length) {
		const contentsList: string[] = [];
		for (const content of contents) {
			const {quantity, item: {name}} = content;
			contentsList.push(bold(`${quantity}x`) + ' ' + name);
		}
		mainEmbed.addFields({name: 'Contents', value: contentsList.join('\n'), inline: true});
	}

	if (gear.cost) {
		const cost = `${formatNumberWithCommas(gear.cost.quantity)} ${gear.cost.unit}`;
		mainEmbed.addFields({name: 'Cost', value: cost, inline: true});
	}

	if (gear.weight) {
		mainEmbed.addFields({name: 'Weight', value: `${gear.weight} lbs`, inline: true});
	}

	const {speed, capacity} = gear as MountOrVehicle;
	if (speed) {
		const speedBits: string[] = [];
		if (speed.quantity) speedBits.push(speed.quantity.toString());
		if (speed.unit) speedBits.push(speed.unit);
		mainEmbed.addFields({name: 'Speed', value: speedBits.join(' '), inline: true});
	}

	if (capacity) {
		mainEmbed.addFields({name: 'Capacity', value: capacity, inline: true});
	}

	const {properties} = gear as Gear;
	if (properties?.length) {
		const formattedProperties = formatProperties(properties);
		mainEmbed.addFields({name: 'Properties', value: formattedProperties, inline: true});
	}
}

function addAdventuringGearDescription(mainEmbed: EmbedBuilder, gear: Equipment, allEmbeds: EmbedBuilder[]) {
	let lines: string[] = [];
	const {desc} = gear;

	let subtitle = 'Adventuring Gear';
	if (Array.isArray(desc) && desc?.length && desc[0].includes('Potion')) {
		subtitle = desc.shift() || '';
	} else if (gear.equipment_category) {
		switch(gear.equipment_category.index) {
			case 'tools':
				const {tool_category} = gear as Tool;
				subtitle = tool_category || gear.equipment_category.name || subtitle;
				break;
			case 'adventuring-gear':
				const {gear_category} = gear as Gear;
				subtitle = gear_category?.name || gear.equipment_category.name || subtitle;
				break;
			case 'mounts-and-vehicles':
				const {vehicle_category} = gear as MountOrVehicle;
				subtitle = vehicle_category || gear.equipment_category.name || subtitle;
				break;
			default:
				subtitle = subtitle;
		}
	}

	lines.push(bold(italic(subtitle)));

	if (Array.isArray(desc) && desc.length > 0) {
		const {description, tables} = extractTables(desc);
		const tableEmbeds = tables.map(table => createTableEmbed(table, GRAY));
		
		let currentDescriptionSize = lines.join('\n\n').length;
		let currentDescriptionEmbed = mainEmbed;
		for (const line of description) {
			if (currentDescriptionSize + line.length > 3000) {
				const nextDescriptionEmbed = new EmbedBuilder().setColor(GRAY);
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
	} else if (Array.isArray(desc) && desc.length === 0) {
		mainEmbed.setDescription(lines.join('\n\n'));
	} else if (typeof desc === 'string') {
		lines.push(desc);
		mainEmbed.setDescription(lines.join('\n\n'));
	}
}

function formatAdventuringGearEmbed(gear: Equipment) {
	const mainEmbed = new EmbedBuilder()
		.setTitle(gear.name)
		.setColor(GRAY);

	const embeds = [mainEmbed];
	addAdventuringGearDetails(mainEmbed, gear);
	addAdventuringGearDescription(mainEmbed, gear, embeds);

	return embeds;
}

export default formatAdventuringGearEmbed;