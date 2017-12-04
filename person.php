<?php

/* 
 * return a JSON array of WFH dates requested for a specified person
 */

$id= $_GET['id'];

require '../../secure/dbcred.php';
$con=mysqli_connect("localhost",$user,$pwd,$db);
// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }

$query="SELECT * FROM fredhub where person='".$id."' order by date desc";
$result = mysqli_query($con,$query);
$count=0;
echo "[";
while($row = $result->fetch_assoc()){

    echo json_encode($row) ;
    $count++;
    if ($count<$result->num_rows) { echo ","; }
}
echo "]";

mysqli_free_result($result);
mysqli_close($con);
?>