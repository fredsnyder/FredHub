/*
 * Features for creating a WFH request
 * includes the form shown to the user with fields to complete
 * form allows user to pick a date
 * then provide information about the day schedule
 * list of meetings expands as user adds data
 */

function createWFHRecord(person) {
	debug("createWFHRecord: " + person + " " + $("#picker").val());
	var meetingsEntered = $(".meeting").length - 1;
	var meeting;

	var meetingList = [];
	for (var i = 0; i < meetingsEntered; i++) {
		meeting = {
			"time": $("#meeting" + i + " :selected").text(),
			"type": $("#meetingType" + i + " :selected").text(),
			"comment": $("#comment" + i).val()
		};
		meetingList.push(meeting);
	}
	var meetingJSON = JSON.stringify(meetingList);
	debug(meetingJSON);

	var record = {
		"person": person,
		"date": $("#picker").val(),
		"notes": meetingJSON
	};

	debug("post, then display person");
	postDataArgs(record, displayPersonCallback);
	$('#myModal').remove();
}

function addOption(selectList, optionText) {
	var option = document.createElement('option');
	$(option).text(optionText);
	$(selectList).append(option);
}

function removeChangeHandlerForUpperRow(rowNum) {
	$('meeting' + rowNum).off('change');
}

function createMeetingDetailsForThisRow() {
	var rowNum = $('.meeting').length - 1;
	var thisRow = $('#meetingRow' + rowNum);
	var typeSelect = document.createElement('select');
	$(typeSelect).attr("id", "meetingType" + rowNum).attr("name", "meetingType" + rowNum);
	addOption(typeSelect, "How will you attend?");
	addOption(typeSelect, "Attend online");
	addOption(typeSelect, "Attend phone only");
	addOption(typeSelect, "Unable to attend");

	var comment = document.createElement('textarea');
	$(comment).attr("id", "comment" + rowNum);

	$(thisRow).append(" ", typeSelect, " Comments: ", comment);
}

function createNextMeetingRow() {

	var meetingList = $('#meetingList');
	var rowNum = $('.meeting').length;
	var meetingRow = document.createElement('div');
	var label = document.createElement('label');
	$(label).text("Meeting time ")
		.attr("for", "meeting" + rowNum).attr("name", "hour");

	var hourSelect = document.createElement('select');
	$(hourSelect).addClass("meeting").attr("id", "meeting" + rowNum).attr("name", "meeting" + rowNum);
	$(meetingRow).attr("id", "meetingRow" + rowNum).append(label, hourSelect);
	$(meetingList).append(meetingRow);

	addOption(hourSelect, "Please choose a time");
	var hourString;
	for (var h = 8; h < 17; h++) {
		if (h < 13) hourString = h;
		else hourString = h - 12;
		if (h < 12) hourString += " am";
		else hourString += " pm";
		addOption(hourSelect, hourString);
	}
	$("#meeting" + rowNum) //.selectmenu() #look pretty - if I cared https://jqueryui.com/selectmenu/ 
		.change(function() {
			removeChangeHandlerForUpperRow(rowNum);
			createMeetingDetailsForThisRow();
			createNextMeetingRow();
		});
}

function assignRemoveEvent(modal) {
	// When the user clicks anywhere outside of the modal, close it
	window.onclick = function(event) {
		if (event.target == modal) {
			$(modal).remove();
		}
	};
}


function displayCreateRecord(person) {
	debug("displayCreateRecord: " + person);

	var modal = document.createElement('div');
	var modalContent = document.createElement('div');

	var modalClose = document.createElement('span');
	modalClose.innerHTML = "&times;";
	modalClose.onclick = function() {
		$(modal).remove();
	}; // When the user clicks on <span> (x), close the modal
	$(modalClose).addClass("close");

	var modalForm = document.createElement('div');
	$(modalForm).attr("id", "myModalForm");
	$(modalContent).addClass("modal-content")
		.append(modalClose)
		.append(modalForm);
	$(modal).attr("id", "myModal")
		.addClass("modal")
		.append(modalContent);
	$('body').append(modal);
	assignRemoveEvent(modal);

	var picker = document.createElement('input');
	var title = document.createElement('p');
	$(title).text("Tell me your plan:");
	var pickerHolder = document.createElement('p');
	$(pickerHolder).text("Date:");
	$(pickerHolder).append(picker);
	$(picker)
		.attr("id", "picker")
		.datepicker();

	var meetingList = document.createElement('div');
	$(meetingList).attr("id", "meetingList");

	var submitButton = document.createElement('button');
	$(submitButton).text("Submit WFH").click(function() {
		createWFHRecord(person);
	});

	$(modalForm).append(title, pickerHolder, meetingList, submitButton);
	createNextMeetingRow();

	document.getElementById("picker").focus();

}