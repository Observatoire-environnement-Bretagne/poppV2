import * as $ from 'jquery';
import Masonry from 'masonry-layout';


import {Tile as TileLayer, Vector as VectorLayer, Group as LayerGroup} from 'ol/layer';
import {OSM, Vector as VectorSource, Stamen, WMTS} from 'ol/source';
import View from 'ol/View';
import Overlay from 'ol/Overlay';
import 'ol/ol.css';
import Map from 'ol/Map';
import {fromLonLat, get as getProjection}  from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import {Circle as CircleStyle, Fill, Stroke, Style, Text, RegularShape} from 'ol/style';
import {defaults as defaultInteractions} from 'ol/interaction.js';
import {singleclick} from 'ol/events/condition';
import {toStringHDMS} from 'ol/coordinate';
import {toLonLat} from 'ol/proj';
import {Zoom} from 'ol/control';
import LayerSwitcher from 'ol-layerswitcher';
import csv2geojson from 'csv2geojson';
//import {Services, olExtended as Ol} from 'geoportal-extensions-openlayers';

import { PARAMETRES } from '../constants/parametre';

import {createEmpty, extend, getWidth, getHeight, getCenter, getTopLeft} from 'ol/extent';
import Cluster from 'ol/source/Cluster.js';
import Select from 'ol/interaction/Select';
import Interaction from 'ol/interaction';
import 'ol-layerswitcher/src/ol-layerswitcher.css';
import WMTSTileGrid from 'ol/tilegrid/WMTS';

var geojson = {"type":"Point","coordinates":[0,0]};
//var url = PARAMETRES.url + '/files/carto/ensembles_familles_paysages_4326.json';
var url = PARAMETRES.url + PARAMETRES.fileJsonPath;

var styleEnsemblePaysage = new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 1
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0)'
    }),
});

var famillesPaysagesSource = new VectorSource({
    //features: (new GeoJSON()).readFeatures(geojson)
  url: url,
  //geojson
  format: new GeoJSON()
});
/*
var famillesPaysagesVector = new VectorLayer({
    minZoom:9,
    name:'familleLayer',
    source: famillesPaysagesSource,
    title: 'Familles Paysagères',
    style: styleFamillesPaysagesFunction
 });*/
 
var famillesPaysagesVector = 
    new LayerGroup({
        title: PARAMETRES.titleJsonLayer,
        layers: [
            new VectorLayer({
                name:'familleLayer',
                source: famillesPaysagesSource,
                style: styleFamillesPaysagesFunction
            }),
            new VectorLayer({
                minZoom:9,
                name:'familleLayerLibelle',
                source: famillesPaysagesSource,
                style: styleFamillesPaysagesLibelleFunction
            })
        ]
    });

function styleFamillesPaysagesFunction(feature, resolution) {
    var style = new Style({
        stroke: new Stroke({
          color: 'grey',
          width: 0.7
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)'
        })/*,
        text: new Text({
            text : feature.get('f1'),
            fill : new Fill({
              color: 'grey'
            }),
            stroke : new Stroke({
              color: 'rgba(0, 0, 0, 0.6)',
              width: 1
            }),
            font : '15px Normal'
        })*/
    });
    return style;
}

function styleFamillesPaysagesLibelleFunction(feature, resolution) {
    var style = new Style({
        /*stroke: new Stroke({
          color: 'grey',
          width: 0.5
        }),
        fill: new Fill({
          color: 'rgba(0, 0, 0, 0)'
        }),*/
        text: new Text({
            text : feature.get(PARAMETRES.fileJsonTextField),

            fill : new Fill({
              color: 'grey'
            }),
            stroke : new Stroke({
              color: 'rgba(0, 0, 0, 0.6)',
              width: 1
            }),
            font : '15px Normal'
        })
    });
    return style;
}

 export var photoSource = new VectorSource({
     //features: (new GeoJSON()).readFeatures(geojson)
   url: PARAMETRES.url + '/get/series/geojson',
   //geojson
   format: new GeoJSON({extractStyles:false})
 });

var photoCluster = new Cluster({
    distance: 40,
//    distance:405,
    source: photoSource
});

var vectorLayer = new VectorLayer({
    name:'photoLayer',
    source: photoCluster,
    style: styleFunction
});

//----------------------------Cluster-----------------------------------
//--Définition des éléments HTML--
const listPhoto = document.getElementById('listClickMapSeriePhoto');
const listPhotoTitle = document.getElementById('listClickMapSeriePhotoTitle');

//--Définition des styles--
var clusterFill = new Fill({
    color: 'rgba(255, 153, 0, 0.8)'
});/*
var clusterFillParticipatif = new Fill({
    color: 'rgba(100, 0, 255, 0.8)'
});*/
var clusterFillParticipatif = new Fill({
    color: 'rgba(255, 153, 0, 0.8)'
});
var clusterStroke = new Stroke({
  color: 'rgba(255, 204, 0, 0.2)',
  width: 1
});
var textFill = new Fill({
  color: '#fff'
});
var textStroke = new Stroke({
  color: 'rgba(0, 0, 0, 0.6)',
  width: 3
});
var invisibleFill = new Fill({
  color: 'rgba(255, 153, 0, 0.9)',
});

