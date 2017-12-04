<?php

// return the list of upcoming WFH dates for display on the person list
// dates listed are from now up to a month from now
// also housekeeping: let's delete any person's days older than a year 

require '../../secure/dbcred.php';
$con=mysqli_connect("localhost",$user,$pwd,$db);
// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

//make a JSON list of objects where each is a matching row from the database
$query="SELECT person,state,date,notes FROM fredhub where state='approved' and date >= curdate() and date <=  DATE_ADD( curdate(), INTERVAL 1 month) order by date";
$result = mysqli_query($con,$query);
$count=0;
//if (isset($result))  //only need if we're testing the service
echo "[";
while($row = $result->fetch_assoc()){

    echo json_encode($row) ;
    $count++;
    if ($count<$result->num_rows) { echo ","; }
}
echo "]";

mysqli_free_result($result);

//clean up any old data
$query="DELETE from fredhub where date <= DATE_ADD( curdate(), INTERVAL -1 year)";
$result = mysqli_query($con,$query);
mysqli_free_result($result);

mysqli_close($con);
?>