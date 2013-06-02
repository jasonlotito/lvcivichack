var config = require('./config.js'),
    amqp = require('amqp'),
    fs = require('fs'),
    request = require('request'),
    mysql = require('mysql'),
    Promise = require('promise'),
    dbconn = mysql.createConnection(config.database),
    connection = amqp.createConnection(config.amqp);

dbconn.connect();

console.log(Promise);

// Wait for connection to become established.

connection.on('ready', function () {
    console.log("Connection established");
    connection.queue('get_new_file', {noDeclare: true}, function(q){
        // Catch all messages
        console.log('Connected to queue', q.name);
        // Receive messages
        var exchange = connection.exchange('new_file', {noDeclare: true});
        q.subscribe(function (message) {

            request(message.url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    message.body = body;

                    process_successful_request(message, exchange);
                }
            })
        });
    });
});

function process_successful_request(message, exchange) {
    save_to_mysql(message, function(){
        done_save_mysql(message, exchange);
    });
}

function done_save_mysql(message, exchange) {
    save_to_file(message, function(message){
        exchange.publish('obtained_new_file', JSON.stringify(message), {contentType: 'application/json'});
    });
}

function save_to_file(message, done) {
    message.storedFile = './data/' + message.filename;

    return save_to_fs('./data/' + message.filename, message.body, function(){
        delete message.body;
        done(message);
    });
}

function save_to_fs(name, body, done){
    console.log("Writing to " , name);
    fs.writeFile(name, body, function(err){
        if(err) throw err;
        done();
    });
}

function save_to_mysql(message, done){

    dbconn.query('INSERT INTO data_files (created_at, file_name, mimetype) VALUES (NOW(), ?, ?)', [message.filename, message.mimetype], function(err, results){
        if(err){
            console.log(err);
            return;
        }

        message.fileId = results.insertId;

        console.log("Saved " + message.fileId + " named " + message.filename + " for SID: " + message.sid);
        done(message);
    });

}