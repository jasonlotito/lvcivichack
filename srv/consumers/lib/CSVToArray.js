// http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.

var util = require('util'),
    fs = require('fs');
var lastMemUsed = process.memoryUsage();

function get_field_value(arrMatches) {
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[ 2 ]) {
        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        return arrMatches[ 2 ].replace(new RegExp("\"\"", "g"),"\"");
    } else {
        return arrMatches[ 3 ];
    }
}

function CSVToArray( strData, strDelimiter, headers ){
    strDelimiter = strDelimiter || ",";

    var arrMatches,
        fieldCount = 0,
        rowData = headers.length ? {} : [],
        strMatchedValue,
        objPattern = new RegExp(
            (
                // Delimiters.
                "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +
                // Quoted fields.
                "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
                // Standard fields.
                "([^\"\\" + strDelimiter + "\\r\\n]*))"
            ),
            "gi"
        );

    while (arrMatches = objPattern.exec( strData )){
//        console.log(arrMatches);
        strMatchedValue = get_field_value(arrMatches);
//        console.log('MatchedVal: ', strMatchedValue);
        if(headers.length){
            rowData[headers[fieldCount]] = strMatchedValue;
        } else {
            rowData.push(strMatchedValue);
        }
        fieldCount += 1;
    }

    return rowData;
}

module.exports = CSVToArray;