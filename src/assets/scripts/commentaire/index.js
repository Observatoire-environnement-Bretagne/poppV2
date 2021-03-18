import * as $ from 'jquery';
import 'datatables';
import { PARAMETRES } from '../constants/parametre';

export default (function () {

    var tableCommentaires = $("#dataTableCommentaires").DataTable( {
        paging:false,
        searching: true,
        language : PARAMETRES.dataTableFrancais,
        columns: [  
            {data: "commentaire_id"}, {data: "commentaire_auteur"}, {data: "commentaire_text"}, {data: "commentaire_photo"}, {data: "commentaire_serie"}, 
            {data: "commentaire_date"}, {data: "action", width: "120px"}
        ],
        columnDefs: [   
            { 
                targets: [ 0 ], 
                visible: false, 
                searchable: false
            }
        ],
    } );

    $('#dataTableCommentaires tbody').on( 'click', 'a.modify', e => {
        var elem = e.currentTarget;
        $(elem)
        .children()
        .toggleClass('ti-na ti-check-box')
        .toggleClass('c-red-500 c-light-green-500');

        var data = tableCommentaires.row( $(elem).parent().parent().parent() ).data();
        $.post({
            url: PARAMETRES.url + '/gestion/commentaire/publication/' + data.commentaire_id
        });
        var etat = $(elem).parent().parent().parent().attr('data-etat');
        if (etat == '0'){
            $(elem).parent().parent().parent().attr('data-etat', '1')
        }else{
            $(elem).parent().parent().parent().attr('data-etat', '0')
        }
    });
    
    $("#commentairePublie").change(function(){
        var checkbox = $(this);
        
		if(checkbox.is(':checked')){
            $('#dataTableCommentaires tbody tr').each(function(index){
                if($(this).attr('data-etat') == 0){
                    $(this).fadeIn();
                }else{
                    $(this).fadeOut();
                }
            });
		} else {
			$("#dataTableCommentaires tbody tr").fadeIn();
		}
    })
    

    $('#dataTableCommentaires tbody').on( 'click', 'a.remove', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent().parent();
        if(confirm("Vous êtes sur le point de supprimer un commentaire. Souhaitez vous continuer ?")){
            var commentaireId = tableCommentaires.row(ligneIndex).data().commentaire_id;
            $.ajax({
                url: PARAMETRES.url + '/gestion/remove/commentaire/' + commentaireId,
            }).done(function( response ) {
                if(response.status == 'error'){
                    alert(response.message);
                }else{
                    tableCommentaires.row(ligneIndex).remove().draw( false );
                }
            });
        }
    });
}())