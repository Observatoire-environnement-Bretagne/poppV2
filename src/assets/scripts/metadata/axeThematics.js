import * as $ from 'jquery';
import 'datatables';
import { PARAMETRES } from '../constants/parametre';

export default (function () {

    /* AXE THEMATIQUE DEBUT */
    
    var tableAxeThematic = $('#dataTableAxeThematics').DataTable({
        "paging":   false,
        "ordering": true,
        "info":     false,
        searching: false,
        rowId: 0,
        language : PARAMETRES.dataTableFrancais,
        columns: [  
            {data: "axeThematic_id"}, {data: "axeThematic_nom"}, {data: "axeThematic_desc"}, {data: "action", width: "120px"}
        ],
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            }
        ]
    });

    $('#dataTableAxeThematics tbody').on( 'click', 'a.modify', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        var data = tableAxeThematic.row(ligneIndex).data();
        updateModalAxeThematic(data);
        $("#modalAxeThematic").modal('toggle');
    });

    $('#dataTableAxeThematics tbody').on( 'click', 'a.remove', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        if(confirm("Vous êtes sur le point de supprimer un axe thematique. Souhaitez vous continuer ?")){
            var axeThematicId = tableAxeThematic.row(ligneIndex).data().axeThematic_id;
            $.ajax({
                url: PARAMETRES.url + '/admin/remove/axeThematic/' + axeThematicId,
            }).done(function( response ) {
                if(response.status == 'error'){
                    alert(response.message);
                }else{
                    tableAxeThematic.row(ligneIndex).remove().draw( false );
                }
            });
        }
    });

    $("#addAxeThematic").click(function(){
        updateModalAxeThematic(null);
        $("#modalAxeThematic").modal('toggle');
    })

    function updateModalAxeThematic(data) {
        if(data){
            $('#axeThematic_nom').val(data.axeThematic_nom);
            $('#axeThematic_desc').val(data.axeThematic_desc);
            $('#axeThematic_id').val(data.axeThematic_id);
        }else{
            $('#axeThematic_nom').val("");
            $('#axeThematic_desc').val("");
            $('#axeThematic_id').val("new");
        }
    }

    
    $("#saveAxeThematic").click(function(){
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
        
        //insertionChamp['axeThematic_desc'] = CKEDITOR.instances.axeThematic_desc.getData();
        insertionChamp['axeThematic_desc'] = $('#axeThematic_desc').val();
        if($(".is-invalid").length ==  0){
            $.post({
                type: "POST",
                url: PARAMETRES.url + '/admin/update/axeThematic/' + insertionChamp['axeThematic_id'],
                data: insertionChamp
            }).done(function( response ) {
                if(response.status == 'ok'){
                    if (insertionChamp['axeThematic_id'] == "new"){
                        tableAxeThematic.row.add({
                            axeThematic_id: response.axeThematicId,
                            axeThematic_nom: insertionChamp['axeThematic_nom'],
                            axeThematic_desc: insertionChamp['axeThematic_desc'],
                            action: '<a class="modify"><i class="c-light-blue-500 cur-p ti ti-pencil"></i></a><a class="remove"><i class="c-red-500 cur-p ti ti-trash"></i></a>'}
                        ).draw();
                    }else{
                        for (var i=0; i<tableAxeThematic.data().length; i++) {
                            if (tableAxeThematic.data()[i].axeThematic_id == $("#axeThematic_id").val()) {
                                tableAxeThematic.data()[i].axeThematic_nom = $("#axeThematic_nom").val();
                                //tableaxeThematic.data()[i].axeThematic_desc = CKEDITOR.instances.axeThematic_desc.getData();
                                tableAxeThematic.data()[i].axeThematic_desc = $('#axeThematic_desc').val();
                                // mise à jour du tableau
                                var ligne = tableAxeThematic.row(i).data();
                                tableAxeThematic.row(i).data(ligne).invalidate();
                            }
                        }
                    }
                }else{
                    alert(data.message);
                }
                $('#modalAxeThematic').modal('toggle');
            }).fail(function() {
                alert( "error" );
            });
        }
    });
    /* AXE THEMATIQUE FIN */

}())
