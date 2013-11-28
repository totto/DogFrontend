define(function(require){
	// List the required modules here.
	var list = [
		require('filter/facet'),
		require('filter/date'),
		require('filter/fieldSearch')
	];

	var modules = {
		list: list,
		date: [
			'born'
		],
		fieldSearch: [
			'showResults',
			'health'
		]
	}
	return modules;
})