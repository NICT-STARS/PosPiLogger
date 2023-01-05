/******************************************************************************/
/* Raspberry Pi PosPiLogger Web                                               */
/* Copyright 2022 National Institute of Information and Communication Technology (NICT)  */
/******************************************************************************/
/******************************************************************************/
/* Environment                                                                */
/******************************************************************************/
var $Env =
{
  showLogConsole : true,
  server         :
  {
    webSocket     : { url : location.protocol + "//" + location.host + "/ui", options : { path : location.pathname + "socket.io" } },
    jsonUrl       : "data",
    downloadLimit : 10000,
  },
  cesium :
  {
    viewer            : null,
    handler           : null,
    selectTimes       : [],
    selectTimesFormat : "%start ~ %end ( %countth day of the %selectth )",
    shuttleRingAngle  : [0.0, 15.0, 19.8, 22.5, 24.4, 25.9, 27.1, 28.2, 29.1, 29.85, 30.6],
    imageryProvider   :
    {
      map      : { label : "map (standard)"   , value : { url : "https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png" , maximumLevel : 18, } },
      map_pare : { label : "map (Light color)", value : { url : "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png", maximumLevel : 18, } },
      picture  : { label : "picture"          , value : { url : "https://cyberjapandata.gsi.go.jp/xyz/ort/{z}/{x}/{y}.jpg" , maximumLevel : 18, } }
    },
    camera :
    {
      position  : { longitude : 137.6850225, latitude : 38.258595, height : 3800000, heading : 0, pitch : -1.57, roll : 0 },
      enableFly : false,
      autoHead  : false
    },
    entity :
    {
      mode :
      {
        list :
        {
          all     : { label : "Trajectory", show : true  },
          nowOnly : { label : "Latest"    , show : false }
        },
        choice : "all"
      },
      label       : { font : "18px Arial", style : "FILL", verticalOrigin : "BOTTOM" },
      description : "table                     { font-size :14px; }"
                  + "tr               th       { text-align:left; }"
                  + "tr               td       { text-align:right; }"
                  + ".description_lat td:after { content:'\\0020\\00b0'; }"
                  + ".description_lng td:after { content:'\\0020\\00b0'; }"
                  + ".description_dir td:after { content:'\\0020\\00b0'; }"
                  + ".description_alt td:after { content:' m'; }"
                  + ".description_hei td:after { content:' m'; }"
                  + ".description_vel td:after { content:' m/s'; }",
      device :
      {
        data         : {},
        size         : { default : 6, current : 12 },
        outlineWidth : 8,
        color        :
        {
          default : { red :   0, green : 255, blue :   0, alpha : 255 },
          current : { red : 255, green :   0, blue :   0, alpha : 255 }
        }
      }
    }
  }
};
