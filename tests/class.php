<?php
include("resources/basicPHPClass.php");

$testBasicClass = new basicClass;
echo $testBasicClass->test;

echo $testBasicClass->testFun();

$testBasicClass->testFunTwo("Testing");

$testBasicClass->testFun3("Testing2");