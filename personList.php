<?php

// http://www.w3schools.com/php/php_ref_mysqli.asp
// http://codular.com/php-mysqli

//$id= $_GET['id'];

require '../../secure/dbcred.php';
$con=mysqli_connect("localhost",$user,$pwd,$db);
// Check connection
if (mysqli_connect_errno())
  {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
  }


$result = mysqli_query($con,"SELECT * FROM config where id='fredhub'");

while($row = $result->fetch_assoc()){

    echo $row['json'] ;
}

mysqli_free_result($result);
mysqli_close($con);
?>