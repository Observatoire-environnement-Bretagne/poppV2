
import {OSM, Vector as VectorSource, Stamen, WMTS} from 'ol/source';
import WMTSTileGrid from 'ol/tilegrid/WMTS';
import {fromLonLat, get as getProjection}  from 'ol/proj';
import {createEmpty, extend, getWidth, getHeight, getCenter, getTopLeft} from 'ol/extent';
import TileWMS from 'ol/source/TileWMS';

var projection = getProjection('EPSG:3857');
var tileSizePixels = 256;
var tileSizeMtrs = getWidth(projection.getExtent()) / tileSizePixels;
var matrixIds = [];
var resolutions = [];
for (var i = 0; i <= 14; i++) {
  matrixIds[i] = 'EPSG:3857:' +  i;
  resolutions[i] = tileSizeMtrs / Math.pow(2, i);
}
var tileGrid = new WMTSTileGrid({
  origin: getTopLeft(projection.getExtent()),
  resolutions: resolutions,
  matrixIds: matrixIds
});

export const PARAMETRES = {
    //url : "/poppv2",
    url : "",
    dataTableFrancais : {
        "sProcessing":     "Traitement en cours...",
        "sSearch":         "Rechercher&nbsp;:",
        "sLengthMenu":     "Afficher _MENU_ &eacute;l&eacute;ments",
        "sInfo":           "Résultats _START_ &agrave; _END_ sur _TOTAL_ ",
        "sInfoEmpty":      "0 &eacute;l&eacute;ment(s)",
        "sInfoFiltered":   "filtr&eacute; (total _MAX_ résultats)",
        "sInfoPostFix":    "",
        "sLoadingRecords": "Chargement en cours...",
        "sZeroRecords":    "Aucun &eacute;l&eacute;ment &agrave; afficher",
        "sEmptyTable":     "Aucune donn&eacute;e disponible dans le tableau",
        "oPaginate": {
                "sFirst":      "Premier",
                "sPrevious":   "Pr&eacute;c&eacute;dent",
                "sNext":       "Suivant",
                "sLast":       "Dernier"
            },
        "oAria": {
                "sSortAscending":  ": activer pour trier la colonne par ordre croissant",
                "sSortDescending": ": activer pour trier la colonne par ordre d&eacute;croissant"
            }
    },
    mapLongitude: 0.5,
    mapLatitude: 44.85,
    mapZoom: 7,
    autoLoadSeries: false,
    linkSelectCommune: true,
    linkSelectUnitePaysage: true,
    clusterType: "sizeByExtent",
    fileJsonPath: "/files/carto/r_entitespaysageres_s_r76_4326.geojson",
    titleJsonLayer: "Unités paysagères",
    fileJsonTextField: "n_entite",
    sourceLayerSat: new TileWMS ({
        url: 'https://wxs.ign.fr/d37yiu4ttsg1x3j0i1233143/geoportail/r/wms',
        params: {'LAYERS': 'ORTHOIMAGERY.ORTHO-SAT.SPOT.2019', 'TILED': true},
        serverType: 'geoserver',
        // Countries have transparency, so do not fade tiles:
        transition: 0,
    }),
    linkSelectStructureOpp: true,
    identifiantSerieCalculAuto: true,
    nomPhotoCalculAuto: true
};