//
//Création du style d'un poinr isolé
function createClusterStyle(feature) {
    var oppType = feature.values_.type;;
    if (oppType === "local"){
        var styleType = clusterFill;
    }else{
        var styleType = clusterFillParticipatif;
    }
    return new Style({
        geometry: feature.getGeometry(),
        image: new CircleStyle({
          radius:5,
          fill: styleType,
          stroke: clusterStroke
        })
    });
}
//Réécriture de la fonction du buffer d'OL (bug de celle-ci et ne convenait pas pour une extend d'un point
function buffer(extent, value) {
    return [
        extent[0] - value,
        extent[1] - value,
        extent[0] + value,
        extent[1] + value
    ];
}

//Calcul du cluster
var maxFeatureCount, vector;
function calculateClusterInfo(resolution) {
    maxFeatureCount = 0;
    var viewSerie = 0;
    var features = vectorLayer.getSource().getFeatures();
    var feature, radius;
    for (var i = features.length - 1; i >= 0; --i) {
        feature = features[i];
        var originalFeatures = feature.get('features');
        var extent = createEmpty();
        var j, jj;
        for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
            extend(extent, originalFeatures[j].getGeometry().getExtent());
        }
        var centerCluster = getCenter(extent);
        maxFeatureCount = Math.max(maxFeatureCount, jj);
        var viewSerie = viewSerie + jj;
        var test = buffer(centerCluster, /**(getWidth(extent) + getHeight(extent))**/ (360*jj));
        //console.log(getWidth(extent) + getHeight(extent));
        if (PARAMETRES.clusterType == "sizeByExtent"){
            radius = ( 0.25 * (getWidth(extent) + getHeight(extent))) / resolution;
            if (radius < 10){
                radius = 10
            }
        }else{
            radius = 10 + (jj * 2) ;
            if (radius > 40){
                radius = 60 + ((jj-50) / 2) ;
            }
        }

        feature.set('radius', radius);
    }
}

//Sélection du style en fonction de l'événement déclenché au clic
function selectStyleFunction(feature) {
    listPhotoFct(feature);
    createPopup(feature);
    var styles = [new Style({
        image: new CircleStyle({
        radius: feature.get('radius'),
        fill: invisibleFill
        })
    })];
    var originalFeatures = feature.get('features');
    var originalFeature;
    //Division du cluster en feature
//    for (var i = originalFeatures.length - 1; i >= 0; --i) {
//      originalFeature = originalFeatures[i];
//      styles.push(createClusterStyle(originalFeature));
//    }
    return styles;
}

//Attribution du style : s'il y a cluster, ou entité isolée
var currentResolution;
function styleFunction(feature, resolution) {
//    if (resolution != currentResolution) {
        calculateClusterInfo(resolution);
        currentResolution = resolution;
//    }
    var style;
    var size = feature.get('features').length;
    //S'il y a cluster alors on applique ce style :
    if (size > 1) {
        var style = new Style({
            image: new CircleStyle({
                radius: feature.get('radius'),
                fill: new Fill({
                    color: [255, 153, 0, Math.min(0.8, 0.4 + (size / maxFeatureCount))]
                })
            }),
            text: new Text({
                text: size.toString(),
                fill: textFill,
                stroke: textStroke
            })
        });
    }
    //Si l'entité est isolé on appelle le style définit par dessus
    else {
        var originalFeature = feature.get('features')[0];
        style = createClusterStyle(originalFeature);
    }
    return style;
}


//Création de la division dédiée à la description de la première série si clic sur un cluster et dédié à la série en question si clic sur série 
function listPhotoFct(feature){
  $("#listClickMapSeriePhoto").html("");
    var serie = feature.values_.features[0].values_;
    var divMere = $('<div />', { 
        class: 'bgc-white p-10 bd'
    });
    divMere.append('<div style="display:flex"><h6 class="c-grey-900">Résultat cartographique => ' + serie.title + '</h6><p class="mL-10"> #OPP ' + serie.type +'</p></div>');
    var divFille = $('<div />', { 
        class: 'mT-10'
    }).appendTo(divMere);
    var divPhotos = $('<div />', { 
        class: 'peers fxw-nw@lg+ ta-c gap-10',
        height: '110px'
    }).appendTo(divFille);
    for (let i = 0; i < serie.photosSerie.length; i++){
        var img = $('<img />', { 
            id: serie.photosSerie[i][0],
            src: PARAMETRES.url + "/files/miniature/" +  serie.photosSerie[i].url,
            alt: serie.titre
        });
        var divPhoto = $('<div />', {class: 'peer'}).append(img);

        divPhoto.append('<div class="c-grey-900">' +  serie.photosSerie[i].date + '</div>');
        divPhoto.append('<hr>');

        $(divPhoto).appendTo(divPhotos);
    }
    var d = document.createElement('div');

    $(d).addClass('masonry-item col-md-12 cur-p btn-outline-success')
        .html(divMere)
        .appendTo($("#listClickMapSeriePhoto")) //main div
        .click(function () {
            location.href = PARAMETRES.url + '/public/get/serie/' + serie.id;
            $(this).remove();
        })
        /*.hide()
        .slideToggle(300)
        .delay(50);*/

  new Masonry('.masonry', {
      itemSelector: '.masonry-item',
      columnWidth: '.masonry-sizer',
      percentPosition: true,
    });
};

