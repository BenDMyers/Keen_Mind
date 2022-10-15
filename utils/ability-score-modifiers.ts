/**
 * Calculates modifier for a given ability score
 * @param abilityScore Entity's raw ability score, from 0 to 30
 * @returns ability score modifer, from `-5` to `+10`
 */
function getAbilityScoreModifier(abilityScore: number) {
	const modifier = Math.floor((abilityScore - 10) / 2);
	return (modifier >= 0) ? `+${modifier}` : modifier.toString();
}

export default getAbilityScoreModifier;