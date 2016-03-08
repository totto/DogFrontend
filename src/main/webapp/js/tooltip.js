/* Tooltips */
define([], function () {
	var tooltip = {
		'false': 'Nei',
		'true': 'Ja',
		'breed': 'Vis hunder av valgte raser. Skriv inn (deler av) rasenavnet, og velg fra listen over raser i systemet. Klikk på en rase for å fjerne dem fra søkekriteriene.',
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