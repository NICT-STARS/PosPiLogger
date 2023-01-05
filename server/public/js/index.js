$(function() {
/******************************************************************************/
/* Raspberry Pi PosPiLogger Web                                               */
/* Copyright 2022 National Institute of Information and Communication Technology (NICT)  */
/******************************************************************************/
/******************************************************************************/
/* cesium add entity event                                                    */
/******************************************************************************/
$("#cesiumContainer").nictCesium($Env,
{
  addEntityEvent : function(pEnv, pJson)
  {
/*-----* check json *---------------------------------------------------------*/
    if (!$.nictCesium.isJson(pJson)       ) return null;
    if (typeof pJson.GNSS      != "object") return null;
    if (typeof pJson.GNSS.lng  != "string") return null;
    if (typeof pJson.GNSS.lat  != "string") return null;
    if (typeof pJson.GNSS.alt  != "string") return null;
    if (typeof pJson.GNSS.time != "string") return null;
/*-----* variable *-----------------------------------------------------------*/
    var intLng       = parseFloat(pJson.GNSS.lng );
    var intLat       = parseFloat(pJson.GNSS.lat );
    var intAlt       = parseFloat(pJson.GNSS.alt );
    var objStartDate = new Date  (pJson.GNSS.time);

    if (isNaN(intLat) || isNaN(intLng) || isNaN(intAlt) || isNaN(objStartDate.getTime())) return null;

    var objEndDate   = new Date(pEnv.cesium.selectTimes[pEnv.cesium.selectTimes.length - 1].getTime()); objEndDate.setHours(23, 59, 59);
    var strDevice    = typeof pJson.device == "string" ? pJson.device : "undefined";
    var $description = $("<div><style>" + pEnv.cesium.entity.description + "</style><table><tbody></tbody></table></div>");
    var objEntity    = { label : {} };
/*-----* description *--------------------------------------------------------*/
    $description.find("tbody").append("<tr class='description_device'    ><th>Device    </th><td>" + strDevice      + "</td></tr>");
    $description.find("tbody").append("<tr class='description_time'      ><th>Time      </th><td>" + $.nictCesium.formatDate(objStartDate, "%y/%mm/%dd %H:%M:%S") + "</td></tr>");
    $description.find("tbody").append("<tr class='description_lat'       ><th>Latitude  </th><td>" + pJson.GNSS.lat + "</td></tr>");
    $description.find("tbody").append("<tr class='description_lng'       ><th>Longitude </th><td>" + pJson.GNSS.lng + "</td></tr>");
    $description.find("tbody").append("<tr class='description_alt'       ><th>Altitude  </th><td>" + pJson.GNSS.alt + "</td></tr>");
    $description.find("tbody").append("<tr class='description_hei'       ><th>Height    </th><td>" + pJson.GNSS.hei + "</td></tr>");
    $description.find("tbody").append("<tr class='description_sat'       ><th>Satellite </th><td>" + pJson.GNSS.sat + "</td></tr>");
    $description.find("tbody").append("<tr class='description_vel'       ><th>Velocity  </th><td>" + pJson.GNSS.vel + "</td></tr>");
    $description.find("tbody").append("<tr class='description_dir'       ><th>Direction </th><td>" + pJson.GNSS.dir + "</td></tr>");
/*-----* set value *----------------------------------------------------------*/
    objEntity.name                 = "device:" + strDevice + "  time:" + $.nictCesium.formatDate(objStartDate, "%y/%mm/%dd %H:%M:%S");
    objEntity.description          = $description.html();
    objEntity.position             = Cesium.Cartesian3.fromDegrees(intLng, intLat, intAlt);
    objEntity.availability         = new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({ start : Cesium.JulianDate.fromDate(objStartDate), stop : Cesium.JulianDate.fromDate(objEndDate) })]);
    objEntity.show                 = pEnv.cesium.entity.mode.list[pEnv.cesium.entity.mode.choice].show;
    objEntity.properties           = { device : strDevice, direction : parseFloat(pJson.GNSS.dir) };
    objEntity.label.text           = objEntity.name;
    objEntity.label.fillColor      = Cesium.Color.fromBytes(pEnv.cesium.entity.device.color.default.red, pEnv.cesium.entity.device.color.default.green, pEnv.cesium.entity.device.color.default.blue, pEnv.cesium.entity.device.color.default.alpha);
    objEntity.label.font           =                        pEnv.cesium.entity.label.font;
    objEntity.label.style          = Cesium.LabelStyle     [pEnv.cesium.entity.label.style];
    objEntity.label.verticalOrigin = Cesium.VerticalOrigin [pEnv.cesium.entity.label.verticalOrigin];
    objEntity.label.pixelOffset    = new Cesium.Cartesian2 (0, (pEnv.cesium.entity.device.size.current / 2 + pEnv.cesium.entity.device.outlineWidth) * -1);
    objEntity.label.show           = false;
    objEntity.point                = { pixelSize : pEnv.cesium.entity.device.size.default, color : objEntity.label.fillColor, outlineColor : Cesium.Color.fromAlpha(objEntity.label.fillColor, 0.31) };

    return objEntity;
  },
/******************************************************************************/
/* cesium change time event                                                   */
/******************************************************************************/
  changeTimeEvent :
  {
    setEntityProperty : function(pEnv, pEntity, objCurrentEntity)
    {
      var objColor;

      objColor = Cesium.Color.fromBytes(pEnv.cesium.entity.device.color.default.red, pEnv.cesium.entity.device.color.default.green, pEnv.cesium.entity.device.color.default.blue, pEnv.cesium.entity.device.color.default.alpha);

      pEntity.show               = pEnv.cesium.entity.mode.list[pEnv.cesium.entity.mode.choice].show;
      pEntity.point.pixelSize    = pEnv.cesium.entity.device.size.default;
      pEntity.point.outlineWidth = 0;
      pEntity.point.color        = objColor;
      pEntity.point.outlineColor = Cesium.Color.fromAlpha(objColor, 0.31);
      pEntity.label.fillColor    = objColor;

      objColor = Cesium.Color.fromBytes(pEnv.cesium.entity.device.color.current.red, pEnv.cesium.entity.device.color.current.green, pEnv.cesium.entity.device.color.current.blue, pEnv.cesium.entity.device.color.current.alpha);

      objCurrentEntity.show               = true;
      objCurrentEntity.point.pixelSize    = pEnv.cesium.entity.device.size.current;
      objCurrentEntity.point.outlineWidth = pEnv.cesium.entity.device.outlineWidth;
      objCurrentEntity.point.color        = objColor;
      objCurrentEntity.point.outlineColor = Cesium.Color.fromAlpha(objColor, 0.31);
      objCurrentEntity.label.fillColor    = objColor;
    }
  }
});
});
