// author: Zhen Li
// email: hpulizhen@163.com
// enhanced author: Luyang Han
// email: hanluhou98@gmail.com

// Grant CesiumJS access to your ion assets

// Z. Li's Cesium ion access token
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmJiODMwMi1mODRiLTQ2YTEtODMzZC0zYTVlY2Q5YmQxMjMiLCJpZCI6OTkxMSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NTI4Mzg1NH0.gvjcqfwCYVBcmZ11Jzr-k5Q13QXZ6qGVer9WSXOs9K8';
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmJiODMwMi1mODRiLTQ2YTEtODMzZC0zYTVlY2Q5YmQxMjMiLCJpZCI6OTkxMSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NTI4Mzg1NH0.gvjcqfwCYVBcmZ11Jzr-k5Q13QXZ6qGVer9WSXOs9K8';

// S. Bhattarai's Cesium ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMzVhMjQ1MS1iZjIxLTQxNTctODA2Yi1mOTJmNDkwYzU2MWUiLCJpZCI6OTczMiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDgxNDUzN30.5gySU1UpdweOzztxyf6KbIqYc-hR_yfgo5aEGLgGPDc';

var viewer_main, radar_viewer;
var start_jd;


var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load = false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection

var satcat;
var data_path = "data/"; //set file directory

var longitude = 0.0;
var latitude = 51.0;
var height = 10.0;


var options3D = {
  homeButton: false,
  fullscreenButton: false,
  sceneModePicker: false,
  clockViewModel: clockViewModel,
  infoBox: false,
  geocoder: false,
  sceneMode: Cesium.SceneMode.SCENE3D,
  navigationHelpButton: false,
  animation: false,
  CreditDisplay: false,
  timeline: false,
  baseLayerPicker: false
};

var options2D = {
  homeButton: false,
  fullscreenButton: false,
  sceneModePicker: true,
  clockViewModel: clockViewModel,
  infoBox: true,
  geocoder: false,
  sceneMode: Cesium.SceneMode.SCENE2D,
  navigationHelpButton: false,
  animation: false,
  CreditDisplay: false,
  timeline: false,
  baseLayerPicker: false
};


function icrf_view_main(scene, time) {
  if (scene.mode !== Cesium.SceneMode.SCENE3D)  //3D mode. A traditional 3D perspective view of the globe.
  {
    return;
  }
  var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time); //Computes a rotation matrix to transform a point or vector 
  //from the International Celestial Reference Frame (GCRF/ICRF) inertial frame axes to the Earth-Fixed frame axes (ITRF) at a given time
  //This function may return undefined if the data necessary to do the transformation is not yet loaded.
  if (Cesium.defined(icrfToFixed)) //if not undefined
  {
    var camera = viewer_main.camera;
    var offset = Cesium.Cartesian3.clone(camera.position); //duplicate A 3D Cartesian point.
    //Returns:
    //The modified result parameter or a new Cartesian3 instance if one was not provided. (Returns undefined if cartesian is undefined)
    var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
    //Computes a Matrix4 instance from a Matrix3 representing the rotation and a Cartesian3 representing the translation.
    camera.lookAtTransform(transform, offset);
  }
}

// function icrf_radar(scene, time) 
// {
//   if (scene.mode !== Cesium.SceneMode.SCENE3D) 
//   {
//       return;
//   }
//   var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
//   if (Cesium.defined(icrfToFixed)) 
//   {
//       var camera = radar_viewer.camera;
//       var offset = Cesium.Cartesian3.clone(camera.position);
//       var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);
//       camera.lookAtTransform(transform, offset);
//   }
// }







// // define callback functions
// var prepareScreenshot = function(){
//   var canvas = scene.canvas;    
//   viewer.resolutionScale = targetResolutionScale;
//   scene.preRender.removeEventListener(prepareScreenshot);
//   // take snapshot after defined timeout to allow scene update (ie. loading data)
//   setTimeout(function(){
//       scene.postRender.addEventListener(takeScreenshot);
//   }, timeout);
// }

