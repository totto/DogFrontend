/* Breeds */
define([], function(){
	var list = [];

    function getObjByName(name) {
      console.log('Getting breed object by name: ', name);
      console.log('Breeds breedlist: ', list);
      for(var i = this.list.length-1; i > 0; i--) {
        if( this.list[i].name == name || this.list[i].thesaurus.indexOf(name) >= 0 ) {
        	console.log('Found breed: ',this. list[i]);
        	return this.list[i];
        }
      }
      return false;
    }

    return {
    	list: list,
    	getObjByName: getObjByName
    }

});