define(function(require){
	// List the required modules here.
	var list = [
		require('filter/date'),
		require('filter/facet')
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