// var takeScreenshot = function(){    
//   scene.postRender.removeEventListener(takeScreenshot);
//   var canvas = scene.canvas;
//   canvas.toBlob(function(blob){
//       var url = URL.createObjectURL(blob);
//       downloadURI(url, "snapshot-" + targetResolutionScale.toString() + "x.png");
//       // reset resolutionScale
//       viewer.resolutionScale = 1.0;
//   });
// }

// function downloadURI(uri, name) {
//   var link = document.createElement("a");
//   link.download = name;
//   link.href = uri;
//   // mimic click on "download button"
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   delete link;
// }


//convert ECEF XYZ coordinates to ellipsoidal values of latitude and longitude
function ecef2blh(x_ecef, y_ecef, z_ecef) {
  //var ellipsoid_wgs84 = Cesium.Ellipsoid.WGS84;
  var FE_WGS84 = (1.0 / 298.257223563);
  var RE_WGS84 = 6378137.0;
  var PI = Math.PI;
  var e2 = FE_WGS84 * (2.0 - FE_WGS84);
  var r2 = x_ecef * x_ecef + y_ecef * y_ecef, z, zk, v = RE_WGS84, sinp;
  for (z = z_ecef, zk = 0.0; Math.abs(z - zk) >= 1E-4;) {
    zk = z;
    sinp = z / Math.sqrt(r2 + z * z);
    v = RE_WGS84 / Math.sqrt(1.0 - e2 * sinp * sinp);
    z = z_ecef + v * e2 * sinp;
  }
  var blh = new Array();
  blh[0] = r2 > 1E-12 ? Math.atan(z / Math.sqrt(r2)) : (z_ecef > 0.0 ? Math.PI / 2.0 : -Math.PI / 2.0);
  blh[1] = r2 > 1E-12 ? Math.atan2(y_ecef, x_ecef) : 0.0;
  blh[2] = Math.sqrt(r2 + z * z) - v;
  return blh;
}



function xyz2enu_matrix(lat, lon) {
  var E = new Array(9);
  var sinp = Math.sin(lat), cosp = Math.cos(lat), sinl = Math.sin(lon), cosl = Math.cos(lon);
  E[0] = -sinl; E[1] = cosl; E[2] = 0.0;
  E[3] = -sinp * cosl; E[4] = -sinp * sinl; E[5] = cosp;
  E[6] = cosp * cosl; E[7] = cosp * sinl; E[8] = sinp;
  return E;
}
/** simulate the radar screen*/
function radar_screen(radar_position_ecef) {

  // var blh = ecef2blh(radar_position_ecef.x,radar_position_ecef.y,radar_position_ecef.z );
  // var ecef_enu = xyz2enu_matrix(blh[0],blh[1]);

  /// set the position of the radar
  radar_viewer.camera.position = radar_position_ecef;// new Cesium.Cartesian3(radar_position_ecef.x,radar_position_ecef.y,radar_position_ecef.z);

  var ellipsoid_wgs84 = Cesium.Ellipsoid.WGS84;
  var normal_ecef = ellipsoid_wgs84.geodeticSurfaceNormal(radar_position_ecef);


  // /// camera_target in NEU
  var length = 1.0;
  var ele = 60 / 180.0 * Cesium.Math.PI;
  var azi = 90 / 180.0 * Cesium.Math.PI;
  var E = length * Math.cos(ele) * Math.sin(azi);
  var N = length * Math.cos(ele) * Math.cos(azi);
  var U = length * Math.sin(ele);

  var camera_target_enu = new Cesium.Cartesian3(E, N, U);
  var camera_target_ecef = new Cesium.Cartesian3();
  // /// set the radar direction, azimuth and elevation
  var transform_enu2ecef = Cesium.Transforms.eastNorthUpToFixedFrame(radar_position_ecef);
  camera_target_ecef = Cesium.Matrix4.multiplyByPointAsVector(transform_enu2ecef, camera_target_enu, camera_target_ecef);

  //var transform_enu2ecef = new Cesium.Matrix3();
  //Cesium.Matrix3.fromColumnMajorArray(ecef_enu, transform_enu2ecef);
  //camera_target_ecef = Cesium.Matrix3.multiplyByVector(transform_enu2ecef,camera_target_enu,camera_target_ecef);



  /// how to define the Up of image plane
  camera_target_ecef = Cesium.Cartesian3.normalize(camera_target_ecef, camera_target_ecef);
  radar_viewer.camera.direction = camera_target_ecef;
  var normal_tmp = new Cesium.Cartesian3();
  var camera_up = new Cesium.Cartesian3();
  normal_tmp = Cesium.Cartesian3.cross(normal_ecef, camera_target_ecef, normal_tmp);
  camera_up = Cesium.Cartesian3.cross(camera_target_ecef, normal_tmp, camera_up);
  radar_viewer.camera.up = camera_up;

  radar_viewer.camera.frustum.fov = 60 / 180 * Cesium.Math.PI; /// field of view
  radar_viewer.camera.frustum.near = 0.1;
  radar_viewer.camera.frustum.far = 20000000.0;
  radar_viewer.camera.frustum.aspectRatio = radar_viewer.scene.canvas.clientWidth / radar_viewer.scene.canvas.clientHeight;


  // View in east-north-up frame
  // var camera = viewer_main.camera;
  // camera.constrainedAxis = Cesium.Cartesian3.UNIT_Z;
  // camera.lookAtTransform(transform, new Cesium.Cartesian3(-120000.0, -120000.0, 120000.0));
  // // Show reference frame.  Not required.
  // referenceFramePrimitive = radar_viewer.scene.primitives.add(new Cesium.DebugModelMatrixPrimitive({
  //     modelMatrix : radar_viewer.camera.transform,
  //     length : 1000000.0
  // }));

}


