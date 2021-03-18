import * as $ from 'jquery';
import 'datatables';
import { PARAMETRES } from '../constants/parametre';

export default (function () {
    var tableEnsemblePaysager = $('#dataTableEnsemblePaysagers').DataTable({
        "paging":   false,
        "ordering": true,
        "info":     false,
        searching: false,
        rowId: 0,
        language : PARAMETRES.dataTableFrancais,
        columns: [  
            {data: "ensemblePaysager_id"}, {data: "ensemblePaysager_nom"}, {data: "ensemblePaysager_desc"}, {data: "action", width: "120px"}
        ],
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            }
        ]
    });

    $('#dataTableEnsemblePaysagers tbody').on( 'click', 'a.modify', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        var data = tableEnsemblePaysager.row(ligneIndex).data();
        updateModalEnsemblePaysager(data);
        $("#modalEnsemblePaysager").modal('toggle');
    });

    $('#dataTableEnsemblePaysagers tbody').on( 'click', 'a.remove', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        if(confirm("Vous êtes sur le point de supprimer un ensemble paysager. Souhaitez vous continuer ?")){
            var ensemblePaysagerId = tableEnsemblePaysager.row(ligneIndex).data().ensemblePaysager_id;
            $.ajax({
                url: PARAMETRES.url + '/admin/remove/ensemblePaysager/' + ensemblePaysagerId,
            }).done(function( response ) {
                if(response.status == 'error'){
                    alert(response.message);
                }else{
                    tableEnsemblePaysager.row(ligneIndex).remove().draw( false );
                }
            });
        }
    });

    $("#addEnsemblePaysager").click(function(){
        updateModalEnsemblePaysager(null);
        $("#modalEnsemblePaysager").modal('toggle');
    })

    function updateModalEnsemblePaysager(data) {
        if(data){
            $('#ensemblePaysager_nom').val(data.ensemblePaysager_nom);
            $("#ensemblePaysager_desc").val(data.ensemblePaysager_desc);
            //myEditor.setData(data.ensemblePaysager_desc);
            //CKEDITOR.instances.ensemblePaysager_desc.setData(data.ensemblePaysager_desc);
            $('#ensemblePaysager_id').val(data.ensemblePaysager_id);
        }else{
            $('#ensemblePaysager_nom').val("");
            $('#ensemblePaysager_desc').val("");
            //CKEDITOR.instances.ensemblePaysager_desc.setData("");
            $('#ensemblePaysager_id').val("new");
        }
    }

    
    $("#saveEnsemblePaysager").click(function(){
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
        
        //insertionChamp['ensemblePaysager_desc'] = CKEDITOR.instances.ensemblePaysager_desc.getData();
        insertionChamp['ensemblePaysager_desc'] = $('#ensemblePaysager_desc').val();
        if($(".is-invalid").length ==  0){
            $.post({
                type: "POST",
                url: PARAMETRES.url + '/admin/update/ensemblePaysager/' + insertionChamp['ensemblePaysager_id'],
                data: insertionChamp
            }).done(function( response ) {
                if(response.status == 'ok'){
                    if (insertionChamp['ensemblePaysager_id'] == "new"){
                        tableEnsemblePaysager.row.add({
                            ensemblePaysager_id: response.ensemblePaysagerId,
                            ensemblePaysager_nom: insertionChamp['ensemblePaysager_nom'],
                            ensemblePaysager_desc: insertionChamp['ensemblePaysager_desc'],
                            action: '<a class="modify"><i class="c-light-blue-500 cur-p ti ti-pencil"></i></a><a class="remove"><i class="c-red-500 cur-p ti ti-trash"></i></a>'}
                        ).draw();
                    }else{
                        for (var i=0; i<tableEnsemblePaysager.data().length; i++) {
                            if (tableEnsemblePaysager.data()[i].ensemblePaysager_id == $("#ensemblePaysager_id").val()) {
                                tableEnsemblePaysager.data()[i].ensemblePaysager_nom = $("#ensemblePaysager_nom").val();
                                tableEnsemblePaysager.data()[i].ensemblePaysager_desc =$('#ensemblePaysager_desc').val();
                                // mise à jour du tableau
                                var ligne = tableEnsemblePaysager.row(i).data();
                                tableEnsemblePaysager.row(i).data(ligne).invalidate();
                            }
                        }
                    }
                }else{
                    alert(data.message);
                }
                $('#modalEnsemblePaysager').modal('toggle');
            }).fail(function() {
                alert( "error" );
            });
        }
    });

}())
