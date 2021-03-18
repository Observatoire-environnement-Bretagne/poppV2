import * as $ from 'jquery';
import 'datatables';
import { PARAMETRES } from '../constants/parametre';

export default (function () {
//    $('#dataTable').DataTable();

    var tableSeries = $('#dataTableSeries').DataTable({
        "paging":   true,
        "ordering": true,
        "info":     false,
        searching: true,
        language : PARAMETRES.dataTableFrancais,
        rowId: 0,
        "columnDefs": [
            {
                "targets": [ 0 ],
                "visible": false,
                "searchable": false
            }
        ],
        "drawCallback": function ( settings ) {
            $('#dataTableSeries tbody td:not(:last-child)').click(function (idx, ev) {
                //if (idx.currentTarget.cellIndex != 0) {
                    // redirect
                    var serieId = tableSeries.row( $(this).parent() ).data()[0];
                    var url = PARAMETRES.url + "/public/get/serie/" + serieId;

                    if (idx.ctrlKey){
                        window.open(url,'_blank')
                    }else{
                        document.location.href = url;
                    }
                //}
            });
            
        },
    });

    
    $('#dataTableSeries tbody').on( 'click', 'a.modify', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        var serieId = tableSeries.row(ligneIndex).data()[0];
        window.location.replace(PARAMETRES.url + "/gestion/update/serie/"+ serieId);
    });

    $('#dataTableSeries tbody').on( 'click', 'a.remove', e => {
        var elem = e.currentTarget;
        var ligneIndex = $(elem).parent().parent();
        if(confirm("Vous êtes sur le point de supprimer une série. Souhaitez vous continuer ?")){
            var serieId = tableSeries.row(ligneIndex).data()[0];
            $.ajax({
                url: PARAMETRES.url + '/gestion/remove/serie/' + serieId,
            })
            tableSeries.row(ligneIndex).remove().draw( false );
        }
    });

}())
