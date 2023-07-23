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


let clickedObject = undefined; // Used in addOrbit()
let orbitEntity = undefined;
let infoBox, infoBoxViewModel;
let previousPick = null;
let showSelection = false;
let entries;
let radar_pick = null;







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
    //Cesium.Cartesian3.clone(point.position, position_ecef);
    ///compute the position of debris according to time
    if (Cesium.defined(icrfToFixed)) {

      var positionAndVelocity = mycatlog.compute_debri_position_eci(i, time_date_js);//  satellite.propagate(tle_rec,time_date);

      var position_eci = new Cesium.Cartesian3(positionAndVelocity.position.x * 1000, positionAndVelocity.position.y * 1000, positionAndVelocity.position.z * 1000);

      position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);
      Cesium.Cartesian3.clone(position_eci, pos_radar_view);


      //更新viewer_main中的点的位置
      // console.log(position_ecef)
      point.position = position_eci; //// update back

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
  var gui = new dat.GUI({ width: 350 });
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
      //debri_collection_radar.removeAll();

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


  //   /* var wyoming = viewer_main.entities.add({
  //       polygon : {
  //         hierarchy : Cesium.Cartesian3.fromDegreesArray([
  //                                   -109.080842,45.002073,
  //                                   -105.91517,45.002073,
  //                                   -104.058488,44.996596,
  //                                   -104.053011,43.002989,
  //                                   -104.053011,41.003906,
  //                                   -105.728954,40.998429,
  //                                   -107.919731,41.003906,
  //                                   -109.04798,40.998429,
  //                                   -111.047063,40.998429,
  //                                   -111.047063,42.000709,
  //                                   -111.047063,44.476286,
  //                                   -111.05254,45.002073]),
  //         height : 0,
  //         material : Cesium.Color.RED.withAlpha(0.5),
  //         outline : true,
  //         outlineColor : Cesium.Color.BLACK
  //       }
  //     });
  //    */

  radar_screen(radar_position_ecef);

}

function removePrevisouPick(input) {
  // 取消上一次点击的颜色修改和点大小修改效果
  if (previousPick !== null) {
    if (previousPick.id["Operation Status"] !== "Decayed" && previousPick.id["Operation Status"] !== "Non-operational" && previousPick.id["Operation Status"] !== "Unknown") {
      previousPick.color = Cesium.Color.GREEN;  // 恢复为默认颜色
      previousPick.pixelSize = 4;  // 恢复为默认大小
    }
    else {
      previousPick.color = Cesium.Color.RED;  // default color
      previousPick.pixelSize = 4;  // default size
    }
  }

  if (input == "radar" && radar_pick != null) {
    if (radar_pick.id["Operation Status"] !== "Decayed" && radar_pick.id["Operation Status"] !== "Non-operational" && radar_pick.id["Operation Status"] !== "Unknown") {
      radar_pick.outlineColor = Cesium.Color.BLACK;  // 恢复为默认颜色
      radar_pick.outlineWidth = 0.5;  // 恢复为默认大小
    }
    else {
      radar_pick.outlineColor = Cesium.Color.BLACK;  // 恢复为默认颜色
      radar_pick.outlineWidth = 0.5;  // 恢复为默认大小
    }
  }
}

function removeOrbitEntity() {
  // Ensure that no orbit displayed on the screen when user have already click on the space objects
  if (orbitEntity) {
    viewer_main.entities.removeById(orbitEntity.id);
    orbitEntity = undefined;
  }
}

function removeInfoBox() {
  if (infoBox) {
    console.log("infobox exist")
    infoBoxViewModel.showInfo = false; // Hide the info box
  }
}

