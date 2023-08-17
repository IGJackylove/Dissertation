// author: Zhen Li
// email: hpulizhen@163.com

// Grant CesiumJS access to your ion assets

// Z. Li's Cesium ion access token
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmJiODMwMi1mODRiLTQ2YTEtODMzZC0zYTVlY2Q5YmQxMjMiLCJpZCI6OTkxMSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NTI4Mzg1NH0.gvjcqfwCYVBcmZ11Jzr-k5Q13QXZ6qGVer9WSXOs9K8';
// Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNmJiODMwMi1mODRiLTQ2YTEtODMzZC0zYTVlY2Q5YmQxMjMiLCJpZCI6OTkxMSwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NTI4Mzg1NH0.gvjcqfwCYVBcmZ11Jzr-k5Q13QXZ6qGVer9WSXOs9K8';

// S. Bhattarai's Cesium ion access token
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjMzVhMjQ1MS1iZjIxLTQxNTctODA2Yi1mOTJmNDkwYzU2MWUiLCJpZCI6OTczMiwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1NDgxNDUzN30.5gySU1UpdweOzztxyf6KbIqYc-hR_yfgo5aEGLgGPDc';

var viewer_main, radar_viewer;
var start_jd;

var clockViewModel; /// the clockmodel for synchronisation of two views
var data_load=false;
var debris_collection;
var debri_collection_radar; /// it is the same as debris_collection

var satcat;
var data_path="data/"; //set file directory


var options3D = {
  homeButton : false,
  fullscreenButton : false,
  sceneModePicker : false,
  clockViewModel : clockViewModel,
  infoBox : false,
  geocoder : false,
  sceneMode : Cesium.SceneMode.SCENE3D,
  navigationHelpButton : false,
  animation : false,
  CreditDisplay : false,
  timeline: false,
  baseLayerPicker : false
};

var options2D = {
  homeButton : false,
  fullscreenButton : false,
  sceneModePicker : true,
  clockViewModel : clockViewModel,
  infoBox : true,
  geocoder : false,
  sceneMode : Cesium.SceneMode.SCENE2D,
  navigationHelpButton : false,
  animation : false,
  CreditDisplay : false,
  timeline: false,
  baseLayerPicker : false
};


