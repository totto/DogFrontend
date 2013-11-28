/* Tooltips */
define([], function () {
	var tooltip = {
		'false': 'Nei',
		'true': 'Ja',
		'breed': 'Filtrerer etter alle personer som eier en hund av en gitt rase. Kan krysse av for flere, da finner man alle som eier minst 1 av de avkryssede rasene. Søkeboksen ovenfor avkrysningsboksene kan brukes til å finne en rase kjapt.',
		'registrationdate': 'Viser kun hunder registrert mellom disse to datoene. Kan sette kun en av disse, da gjelder det uten øvre eller nedre grense.',
		'born': 'Viser kun hunder født mellom disse to datoene. Kan sette kun en av disse, da gjelder det uten øvre eller nedre grense.',
		'source': 'Hunder er hentet fra ulike kennelklubber. Velg her å vise hunder fra en gitt klubb.'
	}
	return {
		get: function(tip) {
			if (tooltip[tip.toLowerCase()]) {
				return 'data-tooltip="'+tooltip[tip.toLowerCase()]+'"';
			} 
			return '';
		}
	};
});