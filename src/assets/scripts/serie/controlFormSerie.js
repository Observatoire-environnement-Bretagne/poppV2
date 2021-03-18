import Dropzone from 'dropzone';
import 'dropzone/dist/dropzone.css';

import * as $ from 'jquery';
import { PARAMETRES } from '../constants/parametre';

//import {tableSeriesUpdateFile} from './updateSerieFile';


export default (function () {

});/*
$( document ).ready(function(){
    
    $('#createSerie').on('click', e => {
    //$("#createSerie").click(function(){
        var insertionChamp = {};
        //on boucle sur les champs pour détecter les erreurs et remplir le tableau du POST
        var series = $(".serie");
        $(".serie").each(function(index){
            if($(this).val() == "" && this.required){
                $(this).addClass('is-invalid');
                $(window).scrollTop($(this).position().top);
                //$('body').animate({ scrollTop: $(this).position().top }, 500);
                return;
            }
            $(this).removeClass('is-invalid');
            var id = $(this).attr('id');
            var value = $(this).val();
            insertionChamp[id] = value;
        });
        //On boucle sur chaque ligne du tableau
        $("#dataTableSeriesUpdateFile tr").each(function(index){
            var ligne = $(this);
            var typeFile = $(this).attr('id');

            
            tableSeriesUpdateFile.row(ligne);

            var colonne = $(this).children();
            //On vérifie si on est sur une ligne valide
            if(colonne.is('td')){
                //si le document a été modifié
                if (colonne.first().val() == "new"){
                    //boucler sur toutes tes colonnes
                    //remplir ton tableau de POST
                }
            }
            //alert($(this).attr('id'));
        });
        //en modification
        /*if($("#serie_id").val() != "new")){
            
        }*/
        /*if($(".is-invalid").length ==  0){
            $.ajax({
                url : PARAMETRES.url + '/admin/serie/insertDb',
                type : 'POST',
                cache: true,
                data : insertionChamp
            });
        }
    });
})*/
/*
export default (function () {
        
  
    $("#createSerie").click(function(){
        //Création de la variable : nombre de champs complété
        var series = $(".serie");
        alert($(this).required);
        $(".serie").each(function(index){
            if($(this).val() == "" && $(this).required){
                $(this).addClass('is-invalid');
                $(this).focus().fadeOut( 1000 );
                return;
            }
        });
    });
    
});*/
    
    /*var longueur = $(".serie").length;

    //Création du tableau de parametre envoi
    if (!insertionChamp){
        var insertionChamp = {};
    }

    for (let i = 0 ; i < longueur; i++){
        //Si le champ est null
        if ($(".serie")[i].value === ""){
            var elt = $(".serie")[i];

            //Si le champ est optionnel
            if ($(".serie")[i].required === false){
                var id = $(".serie")[i].id;
                var value = $(".serie")[i].value;
                insertionChamp[id] = value;
            }
            //Si le champ est obligatoire
            else{
                var series = $('.serie');
                series.addClass('is-invalid');
                //document.getElementsByClassName("serie")[i].classList.add("is-invalid");
                document.getElementsByClassName("serie")[i].focus();
                return;
            }
        }
        //Si le champ a une valeur
        else{
            document.getElementsByClassName("serie")[i].classList.remove("is-invalid");
            var id = $(".serie")[i].id;
            var value = $(".serie")[i].value;
            insertionChamp[id] = value;
        }  
    }
    if (insertionChamp["photo_objet_id"] !== "new"){
        if ($("#serieCroquisId").html() === "new"){
                insertionChamp["serieCroquisName"] = $("#serieCroquisTitre").html();
                insertionChamp["serieCroquisURI"] = $("#serieCroquisURL").html();
                insertionChamp["serieCroquisFormat"] = $("#serieCroquisFormat").html();
                insertionChamp["serieCroquisStatut"] = $("#serieCroquisStatut").html();
                insertionChamp["serieCroquisSize"] = $("#serieCroquisPoids").html();
                insertionChamp["serieCroquisDate"] = $("#serieCroquisDate").html();
        }else if ($("#serieAerienneId").html() === "new"){
                insertionChamp["serieAerienneName"] = $("#serieAerienneTitre").html();
                insertionChamp["serieAerienneURI"] = $("#serieAerienneURL").html();
                insertionChamp["serieAerienneFormat"] = $("#serieAerienneFormat").html();
                insertionChamp["serieAerienneStatut"] = $("#serieAerienneStatut").html();
                insertionChamp["serieAerienneSize"] = $("#serieAeriennePoids").html();
                insertionChamp["serieAerienneDate"] = $("#serieAerienneDate").html();
        }else if ($("#serieContextId").html() === "new"){
                insertionChamp["serieContextName"] = $("#serieContextTitre").html();
                insertionChamp["serieContextURI"] = $("#serieContextURL").html();
                insertionChamp["serieContextFormat"] = $("#serieContextFormat").html();
                insertionChamp["serieContextStatut"] = $("#serieContextStatut").html();
                insertionChamp["serieContextSize"] = $("#serieContextPoids").html();
                insertionChamp["serieContextDate"] = $("#serieContextDate").html();
        }else if ($("#serieIGNId").html() === "new"){
                insertionChamp["serieIGNName"] = $("#serieIGNTitre").html();
                insertionChamp["serieIGNURI"] = $("#serieIGNURL").html();
                insertionChamp["serieIGNFormat"] = $("#serieIGNFormat").html();
                insertionChamp["serieIGNStatut"] = $("#serieIGNStatut").html();
                insertionChamp["serieIGNSize"] = $("#serieIGNPoids").html();
                insertionChamp["serieIGNDate"] = $("#serieIGNDate").html();
        }else if ($("#serieTrepiedId").html() === "new"){
                insertionChamp["serieTrepiedName"] = $("#serieTrepiedTitre").html();
                insertionChamp["serieTrepiedURI"] = $("#serieTrepiedURL").html();
                insertionChamp["serieTrepiedFormat"] = $("#serieTrepiedFormat").html();
                insertionChamp["serieTrepiedStatut"] = $("#serieTrepiedStatut").html();
                insertionChamp["serieTrepiedSize"] = $("#serieTrepiedPoids").html();
                insertionChamp["serieTrepiedDate"] = $("#serieTrepiedDate").html();
        }
    }else{
        if (photo_fiche_dropzone_croquis_form.dropzone.files.length === 1){
            var dropzoneCroquis = JSON.parse(photo_fiche_dropzone_croquis_form.dropzone.files[0].xhr.response);
            insertionChamp["serieCroquisName"] = dropzoneCroquis.fileName;
            insertionChamp["serieCroquisURI"] = dropzoneCroquis.fileURI;
            insertionChamp["serieCroquisFormat"] = dropzoneCroquis.fileFormat;
            insertionChamp["serieCroquisStatut"] = dropzoneCroquis.fileStatut;
            insertionChamp["serieCroquisSize"] = dropzoneCroquis.fileSize;
            insertionChamp["serieCroquisDate"] = photo_fiche_dropzone_croquis_form.dropzone.files[0].lastModified;
        }else if (photo_fiche_dropzone_trepied_form.dropzone.files.length === 1){
            var dropzoneTrepied = JSON.parse(photo_fiche_dropzone_trepied_form.dropzone.files[0].xhr.response);
            insertionChamp["serieTrepiedName"] = dropzoneTrepied.fileName;
            insertionChamp["serieTrepiedURI"] = dropzoneTrepied.fileURI;
            insertionChamp["serieTrepiedFormat"] = dropzoneTrepied.fileFormat;
            insertionChamp["serieTrepiedStatut"] = dropzoneTrepied.fileStatut;
            insertionChamp["serieTrepiedSize"] = dropzoneTrepied.fileSize;
            insertionChamp["serieTrepiedDate"] = photo_fiche_dropzone_trepied_form.dropzone.files[0].lastModified;
        }else if (photo_fiche_dropzone_ign_form.dropzone.files.length === 1){
            var dropzoneIGN = JSON.parse(photo_fiche_dropzone_ign_form.dropzone.files[0].xhr.response);
            insertionChamp["serieIGNName"] = dropzoneIGN.fileName;
            insertionChamp["serieIGNURI"] = dropzoneIGN.fileURI;
            insertionChamp["serieIGNFormat"] = dropzoneIGN.fileFormat;
            insertionChamp["serieIGNStatut"] = dropzoneIGN.fileStatut;
            insertionChamp["serieIGNSize"] = dropzoneIGN.fileSize;
            insertionChamp["serieIGNDate"] = photo_fiche_dropzone_ign_form.dropzone.files[0].lastModified;
        }else if (photo_fiche_dropzone_aerienne_form.dropzone.files.length === 1){
            var dropzoneAerienne = JSON.parse(photo_fiche_dropzone_aerienne_form.dropzone.files[0].xhr.response);
            insertionChamp["serieAerienneName"] = dropzoneAerienne.fileName;
            insertionChamp["serieAerienneURI"] = dropzoneAerienne.fileURI;
            insertionChamp["serieAerienneFormat"] = dropzoneAerienne.fileFormat;
            insertionChamp["serieAerienneStatut"] = dropzoneAerienne.fileStatut;
            insertionChamp["serieAerienneSize"] = dropzoneAerienne.fileSize;
            insertionChamp["serieAerienneDate"] = photo_fiche_dropzone_aerienne_form.dropzone.files[0].lastModified;
        }else if (photo_fiche_dropzone_context_form.dropzone.files.length === 1){
            var dropzoneContext = JSON.parse(photo_fiche_dropzone_context_form.dropzone.files[0].xhr.response);
            insertionChamp["serieContextName"] = dropzoneContext.fileName;
            insertionChamp["serieContextURI"] = dropzoneContext.fileURI;
            insertionChamp["serieContextFormat"] = dropzoneContext.fileFormat;
            insertionChamp["serieContextStatut"] = dropzoneContext.fileStatut;
            insertionChamp["serieContextSize"] = dropzoneContext.fileSize;
            insertionChamp["serieContextDate"] = photo_fiche_dropzone_context_form.dropzone.files[0].lastModified;
        }
    };
        
    $.ajax({
        url : '/administrateur/serie/insertDb',
        type : 'POST',
        cache: true,
        data : insertionChamp
     })
     ;
});*/