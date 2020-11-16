/**
 * Calculates modifier for a given ability score
 * @param {number} abilityScore Entity's raw ability score, from 0 to 30
 * @returns {string} ability score modifer, from -5 to +10
 */
function getAbilityScoreModifier(abilityScore) {
	const modifier = Math.floor((abilityScore - 10) / 2);
	return (modifier >= 0) ?
		`+${modifier}` :
		modifier.toString();
}

module.exports = getAbilityScoreModifier;