//function update_debris_position(debris_set, viewer,mycatlog)
function update_debris_position() {
  var debris_set = debris_collection; //这里的debris_collection在下边的window.onload()中定义了
  // console.log(debris_set)
  var viewer = viewer_main; //这里的viewer_main也在下边的window.onload()中定义了
  var mycatlog = satcat; //这里的satcat也在下边的window.onload()中定义了是自定义Catalogue类

  time = viewer.clock.currentTime; /// the current computer time in TAI? not in UTC?
  var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???

  //Creates a new instance that represents the current system time. This is equivalent to calling JulianDate.fromDate(new Date());.
  //var time_utc = Cesium.JulianDate.now();
  var time_utc = new Cesium.JulianDate();//这里就是定义一个时间
  Cesium.JulianDate.addSeconds(time, tai_utc, time_utc);

  // var t1_now = Cesium.JulianDate.now();
  // var t2_now = Date.now();

  var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time_utc);
  var time_date_js = Cesium.JulianDate.toDate(time_utc); /// convert time into js Date()


  var position_ecef = new Cesium.Cartesian3();
  var points = debris_set._pointPrimitives;
  var length = points.length;

  // if (length > 0)
  // {
  //   console.log("point number in debris_set._pointPrimitives is loaded!");
  // }

  var pos_radar_view = new Cesium.Cartesian3();

  for (var i = 0; i < length; ++i) {
    var point = points[i];
    // console.log(point) //检查point属性
    //Cesium.Cartesian3.clone(point.position, position_ecef);
    ///compute the position of debris according to time
    if (Cesium.defined(icrfToFixed)) {

      var positionAndVelocity = mycatlog.compute_debri_position_eci(i, time_date_js);//  satellite.propagate(tle_rec,time_date);

      var position_eci = new Cesium.Cartesian3(positionAndVelocity.position.x * 1000, positionAndVelocity.position.y * 1000, positionAndVelocity.position.z * 1000);

      position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);

      Cesium.Cartesian3.clone(position_ecef, pos_radar_view);

      //更新viewer_main中的点的位置
      point.position = position_ecef; //// update back

      ///更新radar_viewer中的点的位置
      //update the radar_view debri_collection在下边的windowonload function中定义了
      debri_collection_radar._pointPrimitives[i].position = pos_radar_view; //pos_radar_view与position_ecef一致

    }
  }
}





