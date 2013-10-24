<?php
$helloWorld = array('1', '2', '3');

if($helloWorld[0] == "1"){
    echo "Valid";
}else{
    echo "Invalid";
}

if($helloWorld[0] === 1){
    echo "Valid";
}else{
    echo "Invalid";
}

if($helloWorld[0] == $helloWorld[1]){
    echo "Valid";
}else{
    echo "Invalid";
}

if($helloWorld[0] == ($helloWorld[1] - 1)){
    echo "Valid";
}else{
    echo "Invalid";
}

echo "\n";

$crazyArray = array(
    "Test" => array(
        1, 5, "Test", $helloWorld[0]
    ),
    "Test2" => "Test2+Value",
    array(1, 2, 3),
    "Test3" => "Test3+Value",
    "Big_Test" => array(
        1, 4,
        array(
            "Testing" => true
        )
    )
);

var_dump($crazyArray);
?>