var config = require('./config.js'),
    amqp = require('amqp'),
    request = require('request'),
    mysql = require('mysql'),
    nano = require('nano')(config.couchdb),
    chainsw = nano.use('chainsw'),
    dbconn = mysql.createConnection(config.database),
    connection = amqp.createConnection(config.amqp);

console.log("Starting process_new_file.js");
dbconn.connect();

// clean up the database we created previously
if(1<0){
    nano.db.destroy('alice', function() {
        // create a new database
        nano.db.create('alice', function() {
            // specify the database we are going to use
            var alice = nano.use('alice');
            // and insert a document in it
            alice.insert({ crazy: true }, 'rabbit', function(err, body, header) {
                if (err) {
                    console.log('[alice.insert] ', err.message);
                    return;
                }
                console.log('you have inserted the rabbit.')
                console.log(body);
            });
        });
    });
}


// Wait for connection to become established.
connection.on('ready', connection_ready);

function connection_ready(){
    console.log("Connection established");
    connection.queue('process_new_file', {noDeclare: true}, process_queue);
}

function process_queue(q){
    // Catch all messages
    console.log('Connected to queue', q.name);
    // Receive messages
    var exchange = connection.exchange('new_file', {noDeclare: true});
    q.subscribe(file_processor);
}


function file_processor(message){
    console.log(message.filename);
    message.body.split("\n").map(line_processor)
}

function line_processor(line){
    console.log("Line: " + line);
    line.trim().split(',').map(function(field){
       console.log("Field: <" + field.trim() + ">");
    });
}