var cataloglist =
{
  cat_1: "fspcat_test",  /// the catalogue file for test
  cat_2: "fspcat_20190522_v04_nodeb", //// baseline_fspcat_20190522_v04_nodeb.json
  cat_3: "fspcat_20280101_v04_nodeb", /// fspcat_20280101_v04_nodeb.json
  cat_4: "fspcat_20230101", /// fspcat_20230101.json
  cat_5: "fspcat_20230701", /// fspcat_20230701.json
  cat_6: "fspcat_20230101_v16_nodeb",
  cat_7: "fspcat_20280101_v230819_nodeb",
  cat_8: "fspcat_20430701_v16_nodeb",
  cat_9: "fspcat_20430701_sk_nodeb",
  cat_10: "fspcat_20430701_v270819_nodeb",
  cat_11: "fspcat_baseline_20190522_v280819_nodeb",
  cat_12: "fspcat_20230101_v280819_nodeb",
  cat_13: "fspcat_20280101_v280819_nodeb",
  cat_14: "fspcat_20430701_v280819_nodeb",
  cat_15: "fspcat_20430701_v280819_test"
  /// geo_tle.json	
}

function GUIset() {
  var gui = new dat.GUI({ width: 500 });
  gui.domElement.id = 'datgui';
  // gui.domElement.id = 'datgui';

  var folderSpacecraft = gui.addFolder('Catalogue option bar');
  var aaa = {
    CatalogName: ""
  }; ///cataloglist.cat_1

  folderSpacecraft.add(aaa, 'CatalogName', Object.values(cataloglist)).onChange(
    function (value) {
      // alert(value);
      ///first clear all the catalog data
      satcat.clear_catalog();
      data_load = false;
      debris_collection.removeAll();
      debri_collection_radar.removeAll();

      var satcat_logfile = "";
      var type = "";
      if (value.substring(0, 6) == "fspcat") {
        type = "kep";
        satcat_logfile = data_path + "catalogue/" + value + ".json";
        ///////////////////判断目录是哪一个日期开始
        if (value.substring(6, 15) == "_20190522") {
          start_jd = Cesium.JulianDate.fromIso8601("2019-05-22T00:00:00Z");
          viewer_main.clock.currentTime = Cesium.JulianDate.fromIso8601("2019-05-22T00:00:00Z"); ///It is in system loal time
          viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
          viewer_main.timeline.updateFromClock();
          viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));

          /*viewer_main.clock.startTime = Cesium.JulianDate.fromIso8601("2019-05-22T00:00:00Z")
          viewer_main.clock.stopTime = Cesium.JulianDate.fromIso8601("2019-05-23T00:00:00Z")
          var startTime = viewer_main.clock.startTime;
          var stopTime = viewer_main.clock.stopTime;
          function tick() {
            var currentTime = Cesium.JulianDate.fromIso8601("2019-05-22T00:00:00Z")
            if (Cesium.JulianDate.greaterThan(currentTime, stopTime)){
              startTime = Cesium.JulianDate.addSeconds(startTime, 86400, startTime);
              stopTime = Cesium.JulianDate.addSeconds(stopTime, 86400, stopTime);
              viewer_main.timeline.zoomTo(startTime, stopTime);
            }
            Cesium.requestAnimationFrame(tick);
          }
          Cesium.requestAnimationFrame(tick);
*/


        }

        if (value.substring(6, 15) == "_20280101") {
          start_jd = Cesium.JulianDate.fromIso8601("2028-01-01T00:00:00Z");
          viewer_main.clock.currentTime = Cesium.JulianDate.fromIso8601("2028-01-01T00:00:00Z"); ///It is in system loal time
          viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
          viewer_main.timeline.updateFromClock();
          viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
        }

        if (value.substring(6, 15) == "_20230101") {
          start_jd = Cesium.JulianDate.fromIso8601("2023-01-01T00:00:00Z");
          viewer_main.clock.currentTime = Cesium.JulianDate.fromIso8601("2023-01-01T00:00:00Z"); ///It is in system loal time
          viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
          viewer_main.timeline.updateFromClock();
          viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
        }

        if (value.substring(6, 15) == "_20430701") {
          start_jd = Cesium.JulianDate.fromIso8601("2043-07-01T00:00:00Z");
          viewer_main.clock.currentTime = Cesium.JulianDate.fromIso8601("2043-07-01T00:00:00Z"); ///It is in system loal time
          viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
          viewer_main.timeline.updateFromClock();
          viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
        }

        if (value.substring(6, 15) == "_baseline") {
          start_jd = Cesium.JulianDate.fromIso8601("2019-05-22T00:00:00Z");
          viewer_main.clock.currentTime = Cesium.JulianDate.fromIso8601("2019-05-22T00:00:00Z"); ///It is in system loal time
          viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
          viewer_main.timeline.updateFromClock();
          viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));
        }


      }
      else if (value.substring(0, 3) == "tle") {
        type = "tle";
        satcat_logfile = data_path + "tle/" + value + ".json";
      }

      satcat.loadcatlog(type, satcat_logfile);
      ///load the corresponding catalog files
      // console.log("successfully loaded data");
    }
  );



}


