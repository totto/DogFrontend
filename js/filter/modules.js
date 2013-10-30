define(function(require){
	// List the required modules here.
	var list = [
		require('filter/facet'),
		require('filter/date')
	];

	var modules = {
		list: list,
		date: [
			'born',
			'registrationDate'
		]
	}
	return modules;
})