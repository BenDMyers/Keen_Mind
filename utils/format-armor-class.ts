import { italic } from 'discord.js';
import { ArmorClass } from '../types/dnd-api';

export function formatArmorClass(armorClassReferences: ArmorClass[]) {
	return armorClassReferences
		.map(formatArmorClassComponent)
		.join(', ');
}

function formatArmorClassComponent(armorClassReference: ArmorClass) {
	const parentheticals = [] as string[];

	switch (armorClassReference.type) {
		case 'armor': {
			if (armorClassReference.armor?.length) {
				const armors = armorClassReference.armor.map(armor => armor.name);
				parentheticals.push(...armors);
			} else if (armorClassReference.desc) {
				parentheticals.push(armorClassReference.desc);
			}
			break;
		}
		case 'condition': {
			if (armorClassReference.condition?.name) {
				parentheticals.push(`when ${armorClassReference.condition.name}`);
			}
			break;
		}
		case 'natural': {
			parentheticals.push('natural armor');
			break;
		}
		case 'spell': {
			if (armorClassReference.spell?.name) {
				parentheticals.push(`with ${armorClassReference.spell.name}`);
			}
		}
		case 'dex':
		default:
			break;
	}

	if (parentheticals.length) {
		const parenthetical = `(${parentheticals.join(', ')})`;
		return `${armorClassReference.value} ${italic(parenthetical)}`;
	}

	return armorClassReference.value.toString();
}