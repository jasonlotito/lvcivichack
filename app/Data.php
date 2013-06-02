<?php
/**
 * Data.php
 * 
 * @author Jason Lotito <jasonlotito@gmail.com>
 */

class Data {
    public static function execute($id, $request){
        echo json_encode(['id' => $id, 'success'=>true, 'post'=>$request]);
    }

    public static function get($id)
    {
        header('Content-Type: application/json');
        $json = json_decode(file_get_contents("http://localhost:5984/chainsw/$id?keys=data"));
        echo json_encode($json->data);
    }
}