<?php
require '../config.php';

use Slim\Slim;

$app = new Slim();

$app->post('/add', function(){
    require_once "add.php";
});

$app->post('/account', function(){

});

$app->get('/', function(){
    require_once '../templates/home.html';
});

$app->run();