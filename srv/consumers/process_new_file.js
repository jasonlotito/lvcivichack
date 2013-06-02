var CSVToArray = require('./lib/CSVToArray.js'),
    config = require('./config.js'),
    util = require('util'),
    amqp = require('amqp'),
    fs = require('fs'),
    byline = require('byline'),
    request = require('request'),
    mysql = require('mysql'),
    nano = require('nano')(config.couchdb),
    chainsw = nano.use('chainsw'),
    dbconn = mysql.createConnection(config.database),
    connection = amqp.createConnection(config.amqp);

console.log("Starting process_new_file.js");
dbconn.connect();

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
//    console.log(message);
    var filedb;
    console.log("Processing new message");
    var headers = [];

    nano.db.create('filedata' ,function(){
        filedb = nano.use(message.filename);

        var stream = byline(fs.createReadStream(message.storedFile));

        var stored_data = {data:[]};

        stream.on('data', function(line){
            stored_data.data.push(process_line(line, headers, filedb.insert));
        });

        stream.on('end', function(){
            chainsw.insert(stored_data, message.fileId + '_data');
        })

        chainsw.insert({id:message.fileId}, message.fileId, function(err, body, header){
            if(err){
                console.log('CouchDB Error: ', err);
            }
//            after_couch_insert(err, body, header, message);
        });
    });
}

function process_line(line, headers, insert){
    var rec = CSVToArray(line, ",", headers);
    rec = line.split(',');
//    console.log(rec);
    return rec;

    if(headers.length<1){
        headers = rec;
    } else {
        try {
//            insert(rec);
        } catch (e){
            console.log('CouchDB Error: ', e);
        }
    }

    return rec;
}

function after_couch_insert(err, body, header, originalMessage){
    if(err){
//        console.log('[chainsw.insert] ', err.message);
        return;
    }
//    console.log('insert successful', body, header);

    dbconn.query('UPDATE data_files SET internal_endpoint = ? WHERE id = ?', [
        header.location,
        originalMessage.fileId
    ], function(err, results){
        console.log(err, results);
    });
}