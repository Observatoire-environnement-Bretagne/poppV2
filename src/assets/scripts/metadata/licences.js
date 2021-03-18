import * as $ from 'jquery';
import 'datatables';
import { PARAMETRES } from '../constants/parametre';

export default (function () {
    var tableLicence = $('#dataTableLicences').DataTable({
        "paging":   false,
        "ordering": true,
        "info":     false,
        searching: false,
        rowId: 0,
        language : PARAMETRES.dataTableFrancais,
        columns: [  
            {data: "licence_id"}, {data: "licence_nom"}, {data: "licence_desc"}, {data: "action", width: "120px"}
        ],
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            }
        ]
    });

    $('#dataTableLicences tbody').on( 'click', 'a.modify', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        var data = tableLicence.row(ligneIndex).data();
        updateModalLicence(data);
        $("#modalLicence").modal('toggle');
    });

    $('#dataTableLicences tbody').on( 'click', 'a.remove', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        if(confirm("Vous êtes sur le point de supprimer une licence. Souhaitez vous continuer ?")){
            var licenceId = tableLicence.row(ligneIndex).data().licence_id;
            $.ajax({
                url: PARAMETRES.url + '/admin/remove/licence/' + licenceId,
            }).done(function( response ) {
                if(response.status == 'error'){
                    alert(response.message);
                }else{
                    tableLicence.row(ligneIndex).remove().draw( false );
                }
            });
        }
    });

    $("#addLicence").click(function(){
        updateModalLicence(null);
        $("#modalLicence").modal('toggle');
    })

    function updateModalLicence(data) {
        if(data){
            $('#licence_nom').val(data.licence_nom);
            myEditor.setData(data.licence_desc);
            //CKEDITOR.instances.licence_desc.setData(data.licence_desc);
            $('#licence_id').val(data.licence_id);
        }else{
            $('#licence_nom').val("");
            myEditor.setData("");
            //CKEDITOR.instances.licence_desc.setData("");
            $('#licence_id').val("new");
        }
    }

    
    $("#saveLicence").click(function(){
        var insertionChamp = {};
        //on boucle sur les champs pour détecter les erreurs et remplir le tableau du POST
        $(".form-control").each(function(index){
            if(($(this).val() == "" || $(this).val() == null) && this.required){
                $(this).addClass('is-invalid');
                $(window).scrollTop($(this).position().top);
                return;
            }
            $(this).removeClass('is-invalid');
            var id = $(this).attr('id');
            var value = $(this).val();
            insertionChamp[id] = value;
        });
        
        //insertionChamp['licence_desc'] = CKEDITOR.instances.licence_desc.getData();
        insertionChamp['licence_desc'] = myEditor.getData();
        if($(".is-invalid").length ==  0){
            $.post({
                type: "POST",
                url: PARAMETRES.url + '/admin/update/licence/' + insertionChamp['licence_id'],
                data: insertionChamp
            }).done(function( response ) {
                if(response.status == 'ok'){
                    if (insertionChamp['licence_id'] == "new"){
                        tableLicence.row.add({
                            licence_id: response.licenceId,
                            licence_nom: insertionChamp['licence_nom'],
                            licence_desc: insertionChamp['licence_desc'],
                            action: '<a class="modify"><i class="c-light-blue-500 cur-p ti ti-pencil"></i></a><a class="remove"><i class="c-red-500 cur-p ti ti-trash"></i></a>'}
                        ).draw();
                    }else{
                        for (var i=0; i<tableLicence.data().length; i++) {
                            if (tableLicence.data()[i].licence_id == $("#licence_id").val()) {
                                tableLicence.data()[i].licence_nom = $("#licence_nom").val();
                                //tableLicence.data()[i].licence_desc = CKEDITOR.instances.licence_desc.getData();
                                tableLicence.data()[i].licence_desc = myEditor.getData();
                                // mise à jour du tableau
                                var ligne = tableLicence.row(i).data();
                                tableLicence.row(i).data(ligne).invalidate();
                            }
                        }
                    }
                }else{
                    alert(data.message);
                }
                $('#modalLicence').modal('toggle');
            }).fail(function() {
                alert( "error" );
            });
        }
    });

}())