function set_value() {
  var radar_position_ecef = new Cesium.Cartesian3(0, 0, 0);
  //******问题：如何实现用户自定义input的值，window.onload先后顺序问题 */
  var longitude = document.getElementById("user_longitude").value;
  var latitude = document.getElementById("user_latitude").value;
  var height = 10.0;


  radar_position_ecef = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

  var point = viewer_main.entities.getById("London");
  viewer_main.entities.remove(point);
  // // /// show the position of the telescope
  var redpoint = viewer_main.entities.add({
    id: "London",
    name: 'Telescope Point',
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    point: { pixelSize: 15, color: Cesium.Color.DEEPPINK }
  });


  /* var wyoming = viewer_main.entities.add({
      polygon : {
        hierarchy : Cesium.Cartesian3.fromDegreesArray([
                                  -109.080842,45.002073,
                                  -105.91517,45.002073,
                                  -104.058488,44.996596,
                                  -104.053011,43.002989,
                                  -104.053011,41.003906,
                                  -105.728954,40.998429,
                                  -107.919731,41.003906,
                                  -109.04798,40.998429,
                                  -111.047063,40.998429,
                                  -111.047063,42.000709,
                                  -111.047063,44.476286,
                                  -111.05254,45.002073]),
        height : 0,
        material : Cesium.Color.RED.withAlpha(0.5),
        outline : true,
        outlineColor : Cesium.Color.BLACK
      }
    });
   */

  radar_screen(radar_position_ecef);

}