//Popup HTML
var container = document.getElementById('popup');
var content = $('#popup-content');
var crossCloser =  $('#popup-closer');

function createPopup(feature){
    content.html('');
    //content.append('<strong>Séries :</strong>');
    var series = feature.values_.features;
    if ((series.length - 1) > 9){
        var length = 9;
    }else{
        var length = series.length - 1;
    }
    for (var i = 0; i <= length; ++i) {
        var titleLink = $('<a> </a>', { 
            id: series[i].values_.id,
            alt: series[i].values_.title,
            value:series[i].values_.title,
            href: PARAMETRES.url + "/get/serie/" + series[i].values_.id
        });
        content.append("<div><a href=" + PARAMETRES.url + "/public/get/serie/" + series[i].values_.id + ">" + series[i].values_.title + "</a></div>"); 
        content.append("<small> " + series[i].values_.commune + "</a></small></div>"); 
//        var divPhoto = $('<div />', {class: 'mapSerie'}).append(img);
//        divPhoto.append('<div class="c-grey-900">' +  serie.photosSerie[i].date + '</div>');

//        var img = $('<p>', { 
//            id: serie.photosSerie[i][0],
//            src: PARAMETRES.url + "/files/miniature/" +  serie.photosSerie[i].url,
//            alt: serie.titre
//        });
    }
    overlay.setPosition(feature.values_.geometry.flatCoordinates);
};

//Création de la popup
var overlay = new Overlay({
    element: container,
    autoPan: true,
    positioning: "bottom-left",
    autoPanAnimation: {
        duration: 250
    }
});

crossCloser.click(function() {
    overlay.setPosition(undefined);
    crossCloser.blur();
    return false;
});

var raster = new TileLayer({
    source: new OSM()
});/*
var groupLayers = new Group({
    'title': 'Fond de plan',
    layers : [
        new TileLayer({
            title: 'OSM1',
            type: 'base',
            source: new OSM()
        }),
        new TileLayer({
            title: 'OSM2',
            type: 'base',
            source: new OSM()
        }),
    ]
})*/
/*
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
});*/

var groupLayers =  [
        new TileLayer({
            title: 'Stamen',
            type: 'base',
            source: new Stamen({
                layer: 'watercolor'
            })
        }),
        new TileLayer({
            source : PARAMETRES.sourceLayerSat,
            /*new WMTS ({
                url: 'https://tile.geobretagne.fr/gwc02/service/wmts',
                layer: 'satellite',
                format: 'image/jpeg',
                matrixSet: 'EPSG:3857',
                tileGrid: tileGrid,
                style: 'default',
                dimensions: {
                    'threshold': 100
                },
            }),*/
            title: 'Orthophoto',
            type: 'base',
        }),
        new TileLayer({
            title: 'OSM',
            type: 'base',
            source: new OSM()
        }),
        famillesPaysagesVector,
        vectorLayer
    ];
    /*https://tile.geobretagne.fr/gwc02/service/wmts?
    SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=satellite&STYLE=&
    TILEMATRIXSET=EPSG%3A3857&TILEMATRIX=EPSG%3A3857%3A12&TILEROW=1409&TILECOL=2035&FORMAT=image%2Fjpeg*/


//Création de la map avec les intéractions nécessaires à l'intérieur
export var map = new Map({
    //layers: [raster, vectorLayer],
    layers: groupLayers,
    target: 'map',
    overlays: [overlay],
    interactions: defaultInteractions().extend([new Select({
        condition: function(evt) {
            return evt.type == 'singleclick' ;
        },
        filter: function(feature, layer){
            //si on est sur la couche des photos
            return layer.get('name') == 'photoLayer';
        },
        //Attribution du style au clic
        style: selectStyleFunction
    })]),
    view: new View({
        center: fromLonLat([PARAMETRES.mapLongitude, PARAMETRES.mapLatitude]),
        zoom: PARAMETRES.mapZoom
    }),
    controls: [
            new Zoom(),
            //new ol.control.LayerSwitcher()
//            new ol.control.ScaleLine()
    ],
});

var layerSwitcher = new LayerSwitcher();
map.addControl(layerSwitcher);

map.on('click', function(event) {
    overlay.setPosition(undefined);
});
