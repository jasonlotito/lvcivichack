<?php

header("Content-Type: application/json");

require_once '../config.php';

if(!isset($_POST['doc'])) {
    die(json_encode(['error'=>'No doc provided.']));
}

$exchange = 'new_file';
$queue = 'get_new_file';

$connection = new AMQPConnection();
$connection->setVhost(VHOST);
try {
    if(!$connection->connect()){
        echo json_encode(['error' => "Connection failed."]);
    }
} catch( Exception $e ) {
    echo $e->getMessage();
}

$channel = new AMQPChannel($connection);

$exchange = new AMQPExchange($channel);

$exchange->setName('new_file');
$message = $exchange->publish($_POST['doc'], 'uploaded_file', null, ['content_type'=>'application/json']);

if(!$message){
    echo json_encode(['error' => "Message not sent."]);
} else {
    echo json_encode(['result' => "Message was sent."]);
}
