/*
 * Primary javascript entry point
 * determine that JQuery is loaded
 * determine the starting point: either the list of people, or jump to a specific person
 */

function debug(str) { if ( false) console.log(str); }

$(function() {
	debug( 'ready!' );
	
var directToPerson= window.location.hash.substr(1);
if (directToPerson.length>0) 
	displayPerson(directToPerson);
else
	displayPersonList();

});

