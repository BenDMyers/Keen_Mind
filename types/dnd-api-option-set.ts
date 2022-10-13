import type { Alignment, ApiReference, Damage, DifficultyCheck } from "./dnd-api";

export type Choice = {
	desc: string;
	choose: number;
	type: string;
	from: OptionSet
};

type ReferenceOption = {
	option_type: 'reference';
	item: ApiReference;
};

type ActionOption = {
	option_type: 'action';
	action_name: string;
	count: number | string;
	type?: 'melee' | 'ranged' | 'ability' | 'magic';
}

type MultipleOption = {
	option_type: 'multiple';
	items: Option[];
}

type ChoiceOption = {
	option_type: 'choice';
	choice: Choice;
}

type StringOption = {
	option_type: 'string';
	string: string;
}

type IdealOption = {
	option_type: 'ideal';
	desc: string;
	alignments: Alignment[];
}

type CountedReferenceOption = {
	option_type: 'counted_reference';
	count: number;
	of: ApiReference;
}

type ScorePrerequisiteOption = {
	option_type: 'score_prerequisite';
	ability_score: ApiReference;
	minimum_score: number;
}

type AbilityOption = {
	option_type: 'ability';
	ability_score: ApiReference;
	bonus: number;
}

type BreathOption = {
	option_type: 'breath';
	name: string;
	dc: DifficultyCheck;
	damage: Damage;
}

type DamageOption = {
	option_type: 'damage';
	damage_type: ApiReference;
	damage_dice: string;
	notes: string;
}

export type Option = ReferenceOption | ActionOption | MultipleOption | ChoiceOption | StringOption | IdealOption | CountedReferenceOption | ScorePrerequisiteOption | AbilityOption | BreathOption | DamageOption;

type OptionsArrayOptionSet = {
	option_set_type: 'options_array';
	options: Option[];
}

type EquipmentCategoryOptionSet = {
	option_set_type: 'equipment_category';
	equipment: Option[];
}

type ResourceListOptionSet = {
	option_set_type: 'resource_list';
	resource_list_url: string;
}

export type OptionSet = OptionsArrayOptionSet | EquipmentCategoryOptionSet | ResourceListOptionSet;