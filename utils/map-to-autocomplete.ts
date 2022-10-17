export type AutocompleteOption = {
	name: string;
	value: string;
};

export function createAutocompleteOptions(names: string[]) {
	return names.map(name => {
		const option: AutocompleteOption = {name, value: name};
		return option;
	});
}