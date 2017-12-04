/*
 * Features for displaying the informationa about a single person:
 * - person's name
 * - days requested for this person, along with the state
 * - action button for requesting a new day
 */

function displayPersonCallback(response) {
	debug("displayPersonCallback: "+response);
	displayPerson($("#title").html());
}

function displayPerson(person) {

		debug("displayPerson: "+person);

		$("#main").empty();
		var title=document.createElement('div');
		$("#main").append(title);
		$(title).text(person).attr("id","title");

		var inner=document.createElement('div');
		$(inner).attr("id","inner");
		$("#main").append(inner);
		var personTable = document.createElement('table');
		$(inner).append(personTable);
		$(personTable).attr("id","personTable");

		var innerRight=document.createElement('div');
		$(innerRight).attr("id","innerRight");
		$(inner).append(innerRight);
		var createButton=document.createElement('button');
		$(createButton).click(function() { 
			displayCreateRecord($("#title").html()); 
		});
		createButton.innerHTML="Request a WFH day";

		var retButton=document.createElement('button');
		retButton.innerHTML="Return to Person List";
		$(retButton).click(function() { 
			displayPersonList('"+person+"'); 
		});
		
		$(innerRight).append(createButton, retButton);
		
		loadData("person", writePersonCallback, "id=" + person);
}


function writePersonCallback(personJSON) {
	var person=JSON.parse(personJSON);

	jQuery.each( person, function( i, val ) {
		var row = document.createElement('tr');
		$("#personTable").append(row);
		var dateCell=document.createElement('td'); $(dateCell).text(val.date);
		var stateCell=document.createElement('td'); $(stateCell).text(val.state);
		$(row).append(dateCell,stateCell);
	});
}