window.onload = function () {

  satcat = new Catalogue();



  clockViewModel = new Cesium.ClockViewModel();

  viewer_main = new Cesium.Viewer('main_viewer', {
    imageryProvider: Cesium.createTileMapServiceImageryProvider({
      url: Cesium.buildModuleUrl('../Cesium/Assets/Textures/NaturalEarthII')
    }),
    baseLayerPicker: false,
    geocoder: false,
    timeline: true,
    clockViewModel: clockViewModel
  });


  //Enable depth testing so things behind the terrain disappear.
  viewer_main.scene.globe.depthTestAgainstTerrain = true;


  viewer_main.globe = true;
  viewer_main.scene.globe.enableLighting = true;
  viewer_main.clock.multiplier = 100;               // speed of the simulation

  var mycredit = new Cesium.Credit("Space Geodesy and Navigation Laboratory", 'data/sgnl.png', 'https://www.ucl.ac.uk');
  // var mycredit = new Cesium.Credit('Cesium', 'data/sgnl.png', 'https://www.ucl.ac.uk');
  viewer_main.scene.frameState.creditDisplay.addDefaultCredit(mycredit);
  viewer_main.CreditDisplay = true;
  viewer_main.scene.debugShowFramesPerSecond = true;
  viewer_main.scene.frameState.creditDisplay.removeDefaultCredit();


  //start_jd = Cesium.JulianDate.now();
  start_jd = Cesium.JulianDate.now();
  viewer_main.clock.currentTime = Cesium.JulianDate.now(); ///It is in system loal time
  viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
  viewer_main.timeline.updateFromClock();
  viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));


  GUIset();



  /// debris_collection to store all the debris points
  debris_collection = new Cesium.PointPrimitiveCollection();
  debri_collection_radar = new Cesium.PointPrimitiveCollection();
  //By seting the blendOption to OPAQUE can improve the performance twice
  debri_collection_radar.blendOption = Cesium.BlendOption.OPAQUE;

  /// add debris_collection to the viewer_main
  /// should organize debris in different orbtis to different collections
  debris_collection = viewer_main.scene.primitives.add(debris_collection);
  debris_collection.blendOption = Cesium.BlendOption.OPAQUE;

  var colour = Cesium.Color.YELLOW;

  /// a timer is used to deal with the async reading of JSON
  var timename = setInterval(function () {
    if (satcat.data_load_complete == true
      && data_load == false) {
      //ShowDebris(viewer_main,mycatlog,4);

      active_num = 0;
      inactive_num = 0;
      leo_num = 0;
      meo_num = 0;
      geo_num = 0;
      unknowncat_num = 0;
      usa = 0;
      china = 0;
      russia = 0;
      uk = 0;
      eu = 0;
      others = 0;
      rc_1 = 0;
      rc_2 = 0;
      rc_3 = 0;


      

      for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) {


        var operation_status = satcat.getDebriOperation_status(debrisID);
        var sat_category = satcat.getDebriCategory(debrisID);
        var cross_section = satcat.getDebriCross_Section(debrisID);
        var country = satcat.getDebriCountry(debrisID);
        let sat_infor = satcat.getDebriInfo(debrisID);

        // 创建一个Map来存储额外的数据
        let pointDataMap = new Map();
        pointDataMap.set(debris_collection.id, sat_infor);
        // 然后，当你需要访问这些额外数据时，你可以通过id来获取：
        let pointData = pointDataMap.get(satcat.getDebriName[debrisID]);
        console.log(pointData.RSO_name);
       

        if (country == 1) { usa = usa + 1 }
        if (country == 2) { china = china + 1 }
        if (country == 3) { russia = russia + 1 }
        if (country == 4) { uk = uk + 1 }
        if (country == 5) { eu = eu + 1 }
        if (country == 6) { others = others + 1 }


        if (operation_status > 0.0) {
          colour = Cesium.Color.GREEN;
          active_num = active_num + 1;
          ////////这里加判断条件只有运行的卫星才统计GEO,LEO,MEO的数量
          //但首先要在Catalogue.js写一个判断程序以实现判断GEO,LEO,MEO；
          //可以模仿getDebriOperation_status（），给不同种类如变量名起名为cate_sat附不同的值

        }
        else {
          colour = Cesium.Color.RED;
          inactive_num = inactive_num + 1;
        }


        //satellite category identifier
        if (sat_category == 1) { leo_num = leo_num + 1 }
        if (sat_category == 2) { meo_num = meo_num + 1 }
        if (sat_category == 3) { geo_num = geo_num + 1 }
        if (sat_category == -1) { unknowncat_num = unknowncat_num + 1 }
        //在这里加if，else判断条件根据radar_cross_section以调整小窗口的显示，先试试改颜色color
        
        
        debris_collection.add({
          name: 'point',
          id: satcat.getDebriName[debrisID],
          position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
          pixelSize: 3,
          color: colour
          // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
        });
        // console.log(debris_collection)

        //radar cross section identifier
        if (cross_section > 0) {
          /// for the radar_view
          if (cross_section == 1) {
            debri_collection_radar.add({
              id: satcat.getDebriName[debrisID],
              position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
              pixelSize: 3,
              color: Cesium.Color.DEEPSKYBLUE
              // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
            });
            rc_1 = rc_1 + 1;
          }

          if (cross_section == 2) {
            debri_collection_radar.add({
              id: satcat.getDebriName[debrisID],
              position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
              pixelSize: 5,
              color: Cesium.Color.GOLDENROD
              // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
            });
            rc_2 = rc_2 + 1;
          }

          if (cross_section == 3) {
            debri_collection_radar.add({
              id: satcat.getDebriName[debrisID],
              position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
              pixelSize: 7,
              color: Cesium.Color.HOTPINK
              // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
            });
            rc_3 = rc_3 + 1;
          }

        }

      }

      console.log(rc_1);
      console.log(rc_2);
      console.log(rc_3);



      document.getElementById("active_num").innerHTML = "Active Number: " + active_num;
      document.getElementById("inactive_num").innerHTML = "Inactive Number: " + inactive_num;


      var pie_chart = document.getElementById('pie_chart');
      var pieChart = echarts.init(pie_chart, 'dark');
      var option1;
      option1 = {
        title: {
          text: 'Statistic by country',
          left: 'center',
          textStyle: {
            fontSize: 15
          }
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b}: {c} ({d}%)'
        },
        series: [
          {
            name: 'Countries',
            type: 'pie',
            radius: '65%',
            data: [
              { value: usa, name: 'United States' },
              { value: china, name: 'China' },
              { value: russia, name: 'Russia' },
              { value: uk, name: 'United Kingdom' },
              { value: eu, name: 'European Union' },
              { value: others, name: 'Rest of the world' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
      };

      option1 && pieChart.setOption(option1);




      var chart1 = document.getElementById('chart_div');
      var myChart = echarts.init(chart1, 'dark');
      var option;


      option = {
        color: ['#008cff'],
        textStyle: [{
          color: "#f0f0f0",
          fontFamily: "Microsoft YaHei"

        }],
        grid: {
          left: '5%',
          bottom: '5%',
          containLabel: true
        },
        title: {
          left: 'center',
          text: ' Statistics of satellites by category',
          textStyle: {
            fontSize: 15
          }
        },
        tooltip: {},
        legend: {
          data: ['number']
        },
        xAxis: {
          data: ["LEO", "MEO", "GEO", "Unknown"]
        },
        yAxis: {},
        series: [{
          name: 'satellite number',
          type: 'bar',
          barWidth: '55%',
          data: [leo_num, meo_num, geo_num, unknowncat_num]
        }]
      };
      option && myChart.setOption(option);


      data_load = true;
      // clearInterval(timename); /// clear itself
    }
  }, 1000); /// allow sometime to load the Earth 


  viewer_main.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
  //这里调用update_debris_position方法
  viewer_main.scene.preRender.addEventListener(update_debris_position);
  ///viewer_main.scene.preRender.raiseEvent(debris_collection, viewer_main,mycatlog);


  //********给雷达viewer添加点 ********
  radar_viewer = new Cesium.Viewer('radar_viewer', options3D);
  // /// view in ECEF, no need to update icrf
  // radar_viewer.scene.postUpdate.addEventListener(icrf_radar); // enable Earth rotation, everything is seen to be in eci
  radar_viewer.scene.globe.enableLighting = true;

  radar_viewer.scene.primitives.add(debri_collection_radar);


  ///// disable the default event handlers
  radar_viewer.scene.screenSpaceCameraController.enableRotate = false;
  radar_viewer.scene.screenSpaceCameraController.enableTranslate = false;
  radar_viewer.scene.screenSpaceCameraController.enableZoom = false;
  radar_viewer.scene.screenSpaceCameraController.enableTilt = false;
  radar_viewer.scene.screenSpaceCameraController.enableLook = false;

  radar_viewer.scene.frameState.creditDisplay.removeDefaultCredit();


  var radar_position_ecef = new Cesium.Cartesian3(0, 0, 0);

  radar_position_ecef = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

  // // /// show the position of the telescope
  var redpoint = viewer_main.entities.add({
    id: "London",
    name: 'Telescope Point',
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    point: { pixelSize: 15, color: Cesium.Color.PINK }
  });


  radar_screen(radar_position_ecef);



}