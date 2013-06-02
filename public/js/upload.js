(function(){
    var $postUploadForm = $('#postUploadForm'),
        $postUploadModal = $('#postUploadModal'),
        $uploadData = $('.upload-data');

    $uploadData.on('click', function(){
        filepicker.pick(function(FPFile){
            FPFile.sid = SID;
            $.post('/add', {doc:JSON.stringify(FPFile)}, post_add, 'json');
        });
    });

    function post_add(res){
        if(!res.success){
            return;
        }

        $postUploadModal.modal('show');
    }

    $postUploadForm.on('submit', post_upload_form_submit);

    function post_upload_form_submit(e){
        e.preventDefault();
        $.post('/data/' + SID, $(this).serialize(), after_update, 'json')
    }

    function after_update(res){
        if(!res.success){
            return;
        }

        $postUploadModal.modal('hide');
    }
})();