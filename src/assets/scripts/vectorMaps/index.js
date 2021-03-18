/*import * as $ from 'jquery';
import 'jvectormap';
import 'jvectormap/jquery-jvectormap.css';
import './jquery-jvectormap-world-mill.js';
import { debounce } from 'lodash';

export default (function () {
  const vectorMapInit = () => {
    if ($('#world-map-marker').length > 0) {
      // This is a hack, as the .empty() did not do the work
      $('#vmap').remove();

      // we recreate (after removing it) the container div, to reset all the data of the map
      $('#world-map-marker').append(`
        <div
          id="vmap"
          style="
            height: 490px;
            position: relative;
            overflow: hidden;
            background-color: transparent;
          "
        >
        </div>
      `);

      $('#vmap').vectorMap({
        map: 'world_mill',
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderOpacity: 0.25,
        borderWidth: 0,
        color: '#e6e6e6',
        regionStyle : {
          initial : {
            fill : '#e4ecef',
          },
        },

        markerStyle: {
          initial: {
            r: 7,
            'fill': '#fff',
            'fill-opacity':1,
            'stroke': '#000',
            'stroke-width' : 2,
            'stroke-opacity': 0.4,
          },
        },

        markers : [{
          latLng : [21.00, 78.00],
          name : 'INDIA : 350',
        }, {
          latLng : [-33.00, 151.00],
          name : 'Australia : 250',
        }, {
          latLng : [36.77, -119.41],
          name : 'USA : 250',
        }, {
          latLng : [55.37, -3.41],
          name : 'UK   : 250',
        }, {
          latLng : [25.20, 55.27],
          name : 'UAE : 250',
        }],
        series: {
          regions: [{
            values: {
              'US': 298,
              'SA': 200,
              'AU': 760,
              'IN': 200,
              'GB': 120,
            },
            scale: ['#03a9f3', '#02a7f1'],
            normalizeFunction: 'polynomial',
          }],
        },
        hoverOpacity: null,
        normalizeFunction: 'linear',
        zoomOnScroll: false,
        scaleColors: ['#b6d6ff', '#005ace'],
        selectedColor: '#c9dfaf',
        selectedRegions: [],
        enableZoom: false,
        hoverColor: '#fff',
      });
    }
  };
*/
  vectorMapInit();
  $(window).resize(debounce(vectorMapInit, 150));
})();
import { debounce } from 'lodash';

