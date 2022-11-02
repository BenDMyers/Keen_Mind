import type { Choice } from "./dnd-api-option-set";

export type ApiReference = {
	index: string;
	name: string;
	url: string;
}

export type ApiReferenceList = {
	count: number;
	results: ApiReference[]
}

export type DifficultyCheck = {
	dc_type: ApiReference;
	dc_value: number;
	success_type: 'none' | 'half' | 'other'
}

export type Damage = {
	damage_type: ApiReference;
	damage_dice: string;
}

export type Cost = {
	quantity: number;
	unit: string;
}

export type Range = {
	normal: number;
	long?: number;
}

type BaseEquipment = ApiReference & {
	desc: string[];
	equipment_category: ApiReference;
	cost: Cost;
	weight: number;
}

export type Weapon = BaseEquipment & {
	weapon_category: string;
	weapon_range: 'Melee' | 'Ranged';
	category_range: string;
	range: Range;
	throw_range?: Range;
	damage: Damage;
	two_handed_damage?: Damage;
	properties: ApiReference[];
	special?: string[];
}

export type Armor = BaseEquipment & {
	armor_category: string;
	armor_class: {
		base?: number;
		dex_bonus?: boolean;
		max_bonus?: number;
	};
	str_minimum: number;
	stealth_disadvantage: boolean;
}

export type Gear = BaseEquipment & {
	gear_category: ApiReference;
	contents?: ApiReference[];
	properties?: ApiReference[];
}

export type EquipmentPack = BaseEquipment & {
	gear_category: ApiReference;
	contents: {item: ApiReference; quantity: number;}[];
}

export type MountOrVehicle = BaseEquipment & {
	vehicle_category: string;
	speed?: {
		quantity: number;
		unit: string;
	},
	capacity?: string;
}

export type Tool = BaseEquipment & {
	tool_category: string;
}

export type Equipment = Armor | EquipmentPack | Gear | MountOrVehicle | Tool | Weapon;

type Rarity = 'Varies' | 'Common' | 'Uncommon' | 'Rare' | 'Very Rare' | 'Legendary' | 'Artifact';

export type MagicItem = ApiReference & {
	desc: string | string[];
	equipment_category: ApiReference;
	rarity: {
		name: Rarity;
	};
	variant: boolean;
	variants: ApiReference[];
}

export type MonsterSize = 'Tiny' | 'Small' | 'Medium' | 'Large' | 'Huge' | 'Gargantuan';
export type Alignment = 'chaotic neutral' | 'chaotic evil' | 'chaotic good' | 'lawful neutral' | 'lawful evil' | 'lawful good' | 'neutral' | 'neutral evil' | 'neutral good' | 'any alignment' | 'unaligned';
export type ActionType = 'melee' | 'ranged' | 'ability' | 'magic';

export type MonsterAction = {
	name: string;
	desc: string;
	action_options: Choice;
	actions: {action_name: string; count: number; type: ActionType}[];
	options: Choice;
	multiattack_type: string;
	attack_bonus: number;
	dc: DifficultyCheck;
	attacks: {name: string; dc: DifficultyCheck; damage: Damage;}[];
	damage: Damage[];
}

export type Usage = {
	type: 'at will' | 'per day' | 'recharge after rest' | 'recharge on roll';
	rest_types: string[];
	times: number;
};

type MonsterSpell = {
	name: string;
	level: number;
	url: string;
	usage: Usage;
}

export type SpecialAbility = {
	name: string;
	desc: string;
	attack_bonus: number;
	damage: Damage[];
	dc: DifficultyCheck;
	spellcasting: {
		ability: ApiReference;
		dc: number;
		modifier: number;
		components_required: string[];
		school: string;
		slots: {[key: string]: number};
		spells: MonsterSpell[];
	};
	usage: Usage;
}

export type Proficiency = {
	value: number;
	proficiency: ApiReference;
}

export type Speed = {
	walk: string;
	burrow?: string;
	climb?: string;
	fly?: string;
	swim?: string;
}

export type Monster = ApiReference & {
	desc: string[];
	charisma: number;
	constitution: number;
	dexterity: number;
	intelligence: number;
	strength: number;
	wisdom: number;
	image: string;
	size: MonsterSize;
	type: string;
	subtype: string;
	alignment: Alignment;
	armor_class: number;
	hit_points: number;
	hit_dice: string;
	hit_points_roll: string;
	actions: MonsterAction[];
	legendary_actions?: MonsterAction[];
	reactions?: MonsterAction[];
	challenge_rating: number;
	condition_immunities: ApiReference[];
	damage_immunities: string[];
	damage_resistances: string[];
	damage_vulnerabilities: string[];
	forms?: ApiReference[];
	languages: string;
	proficiencies: Proficiency[];
	special_abilities?: SpecialAbility[];
	senses: {
		passive_perception: number;
		blindsight?: string;
		darkvision?: string;
		tremorsense?: string;
		truesight?: string;
	}
	speed?: Speed;
	xp: number;
}

export type SpellComponent = 'V' | 'S' | 'M';
export type AreaOfEffect = {
	size: number;
	type: 'sphere' | 'cone' | 'cylinder' | 'line';
};

export type Spell = ApiReference & {
	desc?: string[];
	higher_level?: string[];
	range: string;
	components: SpellComponent[];
	material?: string;
	ritual: boolean;
	duration: string;
	area_of_effect?: AreaOfEffect;
	concentration: boolean;
	casting_time: string;
	level: number;
	attack_type: string;
	damage?: {
		damage_at_character_level?: {[key: string]: string};
		damage_at_slot_level?: {[key: string]: string};
		damage_type: ApiReference;
	};
	dc?: DifficultyCheck;
	school: ApiReference;
	classes: ApiReference[];
	subclasses: ApiReference[];
}

export type Condition = ApiReference & {
	desc: string[]
};