function icrf_view_main(scene, time) 
{
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
      var transform = Cesium.Matrix4.fromRotationTranslation(icrfToFixed);  //Computes a Matrix4 instance from a Matrix3 representing the rotation and a Cartesian3 representing the translation.
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



function xyz2enu_matrix(lat,lon)
{
    var E = new Array(9);
    var sinp=Math.sin(lat),cosp=Math.cos(lat),sinl=Math.sin(lon),cosl=Math.cos(lon);
    E[0]=-sinl;      E[1]=cosl;       E[2]=0.0;
    E[3]=-sinp*cosl; E[4]=-sinp*sinl; E[5]=cosp;
    E[6]=cosp*cosl;  E[7]=cosp*sinl;  E[8]=sinp;
    return E;
}
/** simulate the radar screen*/
// There is a problem with the radar view that only view the right side of the point!
function radar_screen(radar_position_ecef)
{

  // var blh = ecef2blh(radar_position_ecef.x,radar_position_ecef.y,radar_position_ecef.z );
  // var ecef_enu = xyz2enu_matrix(blh[0],blh[1]);

  /// set the position of the radar
  radar_viewer.camera.position = radar_position_ecef;// new Cesium.Cartesian3(radar_position_ecef.x,radar_position_ecef.y,radar_position_ecef.z);
  
  var ellipsoid_wgs84 = Cesium.Ellipsoid.WGS84;
  var normal_ecef = ellipsoid_wgs84.geodeticSurfaceNormal(radar_position_ecef);


  // /// camera_target in NEU
  var length = 1.0;
  var ele = 60/180.0*Cesium.Math.PI; //elevation
  var azi = 90/180.0*Cesium.Math.PI; //azimuth 方位角
  var E = length*Math.cos(ele)*Math.sin(azi);
  var N = length*Math.cos(ele)*Math.cos(azi);
  var U = length*Math.sin(ele);
  
  //创建一个ENU坐标的Cartesian3点
  var camera_target_enu = new Cesium.Cartesian3(E, N, U);
  
  //先建立一个空的笛卡尔点，下边两行赋值  object目标点坐标？
  var camera_target_ecef = new Cesium.Cartesian3(); 
  // /// set the radar direction, azimuth and elevation
  
  //创建一个4*4矩阵 Matrix4，eastNorthUpToFixedFrame(radar_position_ecef)这个方法中括号内的变量是ENU体系的中心点即radar的位置
  var transform_enu2ecef = Cesium.Transforms.eastNorthUpToFixedFrame(radar_position_ecef);
  
  //给空的笛卡尔点赋值，用multiplyByPointAsVector()方法
  camera_target_ecef = Cesium.Matrix4.multiplyByPointAsVector(transform_enu2ecef,camera_target_enu,camera_target_ecef);
  
  //var transform_enu2ecef = new Cesium.Matrix3();
  //Cesium.Matrix3.fromColumnMajorArray(ecef_enu, transform_enu2ecef);
  //camera_target_ecef = Cesium.Matrix3.multiplyByVector(transform_enu2ecef,camera_target_enu,camera_target_ecef);

  
  //----------------》看到这里
  /// how to define the Up of image plane

  //归一化处理
  camera_target_ecef = Cesium.Cartesian3.normalize(camera_target_ecef, camera_target_ecef);
  //给雷达方向赋值
  radar_viewer.camera.direction = camera_target_ecef;
  var normal_tmp = new Cesium.Cartesian3();
  var camera_up = new Cesium.Cartesian3();
  //计算外积
  normal_tmp = Cesium.Cartesian3.cross(normal_ecef,camera_target_ecef,normal_tmp);
  camera_up  = Cesium.Cartesian3.cross(camera_target_ecef,normal_tmp,camera_up);
  radar_viewer.camera.up = camera_up;

  radar_viewer.camera.frustum.fov = 60/180 * Cesium.Math.PI; /// field of view
  radar_viewer.camera.frustum.near = 0.1;
  radar_viewer.camera.frustum.far = 20000000.0;
  radar_viewer.camera.frustum.aspectRatio = radar_viewer.scene.canvas.clientWidth/radar_viewer.scene.canvas.clientHeight;

  
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
//太空中的碎片目标位置更新功能
function update_debris_position()
{
    //定义碎片序列
    var debris_set = debris_collection;
    //定义视窗
    var viewer = viewer_main;
    //定义卫星目录
    var mycatlog = satcat;

    //创建current的computer显示的TAI的time
    time = viewer.clock.currentTime; /// the current computer time in TAI? not in UTC?
    //计算提供的实例超前 UTC 的秒数。
    var tai_utc = Cesium.JulianDate.computeTaiMinusUtc(time); /// Time is in localtime ???
    //创建一个代表当前系统时间的新实例。
    var time_utc = Cesium.JulianDate.now();
    //将提供的超前的秒数tai_utc添加或减去到time这个变量赋值给上一行创建的的代表更新时间点实例time_utc。
    Cesium.JulianDate.addSeconds(time, tai_utc, time_utc);

    // var t1_now = Cesium.JulianDate.now();
    // var t2_now = Date.now();

    //计算旋转矩阵以在给定时间将点或矢量从国际天体参考系 (GCRF/ICRF) 惯性坐标系轴转换为地球固定坐标系轴 (ITRF)。
    //This function may return undefined if the data necessary to do the transformation is not yet loaded.
    var icrfToFixed = Cesium.Transforms.computeIcrfToFixedMatrix(time_utc);
    //计算从提供的实例创建一个 JavaScript 日期。如果提供的 JulianDate 处于闰秒期间，则使用前一秒。
    var time_date_js = Cesium.JulianDate.toDate(time_utc); /// convert time into js Date()
    
    
    var position_ecef = new Cesium.Cartesian3();
    var points = debris_set._pointPrimitives;
    var length = points.length;

    // if (length > 0)
    // {
    //   console.log("point number in debris_set._pointPrimitives is loaded!");
    // }

    var pos_radar_view = new Cesium.Cartesian3();

    for (var i = 0; i < length; ++i) 
    {
      var point = points[i];
      //Cesium.Cartesian3.clone(point.position, position_ecef);
      ///compute the position of debris according to time
      if (Cesium.defined(icrfToFixed)) 
      {
        
        //在Catalogue.js中调用compute_debri_position_eci()功能以计算eci坐标的debris的位置
        var positionAndVelocity = mycatlog.compute_debri_position_eci(i, time_date_js);//  satellite.propagate(tle_rec,time_date);
        
        var position_eci = new Cesium.Cartesian3(positionAndVelocity.position.x*1000,positionAndVelocity.position.y*1000,positionAndVelocity.position.z*1000);
        
        //利用icrfToFixed旋转矩阵将eci形式的位置转换为ecef形式的位置
        position_ecef = Cesium.Matrix3.multiplyByVector(icrfToFixed, position_eci, position_ecef);
        
        Cesium.Cartesian3.clone(position_ecef,pos_radar_view);

        //把debris的ecef坐标赋值给point，相当于update back
        point.position = position_ecef; //// update back
        
        ///update the radar_view
        debri_collection_radar._pointPrimitives[i].position = pos_radar_view;

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
    tle_1: "tle_test",
    tle_2: "tle_geo"  /// geo_tle.json	
}

function GUIset() {
    //利用dat.GUI 建立gui reference：dat.gui.min.js
    var gui = new dat.GUI({ width: 300 });
    // gui.domElement.id = 'datgui';

    //Creates a new subfolder GUI instance.
    var folderSpacecraft = gui.addFolder('Catalogue option bar');
    var aaa = { catalogName: "" }; ///cataloglist.cat_1
    folderSpacecraft.add(aaa, 'catalogName', Object.values(cataloglist)).onChange(
        //onChange(function()) Specify that a function fire every time someone changes the value with this Controller.
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


window.onload = function()
{
  
  satcat = new Catalogue();

  GUIset();

  clockViewModel = new Cesium.ClockViewModel();

  viewer_main = new Cesium.Viewer('main_viewer',{
      imageryProvider : Cesium.createTileMapServiceImageryProvider({
        url : Cesium.buildModuleUrl('../Cesium/Assets/Textures/NaturalEarthII')
    }),
    baseLayerPicker : false,
    geocoder : false,
    timeline: true,
    clockViewModel : clockViewModel
    });

    
    //Enable depth testing so things behind the terrain disappear.
    viewer_main.scene.globe.depthTestAgainstTerrain = true;

		
		viewer_main.globe = true;
		viewer_main.scene.globe.enableLighting = true;
    viewer_main.clock.multiplier =  100 ;               // speed of the simulation
    
    var mycredit= new Cesium.Credit("Space Geodesy and Navigation Laboratory",'data/sgnl.png','https://www.ucl.ac.uk');
    // var mycredit = new Cesium.Credit('Cesium', 'data/sgnl.png', 'https://www.ucl.ac.uk');
    viewer_main.scene.frameState.creditDisplay.addDefaultCredit(mycredit);
    viewer_main.CreditDisplay = true;
    viewer_main.scene.debugShowFramesPerSecond = true;
    viewer_main.scene.frameState.creditDisplay.removeDefaultCredit();

    start_jd = Cesium.JulianDate.now();
    //start_jd = Cesium.JulianDate.fromIso8601("2019-01-01T13:00:00Z");
    viewer_main.clock.startTime = Cesium.JulianDate.now(); ///It is in system loal time
    viewer_main.clock.clockRange = Cesium.ClockRange.UNBOUNDED;
    viewer_main.timeline.zoomTo(start_jd, Cesium.JulianDate.addSeconds(start_jd, 86400, new Cesium.JulianDate()));

    

  
    // var satcat_log = "data/catalogue/fspcat_20230101.json";
    // var tle_log = "data/tle/geo_tle.json";

    // satcat.loadcatlog("kep",satcat_log);
    // satcat.loadcatlog("tle",tle_log);
    
    /// debris_collection to store all the debris points
    debris_collection = new Cesium.PointPrimitiveCollection();
    debri_collection_radar = new Cesium.PointPrimitiveCollection();
    //By seting the blendOption to OPAQUE can improve the performance twice
    debri_collection_radar.blendOption = Cesium.BlendOption.OPAQUE;

    /// add debris_collection to the viewer_main
    /// should organize debris in different orbtis to different collections
    debris_collection = viewer_main.scene.primitives.add(debris_collection);
    debris_collection.blendOption=Cesium.BlendOption.OPAQUE;

    var colour = Cesium.Color.YELLOW;
    
    /// a timer is used to deal with the async reading of JSON
    var timename=setInterval(function(){
      if(satcat.data_load_complete == true
        && data_load == false)
        {
          //ShowDebris(viewer_main,mycatlog,4);
          for (var debrisID = 0; debrisID < satcat.getNumberTotal(); debrisID++) 
          {

            var operation_status = satcat.getDebriOperation_status(debrisID);
            if (operation_status > 0.0) 
            {
              colour = Cesium.Color.YELLOW;
            }
            else
            {
              colour = Cesium.Color.RED;
            }

            debris_collection.add({
            id: satcat.getDebriName[debrisID],
            position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
            pixelSize: 3,
            color: colour
            // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
              });

              /// for the radar_view
//********问题：如何在这里控制根据不同种类轨道的卫星显示不同颜色的点如geo，meo？********
              debri_collection_radar.add({
                id: satcat.getDebriName[debrisID],
                position: Cesium.Cartesian3.fromDegrees(0.0, 0.0),
                pixelSize: 4,
                color: Cesium.Color.BLUE
                // scaleByDistance : new Cesium.NearFarScalar(100.0, 4.0, 6.0E4, 0.8)
                  });     

          }

          data_load=true;
          // clearInterval(timename); /// clear itself
        }
    },1000); /// allow sometime to load the Earth 

  
    viewer_main.scene.postUpdate.addEventListener(icrf_view_main); // enable Earth rotation, everything is seen to be in eci
    viewer_main.scene.preRender.addEventListener(update_debris_position);
    ///viewer_main.scene.preRender.raiseEvent(debris_collection, viewer_main,mycatlog);

    
    
  radar_viewer = new Cesium.Viewer('radar_viewer',options3D);
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

  //定义地球上显示的telescope点的位置
  var radar_position_ecef =  new Cesium.Cartesian3(0,0,0);
//**************问题：如何实时更新input的值 ***************/
  var longitude = 81;
  var latitude  = 61;
  var height = 10.0;
  radar_position_ecef = Cesium.Cartesian3.fromDegrees(longitude, latitude, height);

  // // /// show the position of the telescope
  var redpoint = viewer_main.entities.add({
    name : 'Red point telescope',
    position: Cesium.Cartesian3.fromDegrees(longitude, latitude, height),
    point: {pixelSize : 12,color :  Cesium.Color.RED}
    });
  
  radar_screen(radar_position_ecef);


}
