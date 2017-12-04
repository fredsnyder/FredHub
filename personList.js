/*
 * Functions for displaying the list of people supported by the system
 * The list of people and their attributes is in a single JSON record in the database
 * Also display the feature for showing upcoming WFH days underneath
 */

// load the list of people
function displayPersonList() {
	debug("displayPersonList: ");
	$("#main").empty().append("Choose your name to request WFH");
	loadData("personList",writePersonListCallback);
}

function writePersonListCallback(personListJson) {
	debug("writePersonList: "+personListJson);
  
	var personList=JSON.parse(personListJson);
	jQuery.each( Object.keys(personList), function( i, val ) {
		debug("personlist: "+val);
		var d = document.createElement('div');
		$("#main").append(d);
		$(d).attr("id",val);
		var personButton = document.createElement('button');
		personButton.innerHTML=val;
		$(d).append(personButton);
		$(personButton).attr("onClick","displayPerson('"+val+"')");
		$(personButton).click(function() { 
			displayPerson($(this).html()); 
		});
	});
	
	loadData("upcoming",writeUpcomingCallback);
}

function writeUpcomingCallback(upcomingJson) {

	var d = document.createElement('div');
	$("#main").append(d);
	$(d).attr("id","upcoming");
	var upcomingTable=document.createElement('table');
	var title= document.createElement('p');
	$(title).text("Upcoming WFHs:");
	$(d).append(title,upcomingTable);

	debug("writeUpcoming: "+upcomingJson);
	var upcomingObj=JSON.parse(upcomingJson);
	upcomingObj.forEach(  function( val ) {
		debug("upcoming: "+val.date+val.person);
		var tRow= document.createElement('tr');
		$(upcomingTable).append(tRow);
		var person= document.createElement('td');
		$(person).text(val.person);
		var date= document.createElement('td');
		$(date).text(val.date);
		
		var sched = writeSchedule(JSON.parse(val.notes));
		
		$(tRow).append(date,person,sched);
	});
}


function writeSchedule(sched ) {

	var schedTable=document.createElement('table');
	sched.forEach(  function( val ) {
		debug("meeting: "+val.time+val.type);
		var tRow= document.createElement('tr');
		$(schedTable).append(tRow);
		var time= document.createElement('td');
		$(time).text(val.time);
		var type= document.createElement('td');
		$(type).text(val.type);
		var comment= document.createElement('td');
		$(comment).text(val.comment);
				
		$(tRow).append(time,type,comment);
	});
	return schedTable;
}
