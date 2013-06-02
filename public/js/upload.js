(function(){
    $('.upload-data').on('click', function(){
        filepicker.pick(function(FPFile){
            FPFile.sid = SID;
            $.post('/add', {doc:JSON.stringify(FPFile)});
        });
    });
})();