export default (function () {
  const vectorMapInit = () => {           
    /*var iconFeature = new ol.Feature({
        geometry: new ol.geom.Point(ol.proj.fromLonLat([-3.25, 48.05])),
        //geometry: new ol.geom.Point([-1.68, 48.08]),
        name: 'Phare du Paon',
        description: '35 CESSON-SEVIGNE',
        population: 4000,
        rainfall: 500
      });
      
    var iconStyle = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          scale: 0.2,
          imgColor: '#FE7108',
          src: '/photos/camera.ico'
        })
      });
      
//    var circleStyle =  new ol.style.Style({
//        image: new ol.style.Circle({
//            radius: 15,
//            fill: new ol.style.Fill({color: 'red'}),
//            stroke: new ol.style.Stroke({color: '#bada55', width: 1}),
//            opacity: 0.8
//        })
//    });
    iconFeature.setStyle(iconStyle);
    
    var vectorSource = new ol.source.Vector({
        features: [iconFeature]
    });

    var vectorLayer = new ol.layer.Vector({
        source: vectorSource
    });

    var map = new ol.Map({
        target: 'world-map-marker',
        layers: [
            new ol.layer.Tile({
                      title: 'Open Street Map',
                      source: new ol.source.OSM(),
                      type: 'base',
                      visible: true 
                  }),

            new ol.layer.Tile({ 
                title: 'Carto CDN Light',
                type: 'base',
                visible: false,
                source: new ol.source.XYZ({ 
                    url:'http://{1-4}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
                })
            }),
            
              new ol.layer.Tile({ 
                title: 'Carto CDN Dark',
                type: 'base',
                visible: false,
                source: new ol.source.XYZ({ 
                    url:'http://{1-4}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
                })
            }),
            
            new ol.layer.Tile({ 
                title: 'Satellite Hybrid',
                type: 'base',
                visible: false,
                source: new ol.source.XYZ({ 
                    url:'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=LinFKM9sGsjsCjqpZ0Ph',
                })
            }),
            
            new ol.layer.Tile({
                      title: 'OpenTopoMap',
                      source: new ol.source.XYZ({
                          url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
                      }),
                      type: 'base',
                      visible: false
                  }),
            new ol.layer.Tile({
                title: 'Stamen Watercolor',
                preload: Infinity,
                source: new ol.source.Stamen({
                        layer: 'watercolor',
                }),
                visible: false,
                type: 'base'
            }),
            vectorLayer
        ],
        controls: [
//            new ol.control.Zoom(),
            //new ol.control.LayerSwitcher()
//            new ol.control.ScaleLine()
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([-3.25, 48.05]),
          zoom: 8
        })
      });
//----------------- Ajout d'une info-bulle au clic ---------------------------
    var container = document.getElementById('bottompanel');
    var content = document.getElementById('bottompanel-content');

    map.on('singleclick', function (event) {
        if (map.hasFeatureAtPixel(event.pixel) === true) {
            container.style.visibility='visible';
            container.innerHTML = '<a href="features">' + iconFeature.get('name') + '</a><p>22 ILE-DE-BREHAT</p>';
//            overlay.setPosition(coordinate);
        } else {
            container.style.visibility='collapse';
        }
    });

//----------------- Nouveau style au survol ---------------------------
    var iconStyle2 = new ol.style.Style({
        image: new ol.style.Icon({
          anchor: [0.5, 46],
          anchorXUnits: 'fraction',
          anchorYUnits: 'pixels',
          scale: 0.25,
          imgColor: '#FE7108',
          src: '/photos/camera.ico'
        })
      });

//----------------- Surlignage au survol du POI ---------------------------
    var selected = null;
    var status = document.getElementById('status');

    map.on('pointermove', function(e) {
      if (selected !== null) {
        selected.setStyle(iconStyle);
        selected = null;
      }

      map.forEachFeatureAtPixel(e.pixel, function(f) {
        selected = f;
        f.setStyle(iconStyle2);
        return true;
      });*/


//-- Permet d'afficher du contenu au survol --
//      if (selected) {
//        status.innerHTML = '&nbsp;Hovering: ' + selected.get('name');
//      } else {
//        status.innerHTML = '&nbsp;';
//      }
    });

//    var container = document.getElementById('bottompanel');
//    var displayFeatureInfo = function(pixel, coordinate) {
//    var features = [];
//        map.forEachFeatureAtPixel(pixel, function(feature, layer) {
//          features.push(feature);
//        });
//        if (features.length > 0) {
//          var info = [];
//          for (var i = 0, ii = features.length; i < ii; ++i) {
//            info.push(features[i].get('N3NM'));
//          }
//          container.innerHTML = info.join(', ') || '<a href="http://localhost:8000/public/features">Informations</a>';
//          var randomPositioning = 'center-center';
//          bottompanel.setPositioning(randomPositioning);
//          bottompanel.setPosition(coordinate);
//        } else {
//          container.innerHTML = '&nbsp;';
//        }
//      };
//
//      map.forEachFeatureAtPixel(function(feature, layer) {
//        var element = bottompanel.getElement();
////        var coordinate = evt.coordinate;
//        
//        $(element).popover('destroy');
////        bottompanel.setPosition(coordinate);
//        $(element).popover({
//          placement: 'top',
//          animation: false,
//          html: true,
//          content: '<a href="https://popp.applis-bretagne.fr/node/1618">Phare du Paon</a><p> -22 ILE-DE-BREHAT</p>'
//        });
//        $(element).popover('show');
//        
//        displayFeatureInfo(evt.pixel, coordinate);
//      });

  };
  vectorMapInit();
  //$(window).resize(debounce(vectorMapInit, 150));
  
  
    // ---------------- Partie cartographique pour récupérer les coordonnées géographiques de la map des séries photos ----------------
        /*var photo_emplacement_longitude = document.getElementById('photo_emplacement_longitude').value;
        var photo_emplacement_latitude = document.getElementById('photo_emplacement_latitude').value;
        var coord = document.getElementsByClassName('ol-mouse-position').value;

        var map = new ol.Map({
          target: 'mapSerie',
          layers: [
            new ol.layer.Tile({
              source: new ol.source.OSM()
            })
          ],
          view: new ol.View({
            center: ol.proj.fromLonLat([-1.6777926, 48.117266]),
            zoom: 7
          })
        });

        map.addControl(new ol.control.MousePosition({projection: 'EPSG:4326',}))

        map.on('singleclick', function(evt) {
            var coordinate = ol.proj.toLonLat(evt.coordinate);
            document.getElementById('photo_emplacement_longitude').value = coordinate[0];
            document.getElementById('photo_emplacement_latitude').value = coordinate[1];
        });


        var source = new ol.source.Vector();

        var vectorSource = new ol.layer.Vector({
          source: source
        });

        var draw = new ol.interaction.Draw({
            source: vectorSource,
            maxPoints: 1,
            geometryName:"POI",
            freehand:true,
            type: "point",

        });

        function position(){
            map.removeInteraction(draw);                                                                                
            map.addInteraction(draw);
        }*/
    // ---------------- Fin partie cartographique des séries ----------------
  
})();