function addOrbit(pick) {
  let orbitPosArray = [];
  var debris_set = debris_collection; //这里的debris_collection在下边的window.onload()中定义了
  // console.log(debris_set)
  var viewer = viewer_main; //这里的viewer_main也在下边的window.onload()中定义了
  console.log("add orbit")
  // for (let i = 0; i < ){

  clickedObject = pick
  if (clickedObject) {
    orbitPeriod = parseFloat(satcat.getDebriOrbitPeriod(clickedObject.id["COSPAR ID"])) * 60;
    // console.log(satcat.getDebriOrbitPeriod(clickedObject.id["COSPAR ID"]) + " " + orbitPeriod)
    let currentTime = viewer.clock.currentTime;
    let tai_utc = Cesium.JulianDate.computeTaiMinusUtc(currentTime);
    let startTime = Cesium.JulianDate.addSeconds(currentTime, tai_utc, new Cesium.JulianDate());
    let endTime = Cesium.JulianDate.addSeconds(startTime, orbitPeriod, new Cesium.JulianDate());
    let timeStep = orbitPeriod / 360; // divide orbit period into 360 parts to calculate the position
    let time = new Cesium.JulianDate();
    let points = debris_set._pointPrimitives;
    let clickIndex = undefined;

    for (let i = 0; i < points.length; ++i) {
      var point = points[i];
      // console.log(point)
      if (point.id["COSPAR ID"] == clickedObject.id["COSPAR ID"]) {
        clickIndex = i
      }
    }

    for (let i = 0; i < 361; i++) {
      time = Cesium.JulianDate.addSeconds(startTime, i * timeStep, time);
      let icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time);
      let time_date_js = Cesium.JulianDate.toDate(time); /// convert time into js Date()
      let position_ecef = new Cesium.Cartesian3();

      if (Cesium.defined(icrfToFixed)) {
        let positionAndVelocity = satcat.compute_debri_position_eci(clickIndex, time_date_js);//  satellite.propagate(tle_rec,time_date);

        var position_eci = new Cesium.Cartesian3(positionAndVelocity.position.x * 1000, positionAndVelocity.position.y * 1000, positionAndVelocity.position.z * 1000);

        position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef)

        orbitPosArray.push(position_eci)
      }

    }


    if (orbitEntity) {
      viewer_main.entities.removeById(orbitEntity.id);
      orbitEntity = undefined;
    }

    /* add orbit basedon operation status */
    if (clickedObject.id["Operation Status"] !== "Decayed"
      && clickedObject.id["Operation Status"] !== "Non-operational"
      && clickedObject.id["Operation Status"] !== "Unknown") {
      // create Polyline Entity
      orbitEntity = viewer_main.entities.add({
        id: "Orbit for" + " " + clickedObject.id["COSPAR ID"],
        polyline: {
          positions: orbitPosArray,
          width: 2,
          material: Cesium.Color.GREEN,
          loop: true
        },
      });
    } else {
      orbitEntity = viewer_main.entities.add({
        id: "Orbit for" + " " + clickedObject.id["COSPAR ID"],
        polyline: {
          positions: orbitPosArray,
          width: 2,
          material: Cesium.Color.RED,
          loop: true
        },
      })

    }
  }
} // end of addOrbit

function showLEO() {
  console.log("filter LEO")

  removeOrbitEntity();

  removeInfoBox();

  removePrevisouPick()

  let points = debris_collection._pointPrimitives;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    if (point.id["Orbit Type"] == "Low Earth Orbit") {
      point.show = true
    } else {
      point.show = false
    }
  }
}

function showMEO() {
  console.log("filter MEO")
  removeOrbitEntity();

  removeInfoBox();

  removePrevisouPick()

  let points = debris_collection._pointPrimitives;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    if (point.id["Orbit Type"] == "Middle Earth Orbit") {
      point.show = true
    } else {
      point.show = false
    }
  }
}

function showGEO() {
  console.log("filter GEO")
  removeOrbitEntity();

  removeInfoBox();

  removePrevisouPick()
  let points = debris_collection._pointPrimitives;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    if (point.id["Orbit Type"] == "Geosynchronous Equatorial Orbit") {
      point.show = true
    } else {
      point.show = false
    }
  }
}

function showHEO() {
  console.log("filter GEO")
  removeOrbitEntity();

  removeInfoBox();

  removePrevisouPick()
  let points = debris_collection._pointPrimitives;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    if (point.id["Orbit Type"] == "Highly Elliptical Orbit") {
      point.show = true
    } else {
      point.show = false
    }
  }
}

function showUnknown() {
  console.log("filter GEO")
  removeOrbitEntity();

  removeInfoBox();

  removePrevisouPick()
  let points = debris_collection._pointPrimitives;
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    if (point.id["Orbit Type"] == "Unknown") {
      point.show = true
    } else {
      point.show = false
    }
  }
}

