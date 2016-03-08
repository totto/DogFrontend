/* Label translation */
define([], function () {
	dict = {
		'false': 'Nei',
		'true': 'Ja',
		'breed': 'Hunderaser',
		'gender': 'Kjønn',
		'registrationdate': 'Registrert',
		'born': 'Født',
		'source': 'Kilde',
		'showresults': 'Utstillingsresultater',
		'health': 'Helse'
	}
	return {
		get: function(word) {
			if (dict[word.toLowerCase()]) {
				word = dict[word.toLowerCase()];
			} 
			return word;
		}
	};
});