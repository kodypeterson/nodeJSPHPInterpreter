<?php
class basicClass{
    public $test = "Test_Value";

    public function testFun(){
        return 'This is a response from the testFun';
    }

    public function testFunTwo($variable){
        echo $variable;
    }

    public function testFun3($variable){
        echo $variable;
        echo 'Done!';
    }
}
?>