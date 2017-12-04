<?php

/* 
 * everything we need for writing to the database and consequential actions
 * for every change, there is at least one email sent out
 * each email includes the hashcode record ID
 * email to managers include a manager hash code need for approvals
 * All hashcode IDs are md5 of primary keys as well as the system password
 * while MD5s can be spoofed as a checksum, that would not help as we are using the hashcode as the primary ID; spoofing would just give you an invalid record
 */


	require '../../secure/fredhubconfig.php'; //get fredhubPD
	require '../../secure/dbcred.php';	//get user,pwd,db
	$dbcon=mysqli_connect("localhost",$user,$pwd,$db);
	if (mysqli_connect_errno())	{ echo "Failed to connect to MySQL: " . mysqli_connect_error();	}

function getMailHeaders() {
	$headers = "MIME-Version: 1.0" . "\r\n";
	$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
	$headers .= "From: FredHub <fred@fredsnyder.com>" . "\r\n";
	return $headers;
}

function getEmail($person,$relation){
	// All emails are stored in the JSON configuration record
	global $dbcon;
	$query="select * from config where id='fredhub' ";
	$result = mysqli_query($dbcon,$query);
	$email=null;

	if ($result==null) die ("SQL returned null");
	if ($row = $result->fetch_assoc()){

		$configJson=$row['json'];
		$config=json_decode($configJson,true);
		
   	 	if ($relation == "me") {
   	 		$email= $config[$person]["email"];		

		} else
   	 	if ($relation == "manager") {
   	 		$managerId= $config[$person]["manager"];		
   	 		$email= $config[$managerId]["email"];		
		}
		
   	 	else die("no relations");

	} else 	die ("SQL did not return correctly");

	return $email;
}

function postQuery($query) {
	global $dbcon;
	$result="";
	$result = mysqli_query($dbcon,$query);
	
	if ($result>0)
		return true;
	
	return false;
}

/* I had trouble with POST. Maybe I'll come back to it later
if ($_POST["content"]) 	$contentJson= $_POST["content"]; } */

function getHash($date,$person,$state) { global $fredhubPD; return md5($date.$person.$state.$fredhubPD); }

function noteTable($notes) {
	$notesArray= json_decode($notes, true);
	$noteTable="";
	foreach($notesArray as $note) { 
		$noteRow="<tr><td>".$note['time']."</td><td>".$note['type']."</td><td>".$note['comment']."</td></tr>";
		$noteTable.=$noteRow;
	}
	return "<table>".$noteTable."</table>";
}

function createNewWFH($date,$person,$notes) {
	$state="pending";

	//change the date format
	$dateSplit=explode("/", $date);
	$date = $dateSplit[2]."-".$dateSplit[0]."-".$dateSplit[1];

	//load the data into a SQL insert format
	$id = getHash($date,$person,$state);
	$keys="id,"; $values="'".$id."',";
	$keys=$keys."person,";	$values=$values."'$person',";
	$keys=$keys."date,";	$values=$values."'$date',";
	$keys=$keys."state,";	$values=$values."'$state',";
	$keys=$keys."notes";	$values=$values."'$notes'";
	$query = "insert into fredhub ($keys) values ($values) ";
		
	if (postQuery($query)) { 
	
		$mailDest=getEmail($person,"me");
		$message = '<div style="float:right"><span style="font-family:arial;font-size:36px;color:slategrey">Fred<span style="color: orangered;letter-spacing: -6px">HUB</span></span></div>';
		$message .= "<p>You have requested a change to a WFH day on " . $date . "</p>";
		$message .=noteTable($notes);
		$message .="<p> Please confirm that this was you by clicking this link</p>
				<p><a href='http://www.fredsnyder.com/fredhub/post.php?id=$id&state=confirmed '>Confirm in FredHub</a></p>
				<p style:'text-color:red'><a href='http://www.fredsnyder.com/fredhub/post.php?id=$id&state=cancel'>Cancel</a></p>";
		$emailStatus=mail($mailDest,"WFH request: please confifrm",$message,getMailHeaders());
	}
}