function checkEnterKey(event) {

  if (event.keyCode === 13) {  // 13 is enter
    let input = document.getElementById("object-search").value;
    let points = debris_collection._pointPrimitives;

    removePrevisouPick();
    removeOrbitEntity();

    for (let i = 0; i < points.length; i++) {
      let point = points[i];
      if (input == point.id["COSPAR ID"]) {
        addOrbit(point);
        point.color = Cesium.Color.YELLOW
        point.pixelSize = 10
        point.show = true
        previousPick = point
        showSelection = true

        // add infobox for user input
        if (showSelection = true) {
          console.log(showSelection)
          infoBoxViewModel.showInfo = showSelection;
          infoBoxViewModel.titleText = "Selected Object";
          let tableItems = Object.entries(point.id).map(function ([key, value]) {
            return '<tr><td style="text-align:left; font-size: 15px; font-weight: bold;">' + key + ':' + '</td><td style="text-align:center; width: 250px;">' + value + '</td></tr>';
          });
          description = '<table style="width:100%">' + tableItems.join('') + '</table>';

          infoBoxViewModel.description = description;

          infoBoxViewModel.closeClicked.addEventListener(function () { // closeClicked function is an event, therefore need addEventListener to call the function
            infoBoxViewModel.showInfo = false; // Hide the info box when close button is clicked
          });
        }
        let userInput = document.getElementById("object-search")
        console.log(userInput)
        userInput.value = "";  // clear the input field
      }
    }
  }
}

function getSelectedOption() {
  removeInfoBox();
  removeOrbitEntity();
  removePrevisouPick();
  let selectionElement = document.getElementById("ownership-list")
  let selectionOption = selectionElement.options[selectionElement.selectedIndex].text;
  console.log(debris_collection)
  let points = debris_collection._pointPrimitives
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    point.pixelSize = 6 // Make the point looks larger since some owner only have few point to visualize
    if (selectionOption != point.id["Owner"]) {
      point.show = false;
    } else if (selectionOption == point.id["Owner"]) {
      point.show = true;
    }
  }

}

function showOwner(index) {
  removeInfoBox();
  removeOrbitEntity();
  removePrevisouPick();
  let points = debris_collection._pointPrimitives
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    point.pixelSize = 6 // Make the point looks larger since some owner only have few point to visualize
    if (entries[index][0] != point.id["Owner"]) {
      point.show = false;
    } else if (entries[index][0] == point.id["Owner"]) {
      point.show = true;
    }
  }
}

