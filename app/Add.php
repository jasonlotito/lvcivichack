<?php
class Add {
    public static function execute($request){
        header("Content-Type: application/json");

        if(!isset($request['doc'])) {
            die(json_encode(['success'=> false,'error'=>'No doc provided.']));
        }

        $connection = new AMQPConnection();
        $connection->setVhost(VHOST);
        try {
            if(!$connection->connect()){
                echo json_encode(['success'=> false,'error' => "Connection failed."]);
            }
        } catch( Exception $e ) {
            echo $e->getMessage();
        }

        $channel = new AMQPChannel($connection);

        $exchange = new AMQPExchange($channel);

        $exchange->setName('new_file');
        $message = $exchange->publish($request['doc'], 'uploaded_file', null, ['content_type'=>'application/json']);

        if(!$message){
            echo json_encode(['success'=> false, 'error' => "Message not sent."]);
        } else {
            echo json_encode(['success'=> true, 'result' => "Message was sent."]);
        }
        
    }
}
