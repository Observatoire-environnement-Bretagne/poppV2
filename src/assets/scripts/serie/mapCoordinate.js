    
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import {OSM, Vector as VectorSource} from 'ol/source';
import View from 'ol/View';
import 'ol/ol.css';
import Map from 'ol/Map';
import {fromLonLat}  from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import Circle from 'ol/geom/Circle';
import MousePosition from 'ol/control/MousePosition';
import DrawInteraction from 'ol/interaction/Draw';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style';

import * as $ from 'jquery';

var longitude = $("#photo_emplacement_longitude").val();
var latitude = $("#photo_emplacement_latitutde").val();
var coord = document.getElementsByClassName('ol-mouse-position').value;

var map = new Map({
  target: 'mapSerieCoordinate',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: fromLonLat([-1.6777926, 48.117266]),
    zoom: 7
  })
});

map.addControl(new MousePosition({projection: 'EPSG:3857',}))

map.on('singleclick', function(evt) {
    var coordinates = fromLonLat(evt.coordinate);
    $("#photo_emplacement_longitude").val(coordinates[0]); 
    $("#photo_emplacement_latitude").val(coordinates[1]);
});


var source = new VectorSource();

var vectorSource = new VectorLayer({
  source: source
});

var draw = new DrawInteraction({
    source: vectorSource,
    maxPoints: 1,
    geometryName:"POI",
    freehand:true,
    type: "point",
});

$("#btnPositionnerCoord").focus(function position(){
    map.removeInteraction(draw);                                                                                
    map.addInteraction(draw);
});