function clearFilter() {
  removeInfoBox();
  removeOrbitEntity();
  removePrevisouPick();
  let points = debris_collection._pointPrimitives
  for (let i = 0; i < points.length; i++) {
    let point = points[i];
    point.pixelSize = 4 // Make the point looks larger since some owner only have few point to visualize
    point.show = true;
  }

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
  viewer_main.clock.multiplier = 15;               // speed of the simulation

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



  // Inforbox
  var infoBoxContainer = document.createElement('div');
  infoBoxContainer.className = 'cesium-viewer-infoBoxContainer';
  viewer_main.container.appendChild(infoBoxContainer);
  infoBox = new Cesium.InfoBox(infoBoxContainer);
  infoBoxViewModel = infoBox.viewModel;


  //Click Event
  var handler = new Cesium.ScreenSpaceEventHandler(viewer_main.scene.canvas);

  handler.setInputAction(function (click) {
    var pick = viewer_main.scene.pick(click.position);
    let titleText = "Selected Object";
    let description = '';

    /*Only when data is loaded, pick and pick.id are defined and is primitive will call the following code */
    if (data_load && Cesium.defined(pick) && Cesium.defined(pick.id) && pick.primitive.constructor.name === 'f') {
      showSelection = true;
      let tableItems = Object.entries(pick.id).map(function ([key, value]) {
        return '<tr><td style="text-align:left; font-size: 15px; font-weight: bold;">' + key + ':' + '</td><td style="text-align:center; width: 250px;">' + value + '</td></tr>';
      });
      description = '<table style="width:100%">' + tableItems.join('') + '</table>';




      // 取消上一次点击的颜色修改和点大小修改效果
      removePrevisouPick("radar");

      // 保存当前选中的点为上一次点击的对象
      previousPick = pick.primitive;
      clickedObject = pick;

      pick.primitive.color = Cesium.Color.YELLOW
      pick.primitive.pixelSize = 10

      addOrbit(pick);
    }

    // set the infobox information
    infoBoxViewModel.showInfo = showSelection;
    infoBoxViewModel.titleText = titleText;
    infoBoxViewModel.description = description;

    infoBoxViewModel.closeClicked.addEventListener(function () { // closeClicked function is an event, therefore need addEventListener to call the function
      infoBoxViewModel.showInfo = false; // Hide the info box when close button is clicked
    });
  }, Cesium.ScreenSpaceEventType.LEFT_CLICK);





  /// a timer is used to deal with the async reading of JSON
  var timename = setInterval(function () {
    console.log('time_interval start')
    if (satcat.data_load_complete == true
      && data_load == false) {
      console.log('load complete, start counting')
      //ShowDebris(viewer_main,mycatlog,4);

      active_num = 0;
      inactive_num = 0;
      rc_1 = 0;
      rc_2 = 0;
      rc_3 = 0;
      let LEO_num = 0;
      let MEO_num = 0;
      let GEO_num = 0;
      let Unknown_num = 0;
      let ownershipList = {};


      for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) {


        var operation_status = satcat.getDebriOperation_status("isat", debrisID);
        var sat_category = satcat.getDebriCategory(debrisID);
        var cross_section = satcat.getDebriCross_Section(debrisID);
        var country = satcat.getDebriCountry(debrisID);
        let sat_infor = satcat.getDebriInfo(debrisID);
        let sat_name = satcat.getDebriName(debrisID).trim();
        let sat_Id = satcat.getDebriID(debrisID).trim();
        let sat_type = satcat.getDebriType(debrisID).trim();


        if (operation_status !== "Decayed" && operation_status !== "Non-operational" && operation_status !== "Unknown") {
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


        if (typeof orbitHTML !== 'undefined') {
          if (sat_category == 'Low Earth Orbit') {
            LEO_num += 1;
          } else if (sat_category == 'Middle Earth Orbit') {
            MEO_num += 1;
          } else if (sat_category == 'Geosynchronous Equatorial Orbit') {
            GEO_num += 1;
          } else if (sat_category == "Unknown") {
            Unknown_num += 1;
          }

          // Code to modify the percentage of the LEO, MEO and GEO in Orbit.html
          let rectLEO = document.getElementById("LEO_num");
          let rectMEO = document.getElementById("MEO_num");
          let rectGEO = document.getElementById("GEO_num");
          let LEO_percent = (LEO_num / satcat.getNumberTotal()) * 100
          let MEO_percent = (MEO_num / satcat.getNumberTotal()) * 100
          let GEO_percent = (GEO_num / satcat.getNumberTotal()) * 100
          let LEO_text = document.getElementById("LEO_text");
          let MEO_text = document.getElementById("MEO_text");
          let GEO_text = document.getElementById("GEO_text");
          document.getElementById("text_Unknown").innerHTML = "Number of unknown: " + Unknown_num + '<br>The occurrence of "Unknown" is primarily due to the inaccuracies and complexities of orbital prediction models (like SGP4) and the uncertain status of certain objects. These objects could be retired satellites or debris in a "Graveyard orbit", whose exact state and location may not be accurately tracked, resulting in their inability to be classified into LEO, MEO, GEO, or HEO categories.';


          rectLEO.setAttribute("width", LEO_percent + "%")
          rectMEO.setAttribute("width", MEO_percent + "%")
          rectGEO.setAttribute("width", GEO_percent + "%")
          LEO_text.textContent = LEO_num + " Objects" + "(" + LEO_percent.toFixed(1) + " %)";
          MEO_text.textContent = MEO_num + " Objects" + "(" + MEO_percent.toFixed(1) + " %)";
          GEO_text.textContent = GEO_num + " Objects" + "(" + GEO_percent.toFixed(1) + " %)";

        }


        debris_collection.add({
          name: 'point',
          id: {
            "COSPAR ID": sat_Id,
            "Name": sat_name, // .trim to remove the space after the string
            "Object Type": sat_type,
            "Orbit Type": sat_category,
            "Operation Status": operation_status,
            "Owner": country
          },
          position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
          pixelSize: 4,
          color: colour,
          scaleByDistance: new Cesium.NearFarScalar(2000, 4.0, 6.0E4, 0.8)
        });


        if (typeof ownerHTML !== 'undefined') {

          // 检查这个ID是否已经在ownershipList中
          if (country in ownershipList) {
            // 如果已经在列表中，增加其值
            ownershipList[country] += 1;
          } else {
            // 如果还不在列表中，将其值设为1
            ownershipList[country] = 1;
          }
        }


        //radar cross section identifier
        /// for the radar_view
        if (cross_section == "RCS <= 1") {
          debri_collection_radar.add({
            name: 'point',
            id: {
              "COSPAR ID": sat_Id,
              "Name": sat_name, // .trim to remove the space after the string
              "Object Type": sat_type,
              "Orbit Type": sat_category,
              "Operation Status": operation_status,
              "Owner": country,
              "Radar Cross Section(RCS/m^2)": cross_section,
            },
            position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
            pixelSize: 3,
            color: colour,
            outlineColor: Cesium.Color.BLACK,
            outerWidth: 0.5,
            // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
          });
          rc_1 = rc_1 + 1;
        }

        if (cross_section == "1 < RCS <= 10") {
          debri_collection_radar.add({
            name: 'point',
            id: {
              "COSPAR ID": sat_Id,
              "Name": sat_name, // .trim to remove the space after the string
              "Object Type": sat_type,
              "Orbit Type": sat_category,
              "Operation Status": operation_status,
              "Owner": country,
              "Radar Cross Section(RCS/m^2)": cross_section,
            },
            position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
            pixelSize: 6,
            color: colour,
            outlineColor: Cesium.Color.BLACK,
            outerWidth: 0.5,
            // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
          });
          rc_2 = rc_2 + 1;
        }

        if (cross_section == "RCS > 10") {
          debri_collection_radar.add({
            name: 'point',
            id: {
              "COSPAR ID": sat_Id,
              "Name": sat_name, // .trim to remove the space after the string
              "Object Type": sat_type,
              "Orbit Type": sat_category,
              "Operation Status": operation_status,
              "Owner": country,
              "Radar Cross Section(RCS/m^2)": cross_section,
            },
            position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
            pixelSize: 9,
            color: colour,
            outlineColor: Cesium.Color.BLACK,
            outerWidth: 0.5,

            // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
          });
          rc_3 = rc_3 + 1;

        }
      } // end of for loop


      // add dynamic list to the search bar in space_debris.html
      if (typeof mainPage !== "undefined") {
        let objectList = document.getElementById("object-list");
        let points = debris_collection._pointPrimitives;
        for (let i = 0; i < points.length; i++) {
          let point = points[i];
          let option = document.createElement("option");
          option.innerHTML = point.id["COSPAR ID"];
          objectList.appendChild(option);
        }

        // Get the <i> element (Font Awesome icon) and add a click event listener
        const dropdownIcon = document.querySelector(".custom-dropdown-icon i");
        dropdownIcon.addEventListener("click", function(){console.log("Hide the datalist")});
      }

      if (typeof ownerHTML !== 'undefined') {
        console.log(ownershipList)

        entries = Object.entries(ownershipList);
        entries.sort((a, b) => b[1] - a[1]);

        console.log(entries)

        let rectOwner1 = document.getElementById("owner1_num");
        let rectOwner2 = document.getElementById("owner2_num");
        let rectOwner3 = document.getElementById("owner3_num");
        let rectOwner4 = document.getElementById("owner4_num");
        let rectOwner5 = document.getElementById("owner5_num");
        let rectOwner6 = document.getElementById("owner6_num");
        let rectOwner7 = document.getElementById("owner7_num");
        let rectOwner8 = document.getElementById("owner8_num");
        let rectOwner9 = document.getElementById("owner9_num");
        let rectOwner10 = document.getElementById("owner10_num");
        let titleOwner1 = document.getElementById("owner1");
        let titleOwner2 = document.getElementById("owner2");
        let titleOwner3 = document.getElementById("owner3");
        let titleOwner4 = document.getElementById("owner4");
        let titleOwner5 = document.getElementById("owner5");
        let titleOwner6 = document.getElementById("owner6");
        let titleOwner7 = document.getElementById("owner7");
        let titleOwner8 = document.getElementById("owner8");
        let titleOwner9 = document.getElementById("owner9");
        let titleOwner10 = document.getElementById("owner10");

        titleOwner1.innerHTML = "1." + entries[0][0];
        titleOwner2.innerHTML = "2." + entries[1][0];
        titleOwner3.innerHTML = "3." + entries[2][0];
        titleOwner4.innerHTML = "4." + entries[3][0];
        titleOwner5.innerHTML = "5." + entries[4][0];
        titleOwner6.innerHTML = "6." + entries[5][0];
        titleOwner7.innerHTML = "7." + entries[6][0];
        titleOwner8.innerHTML = "8." + entries[7][0];
        titleOwner9.innerHTML = "9." + entries[8][0];
        titleOwner10.innerHTML = "10." + entries[9][0];

        let owner1Percent = (entries[0][1] / satcat.getNumberTotal()) * 100;
        let owner2Percent = (entries[1][1] / satcat.getNumberTotal()) * 100;
        let owner3Percent = (entries[2][1] / satcat.getNumberTotal()) * 100;
        let owner4Percent = (entries[3][1] / satcat.getNumberTotal()) * 100;
        let owner5Percent = (entries[4][1] / satcat.getNumberTotal()) * 100;
        let owner6Percent = (entries[5][1] / satcat.getNumberTotal()) * 100;
        let owner7Percent = (entries[6][1] / satcat.getNumberTotal()) * 100;
        let owner8Percent = (entries[7][1] / satcat.getNumberTotal()) * 100;
        let owner9Percent = (entries[8][1] / satcat.getNumberTotal()) * 100;
        let owner10Percent = (entries[9][1] / satcat.getNumberTotal()) * 100;

        rectOwner1.setAttribute("width", owner1Percent + "%")
        rectOwner2.setAttribute("width", owner2Percent + "%")
        rectOwner3.setAttribute("width", owner3Percent + "%")
        rectOwner4.setAttribute("width", owner4Percent + "%")
        rectOwner5.setAttribute("width", owner5Percent + "%")
        rectOwner6.setAttribute("width", owner6Percent + "%")
        rectOwner7.setAttribute("width", owner7Percent + "%")
        rectOwner8.setAttribute("width", owner8Percent + "%")
        rectOwner9.setAttribute("width", owner9Percent + "%")
        rectOwner10.setAttribute("width", owner10Percent + "%")

        owner1_text.textContent = entries[0][1] + " Objects" + " (" + owner1Percent.toFixed(2) + " %)";
        owner2_text.textContent = entries[1][1] + " Objects" + " (" + owner2Percent.toFixed(2) + " %)";
        owner3_text.textContent = entries[2][1] + " Objects" + " (" + owner3Percent.toFixed(2) + " %)";
        owner4_text.textContent = entries[3][1] + " Objects" + " (" + owner4Percent.toFixed(2) + " %)";
        owner5_text.textContent = entries[4][1] + " Objects" + " (" + owner5Percent.toFixed(2) + " %)";
        owner6_text.textContent = entries[5][1] + " Objects" + " (" + owner6Percent.toFixed(2) + " %)";
        owner7_text.textContent = entries[6][1] + " Objects" + " (" + owner7Percent.toFixed(2) + " %)";
        owner8_text.textContent = entries[7][1] + " Objects" + " (" + owner8Percent.toFixed(2) + " %)";
        owner9_text.textContent = entries[8][1] + " Objects" + " (" + owner9Percent.toFixed(2) + " %)";
        owner10_text.textContent = entries[9][1] + " Objects" + " (" + owner10Percent.toFixed(2) + " %)";




        // 获取ownershipList所有的键并进行排序
        let keys = Object.keys(ownershipList).sort();

        let ownership = document.getElementById('ownership-list')
        for (let i = 0; i < keys.length; i++) {

          let key = keys[i];
          let option = document.createElement("option");
          option.value = ownershipList[key]; // 这里使用键从对象中获取到值
          option.text = key;
          ownership.appendChild(option);
        }
      }

      if (typeof radarHTML !== 'undefined') {
        radar_viewer.scene.primitives.add(debri_collection_radar);

        var handler2 = new Cesium.ScreenSpaceEventHandler(radar_viewer.scene.canvas);

        handler2.setInputAction(function (click) {
          var pick2 = radar_viewer.scene.pick(click.position);
          let titleText2 = "Selected Object(Radar)";
          let description2 = '';

          /*Only when data is loaded, pick and pick.id are defined and is primitive will call the following code */
          if (data_load && Cesium.defined(pick2) && Cesium.defined(pick2.id) && pick2.primitive.constructor.name === 'f') {
            showSelection = true;
            console.log("radar click")
            let tableItems = Object.entries(pick2.id).map(function ([key, value]) {
              return '<tr><td style="text-align:left; font-size: 15px; font-weight: bold;">' + key + ':' + '</td><td style="text-align:center; width: 250px;">' + value + '</td></tr>';
            });
            description2 = '<table style="width:100%">' + tableItems.join('') + '</table>';

            removePrevisouPick("radar");
            radar_pick = pick2.primitive;
            let points = debris_collection._pointPrimitives;
            let points_radar = debri_collection_radar._pointPrimitives;
            for (let i = 0; i < points.length; i++) {
              let point = points[i];
              let point_radar = points_radar[i]
              if (point.id["COSPAR ID"] == radar_pick.id["COSPAR ID"]) {
                previousPick = point
                point.color = Cesium.Color.YELLOW;
                point.pixelSize = 10;
                addOrbit(point)
              }

              if (point_radar.id["COSPAR ID"] == radar_pick.id["COSPAR ID"]) {
                point_radar.outlineColor = Cesium.Color.WHITE
                point_radar.outlineWidth = 1.5
              }
            }

          }

          // set the infobox information
          infoBoxViewModel.showInfo = showSelection;
          infoBoxViewModel.titleText = titleText2;
          infoBoxViewModel.description = description2;

          infoBoxViewModel.closeClicked.addEventListener(function () { // closeClicked function is an event, therefore need addEventListener to call the function
            infoBoxViewModel.showInfo = false; // Hide the info box when close button is clicked
          });
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

      }


      console.log(rc_1);
      console.log(rc_2);
      console.log(rc_3);


      document.getElementById("active_num").innerHTML = "Active Number: " + active_num;
      document.getElementById("inactive_num").innerHTML = "Inactive Number: " + inactive_num;

      data_load = true;
      // // clearInterval(timename); /// clear itself
    }
  }, 1000); /// allow sometime to load the Earth 


  viewer_main.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
  //这里调用update_debris_position方法
  viewer_main.scene.preRender.addEventListener(update_debris_position);
  ///viewer_main.scene.preRender.raiseEvent(debris_collection, viewer_main,mycatlog);



  //********给雷达viewer添加点 ********
  if (typeof radarHTML != "undefined") {
    radar_viewer = new Cesium.Viewer('radar_viewer', options3D);
    // /// view in ECEF, no need to update icrf
    // radar_viewer.scene.postUpdate.addEventListener(icrf_radar); // enable Earth rotation, everything is seen to be in eci
    radar_viewer.scene.globe.enableLighting = true;

    ///// disable the default event handlers
    radar_viewer.scene.screenSpaceCameraController.enableRotate = false;
    radar_viewer.scene.screenSpaceCameraController.enableTranslate = false;
    radar_viewer.scene.screenSpaceCameraController.enableZoom = false;
    radar_viewer.scene.screenSpaceCameraController.enableTilt = false;
    radar_viewer.scene.screenSpaceCameraController.enableLook = false;

    radar_viewer.scene.frameState.creditDisplay.removeDefaultCredit();


    var radar_position_ecef = new Cesium.Cartesian3(0, 0, 0);

    radar_position_ecef = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

    // /// show the position of the telescope
    var redpoint = viewer_main.entities.add({
      id: "London",
      name: 'Telescope Point',
      position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
      point: { pixelSize: 15, color: Cesium.Color.PINK }
    });

    radar_screen(radar_position_ecef);
  }

}