<?php
//Simple Echo Statements
echo "Hello World<br>";
echo "Double Line!!<br>";
echo 'Single Quotes<br>';

//Simple Echo Statements w/ variables
$hello = "world";
echo $hello;
echo "<br>";
echo $hello+"<br>";
echo $hello+'<br>';

//Simple Conditional
if($hello == "world"){
    echo "Yep, it is world!<br>";
}else{
    echo "Uh-Oh!!";
}

//Simple math equations
$hello = 3+42;
echo $hello+"<br>";

//isset test
if(isset($hello)){
    echo "Yep, it is set!<br>";
}

//isset test on variable that is not existant
if(isset($helloWorld)){
    echo "Yep, it is set!<br>";
}else{
    echo "Nope, not set!<br>";
}

//Array Time!
$helloWorld = array('1', '2', '3');

//Does isset work with arrays?
if(isset($helloWorld)){
    echo "Yep, it is set!<br>";
}else{
    echo "Nope, not set!<br>";
}

//var_dump test
var_dump($helloWorld);echo "<br><br>";


//multi-dimension arrays
$multiTest = array(
    "Test_Key" => "Test_Value",
    "Test2_Key" => "Test2_Value"
);

//var_dump multi test
var_dump($multiTest);echo "<br><br>";

//let's test a crazy array
$crazyArray = array(
    "Test" => array(
        1, 5, "Test", $hello
    ),
    "Test2" => "Test2+Value",
    array(1, 2, 3),
    "Test3" => "Test3+Value",
    "Big_Test" => array(
        1, 4,
        array(
            "Testing" => true,
            $multiTest,
            $helloWorld
        )
    )
);

//var_dump crazy array
var_dump($crazyArray);echo "<br><br>";

//basic function - SHOULD WORK AS IS???
function testingFunction($str){
    return str;
}

echo testingFunction("What a loop<br>");

//Alright, just thought about the "."
echo "Hello"." World<br>";
$hello = "Hello";
$world = " World";
echo $hello.$world."<br>";
echo "2.00<br>";
echo "$2.00<br>";
echo "Sentence.";echo "<br>";
echo ".Sentence<br>";

//Shall we include a file?? OH BOY!
include("basicInclude.php");

//Let's work with classes now... Oh this should be fun
include("basicPHPClass.php");

$testBasicClass = new basicClass;
echo $testBasicClass->test;

echo $testBasicClass->testFun();
?>