function getRecord($id) {
	global $dbcon;
	$query = "SELECT state,person,date from fredhub where id='".$id."'";
	$result = $dbcon->query($query);
	if($row = $result->fetch_assoc()){
		return $row;	
	}
}

function updateToConfirm($id, $person,$date) {
	$newId=getHash($date,$person,"confirmed");
	$updateQuery= "UPDATE fredhub SET state='confirmed', id='" . $newId."' where id='".$id."'";

	if (postQuery($updateQuery) ) {
		$mailDest=getEmail($person,"manager");
		$managerHash=getHash($date,$person,$mailDest);
		$message = '<div style="float:right"><span style="font-family:arial;font-size:36px;color:slategrey">Fred<span style="color: orangered;letter-spacing: -6px">HUB</span></span></div>';
		$message .= "<p>A WFH day has been requested by  ".$person." on " . $date . "</p>";
		$message.=noteTable($notes);
		$message.= "<p>Please approve by clicking this link</p>
				<p><a href='http://www.fredsnyder.com/fredhub/post.php?id=$newId&managerHash=$managerHash&state=approved' >Approve in FredHub</a></p>
				<p style:'text-color:red'><a href='http://www.fredsnyder.com/fredhub/post.php?id=$newId&managerHash=$managerHash&state=cancel' >Cancel</a></p>";
		$emailStatus=mail($mailDest,"WFH request: please approve: ".$person,$message,getMailHeaders());
	}
}

function cancelRecord($id, $person,$date) {
	$updateQuery= "DELETE from fredhub where id='".$id."'";

	if (postQuery($updateQuery) ) {
		$mailDest=getEmail($person,"manager");
		$message = "<p>A WFH day has been cancelled for ".$person." on ".$date.". </p>";
		$emailStatus=mail($mailDest,"WFH request cancelled: ".$person,$message,$headers);
		$mailDest=getEmail($person,"me");
		$emailStatus=mail($mailDest,"WFH request cancelled",$message,getMailHeaders());
	}
}
function updateToApproved($id, $person,$date) {
	$newId=getHash($date,$person,"approved");
	$updateQuery= "UPDATE fredhub SET state='approved', id='" . $newId."' where id='".$id."'";

	if (postQuery($updateQuery) ) {
		$mailDest=getEmail($person,"manager");
		$managerHash=getHash($date,$person,$mailDest);
		$message = '<div style="float:right"><span style="font-family:arial;font-size:36px;color:slategrey">Fred<span style="color: orangered;letter-spacing: -6px">HUB</span></span></div>';
		$message .= "<p>A WFH day on  ".$date." for ".$person." has been approved.</p>
				<p style:'text-color:red' ><a href='http://www.fredsnyder.com/fredhub/post.php?id=$newId&state=cancel' >Cancel</a></p>";
		$emailStatus=mail($mailDest,"WFH request approved: ".$person,$message,getMailHeaders());
		$mailDest=getEmail($person,"me");
		$emailStatus=mail($mailDest,"WFH request approved",$message,getMailHeaders());

	}
}

function managerConfirmed($id, $date, $person) {
	$approveHash= getHash($date,$person, getEmail($person,"manager"));
	if ($approveHash == $_GET["managerHash"]) 
		return true;
	return false;
}


// if has ID, it's an update

if (isset($_GET["id"])) {
	$id=$_GET["id"];	
	$state=$_GET["state"];	

	$currentRecord=getRecord($id);
	$person=$currentRecord["person"];
	$date=$currentRecord["date"];
	
	$updateQuery="";
	if ($state=="cancel") {
		cancelRecord($id,$person,$date);
	}

	if ($currentRecord["state"]=="pending") { 
		if ($state=="confirmed") {
			updateToConfirm($id,$person,$date);
		}
	}
	if ($currentRecord["state"]=="confirmed") { 
		if ($state=="approved" && managerConfirmed($id,$date,$person)) { 
			updateToApproved($id,$person,$date);
		}
	}

} else {
	createNewWFH($_GET["date"],$_GET["person"],$_GET["notes"]);
}

mysqli_close($dbcon);

if (!isset($_GET["test"])) //redirect to home page unless this is a test of the service. Add &test to URL for testing
	header("Location: http://www.fredsnyder.com/fredhub/#".$person);

?>

done