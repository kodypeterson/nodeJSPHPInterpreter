<?php
$hello = "hello";
$world = "world";

if("world" == "world"){
    echo "Valid";
}else{
    echo "Invalid";
}

if("hello" == "world"){
    echo "Valid";
}else{
    echo "Invalid";
}

if($hello == "world"){
    echo "Valid";
}else{
    echo "Invalid";
}

if($world == "world"){
    echo "Valid";
}else{
    echo "Invalid";
}

if($hello.$world == "helloworld"){
    echo "Valid";
}else{
    echo "Invalid";
}

if($hello." ".$world == "hello world"){
    echo "Valid";
}else{
    echo "Invalid";
}
?>