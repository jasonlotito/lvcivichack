<?php
require '../config.php';

use Slim\Slim;

$app = new Slim();

$app->post('/add', function(){
    require_once "../app/Add.php";
    Add::execute($_POST);
});

$app->get('/data/:id', function($id){
   require_once '../app/Data.php';
    Data::get($id);
});

$app->post('/data/:id', function($id){
    require_once '../app/Data.php';
    Data::execute($id ,$_POST);
});

$app->post('/account', function(){

});

$app->get('/', function(){
    require_once '../templates/home.html';
});

$app->run();