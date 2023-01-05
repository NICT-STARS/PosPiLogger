;(function($){ $.fn.nictCesium = function(pEnv, pCallBack){
/******************************************************************************/
/** NICT Cesium for JQuery Plugin                                             */
/** Inoue Computer Service.                                                   */
/******************************************************************************/
/******************************************************************************/
/* cesium                                                                     */
/******************************************************************************/
/*-----* initialize *---------------------------------------------------------*/
pEnv.cesium.viewer = new Cesium.Viewer(this.get(0),
{
  imageryProvider      : new Cesium.UrlTemplateImageryProvider(pEnv.cesium.imageryProvider.map.value),
  mapProjection        : new Cesium.WebMercatorProjection     (Cesium.Ellipsoid.WGS84),
  baseLayerPicker      : false,
  navigationHelpButton : false,
  homeButton           : false,
  fullscreenButton     : false,
  sceneModePicker      : false,
  geocoder             : false
});
/*-----* event handler *------------------------------------------------------*/
pEnv.cesium.handler = new Cesium.ScreenSpaceEventHandler(pEnv.cesium.viewer.scene.canvas);
pEnv.cesium.handler.setInputAction(function(pEvent) { $.nictCesium.mouseOverEventHandler(pEnv, pEvent); }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
pEnv.cesium.handler.setInputAction(function(pEvent) { $.nictCesium.     zoomEventHandler(pEnv);         }, Cesium.ScreenSpaceEventType.MOUSE_MOVE, Cesium.KeyboardEventModifier.CTRL);
pEnv.cesium.handler.setInputAction(function(pEvent) { $.nictCesium.     zoomEventHandler(pEnv);         }, Cesium.ScreenSpaceEventType.WHEEL);
pEnv.cesium.handler.setInputAction(function(pEvent) { $.nictCesium.     zoomEventHandler(pEnv);         }, Cesium.ScreenSpaceEventType.PINCH_MOVE);
pEnv.cesium.handler.setInputAction(function(pEvent) { $.nictCesium.     zoomEventHandler(pEnv);         }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
pEnv.cesium.handler.setInputAction(function(pEvent) { pEnv.cesium.viewer.trackedEntity = undefined;     }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

pEnv.cesium.viewer.animation.viewModel.playRealtimeViewModel.command. afterExecute.addEventListener(function() { $.nictCesium.clickRealTimeEventHandler(pEnv); });
pEnv.cesium.viewer.animation.viewModel.playForwardViewModel .command.beforeExecute.addEventListener(function() { pEnv.cesium.camera.position.height = pEnv.cesium.viewer.camera.positionCartographic.height; });
pEnv.cesium.viewer.animation.viewModel.playReverseViewModel .command.beforeExecute.addEventListener(function() { pEnv.cesium.camera.position.height = pEnv.cesium.viewer.camera.positionCartographic.height; });

pEnv.cesium.viewer.selectedEntityChanged.addEventListener(function()
{
  if (      !pEnv.cesium.viewer.animation.viewModel._isAnimating
  &&  typeof pEnv.cesium.viewer.selectedEntity != "undefined"
  &&         pEnv.cesium.viewer.selectedEntity.availability)
  {
    pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime = pEnv.cesium.viewer.selectedEntity.availability.start;
  }
});

function changeTimeEvent()
{
  $.nictCesium.changeTimeEventHandler(pEnv, pCallBack);
  setTimeout(changeTimeEvent, 50);
}

changeTimeEvent();
/*-----* time zone *----------------------------------------------------------*/
pEnv.cesium.viewer.animation.viewModel.dateFormatter = function(pDate) { return $.nictCesium.formatDate(Cesium.JulianDate.toDate(pDate), "%y/%mm/%dd"); };
pEnv.cesium.viewer.animation.viewModel.timeFormatter = function(pDate) { return $.nictCesium.formatDate(Cesium.JulianDate.toDate(pDate), "%H:%M:%S"  ); };
pEnv.cesium.viewer.timeline           .makeLabel     = function(pDate)
{
       if (this._timeBarSecondsSpan <=   2) return $.nictCesium.formatDate(Cesium.JulianDate.toDate(pDate), "%y/%mm/%dd %H:%M:%S.%N");
  else if (this._timeBarSecondsSpan <= 120) return $.nictCesium.formatDate(Cesium.JulianDate.toDate(pDate), "%y/%mm/%dd %H:%M:%S");
  else                                      return $.nictCesium.formatDate(Cesium.JulianDate.toDate(pDate), "%y/%mm/%dd %H:%M");
};
/*-----* start position *-----------------------------------------------------*/
pEnv.cesium.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(Cesium.Cartesian3.fromDegrees(pEnv.cesium.camera.position.longitude, pEnv.cesium.camera.position.latitude)),
{
  offset   : new Cesium.HeadingPitchRange(pEnv.cesium.camera.position.heading, pEnv.cesium.camera.position.pitch, pEnv.cesium.camera.position.height),
  duration : 0
});

$.nictCesium.clickRealTimeEventHandler(pEnv);
/******************************************************************************/
/* menu                                                                       */
/******************************************************************************/
var $menu = $("<div id='nict_cesium_menu'>");

$menu.append("<div id='nict_cesium_imagery_provider'><label></label><select></select></div>");
$menu.append("<div id='nict_cesium_entity_mode'     ><label></label><select></select></div>");

for (var strValue in pEnv.cesium.imageryProvider ) $menu.find("#nict_cesium_imagery_provider select").append("<option value='" + strValue + "'>" + pEnv.cesium.imageryProvider [strValue].label + "</Option>");
for (var strValue in pEnv.cesium.entity.mode.list) $menu.find("#nict_cesium_entity_mode      select").append("<option value="  + strValue +  ">" + pEnv.cesium.entity.mode.list[strValue].label + "</Option>");

$menu.on("change", "select", function()
{
       if ($(this).parent().attr("id") == "nict_cesium_imagery_provider") $.nictCesium.changeImageryProvider(pEnv,            $(this).val());
  else if ($(this).parent().attr("id") == "nict_cesium_entity_mode"     ) $.nictCesium.changeEntityMode     (pEnv, pCallBack, $(this).val());
});

$("body").append($menu);
/******************************************************************************/
/* entities                                                                   */
/******************************************************************************/
var $entities = $("<div id='nict_cesium_entities'>");

$entities.append("<div id='nict_cesium_device'><div class='nict_cesium_caption'><button id='nict_cesium_device_button'></button></div><ul class='nict_cesium_list'></ul></div>");

$entities.on("click", ".nict_cesium_list > *", function()
{
  $(this).toggleClass("nict_cesium_select");
  $.nictCesium.changeEntityMode(pEnv, pCallBack);
});

$entities.on("click", "#nict_cesium_device_button", function()
{
  $entities.find(".nict_cesium_list > *").toggleClass("nict_cesium_select", true);
  $.nictCesium.changeEntityMode(pEnv, pCallBack);
});

$("body").append($entities);
/******************************************************************************/
/* zoom button                                                                */
/******************************************************************************/
var $zoomButton = $("<div id='nict_cesium_zoom_button'>");

$zoomButton.append("<i id='nict_cesium_zoom_in_button' ></i>");
$zoomButton.append("<i id='nict_cesium_zoom_out_button'></i>");

$zoomButton.on("click", "> *", function()
{
  var $this = $(this);

  pEnv.cesium.camera.position.height = null;
  if (pEnv.cesium.viewer.scene.tweens.length > 0) pEnv.cesium.viewer.scene.tweens.removeAll();

  $("<div>dummy</div>").fadeToggle(
  {
    duration : 500,
    easing   : "swing",
    progress : function(pAnimation, pProgress, pRemainingMs)
    {
      if ($this.attr("id") == "nict_cesium_zoom_in_button") { if (pEnv.cesium.viewer.camera.positionCartographic.height >      100) pEnv.cesium.viewer.camera.zoomIn (pEnv.cesium.viewer.camera.positionCartographic.height * 0.05); }
      else                                                  { if (pEnv.cesium.viewer.camera.positionCartographic.height < 10000000) pEnv.cesium.viewer.camera.zoomOut(pEnv.cesium.viewer.camera.positionCartographic.height * 0.05); }
    },
    always   : function(pAnimation, pJumpedToEnd)
    {
      pEnv.cesium.camera.position.height  = pEnv.cesium.viewer.camera.positionCartographic.height;
      pEnv.cesium.camera.position.heading = pEnv.cesium.viewer.camera.heading;
      pEnv.cesium.camera.position.pitch   = pEnv.cesium.viewer.camera.pitch;
      pEnv.cesium.camera.position.roll    = pEnv.cesium.viewer.camera.roll;
    }
  });
});

$("body").append($zoomButton);
/******************************************************************************/
/* tool button                                                                */
/******************************************************************************/
/*-----* initialize *---------------------------------------------------------*/
var $toolButton = $("<div id='nict_cesium_tool_button'>");

$toolButton.append("<i id='nict_cesium_tool_view_url_button'></i>");
$toolButton.append("<i id='nict_cesium_tool_north_button'   ></i>");
$toolButton.append("<i id='nict_cesium_tool_center_button'  ></i>");
$toolButton.append("<i id='nict_cesium_tool_adjust_button'  ></i>");
/*-----* view url button *----------------------------------------------------*/
$toolButton.on("click", "#nict_cesium_tool_view_url_button", function()
{
  var objWindow      = window.parent ? window.parent : window;
  var strViewUrl     = objWindow.location.protocol + "//" + objWindow.location.host + objWindow.location.pathname;
  var strDelimiter   = "?";
  var arySelectTimes = $.nictCesium.createSelectTimesQuery(pEnv);
  var objCurrentTime = Cesium.JulianDate.toDate(pEnv.cesium.viewer.clock.currentTime);
  var objRectangle   = pEnv.cesium.viewer.camera.computeViewRectangle();
  var $dialogBody    = $("<div><a target='_blank'></a></div>");
  var fncSelectText  = function()
  {
    var $element = $("#nict_cesium_dialog_view_url .nict_cesium_dialog_body");

    if ($element.length > 0 && $element.css("visibility") != "hidden")
    {
      var objRange = document.createRange();
      objRange.selectNodeContents($element.find("a").get(0));
      if (window.getSelection().empty          ) window.getSelection().empty();
      if (window.getSelection().removeAllRanges) window.getSelection().removeAllRanges();
                                                 window.getSelection().addRange(objRange);
    }
    else
      setTimeout(fncSelectText, 100);
  };

  for (var i01 = 0; i01 < arySelectTimes.length; i01++)
  {
    strViewUrl   += strDelimiter + "sTs=" + arySelectTimes[i01];
    strDelimiter  = "&";
  }

  strViewUrl += strDelimiter + "cT="    + $.nictCesium.formatDate(objCurrentTime, "%y%mm%dd%H%M%S"); strDelimiter = "&";
  strViewUrl += strDelimiter + "cmrRt=" + objRectangle.west + "," + objRectangle.south + "," + objRectangle.east + "," + objRectangle.north;
  strViewUrl += strDelimiter + "cmrHd=" + pEnv.cesium.viewer.camera.heading;
  strViewUrl += strDelimiter + "cmrPc=" + pEnv.cesium.viewer.camera.pitch;
  strViewUrl += strDelimiter + "cmrHi=" + pEnv.cesium.viewer.camera.positionCartographic.height;
  strViewUrl += strDelimiter + "img="   + encodeURIComponent($("#nict_cesium_imagery_provider select").val());
  strViewUrl += strDelimiter + "etm="   + encodeURIComponent($("#nict_cesium_entity_mode      select").val());

  if ($("#nict_cesium_tool_north_button" ).hasClass("nict_cesium_select")) strViewUrl += strDelimiter + "nt=1";
  if ($("#nict_cesium_tool_center_button").hasClass("nict_cesium_select")) strViewUrl += strDelimiter + "ct=1";

  if ($("#nict_cesium_device .nict_cesium_list li:not(.nict_cesium_select)").length > 0)
  {
    $("#nict_cesium_device .nict_cesium_list li:not(.nict_cesium_select)").each(function(pIndex, pElement)
    {
      strViewUrl += strDelimiter + "dvs=" + $(pElement).text();
    });
  }

  if (typeof pCallBack.viewUrlButtonEvent == "function")
  {
    var strExtViewUrl = pCallBack.viewUrlButtonEvent(pEnv);
    if (typeof strExtViewUrl == "string" && strExtViewUrl.length > 0) strViewUrl += strDelimiter + strExtViewUrl;
  }

  $dialogBody.find("a").attr ("href"      , strViewUrl)
  $dialogBody.find("a").text (              strViewUrl);
  $dialogBody.find("a").ready(              fncSelectText);
  $dialogBody.find("a").on   ("mousedown" , fncSelectText);
  $dialogBody.find("a").on   ("mouseenter", fncSelectText);

  $.nictCesium.openDialog("view_url", $("<div></div>"), $dialogBody, 190);
});
/*-----* north button *-------------------------------------------------------*/
$toolButton.on("click", "#nict_cesium_tool_north_button", function()
{
  $(this).toggleClass("nict_cesium_select");

  pEnv.cesium.viewer.scene.screenSpaceCameraController.enableTilt = !$(this).hasClass("nict_cesium_select");

  if ($(this).hasClass("nict_cesium_select"))
  {
    pEnv.cesium.camera.position.height = null;

    pEnv.cesium.viewer.camera.flyTo(
    {
      destination : pEnv.cesium.viewer.camera.position,
      orientation : { heading : 0, roll : 0 },
      complete    : function()
      {
        pEnv.cesium.camera.position.height  = pEnv.cesium.viewer.camera.positionCartographic.height;
        pEnv.cesium.camera.position.heading = pEnv.cesium.viewer.camera.heading;
        pEnv.cesium.camera.position.pitch   = pEnv.cesium.viewer.camera.pitch;
        pEnv.cesium.camera.position.roll    = pEnv.cesium.viewer.camera.roll;
      },
      cancel      : function()
      {
        pEnv.cesium.camera.position.height  = pEnv.cesium.viewer.camera.positionCartographic.height;
        pEnv.cesium.camera.position.heading = pEnv.cesium.viewer.camera.heading;
        pEnv.cesium.camera.position.pitch   = pEnv.cesium.viewer.camera.pitch;
        pEnv.cesium.camera.position.roll    = pEnv.cesium.viewer.camera.roll;
      }
    });
  }
});
/*-----* center button *------------------------------------------------------*/
$toolButton.on("click", "#nict_cesium_tool_center_button", function()
{
  if ($(this).hasClass("nict_cesium_select"))
  {
    if (!$("#nict_cesium_tool_north_button").hasClass("nict_cesium_select") && $("#nict_cesium_device .nict_cesium_list li.nict_cesium_select").length == 1)
    {
      if ($(this).hasClass("nict_cesium_select2")) $(this).removeClass("nict_cesium_select2").removeClass("nict_cesium_select");
      else                                         $(this).   addClass("nict_cesium_select2");
    }
    else
      $(this).removeClass("nict_cesium_select").removeClass("nict_cesium_select2");
  }
  else
    $(this).addClass("nict_cesium_select");

  if ($(this).hasClass("nict_cesium_select2"))
  {
    $("#nict_cesium_tool_north_button").css({ opacity:0.5, pointerEvents:"none" });
    $("#nict_cesium_entities"         ).css({ opacity:0.5, pointerEvents:"none" });
  }
  else
  {
    $("#nict_cesium_tool_north_button").css({ opacity:"", pointerEvents:"" });
    $("#nict_cesium_entities"         ).css({ opacity:"", pointerEvents:"" });
  }

  pEnv.cesium.camera.enableFly = $(this).hasClass("nict_cesium_select" );
  pEnv.cesium.camera.autoHead  = $(this).hasClass("nict_cesium_select2");
});
/*-----* adjust button *------------------------------------------------------*/
$toolButton.on("click", "#nict_cesium_tool_adjust_button", function()
{
  var objEntities = pEnv.cesium.viewer.entities.values;
  var aryPosition = [];

  for (var i01 = 0; i01 < objEntities.length; i01++)
  {
    if (objEntities[i01].parent && objEntities[i01].parent.show && objEntities[i01].position)
    {
      if (typeof pCallBack.adjustButtonEvent == "function")
      {
        if (pCallBack.adjustButtonEvent(pEnv, objEntities[i01])) aryPosition.push(objEntities[i01].position._value);
      }
      else
        aryPosition.push(objEntities[i01].position._value);
    }
  }

  if (aryPosition.length > 0)
  {
    pEnv.cesium.camera.position.height = null;

    pEnv.cesium.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(pEnv.cesium.viewer.camera.position),
    {
      offset   : new Cesium.HeadingPitchRange(pEnv.cesium.camera.position.heading, pEnv.cesium.camera.position.pitch, 0),
      duration : 0
    });

    pEnv.cesium.viewer.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromPoints(aryPosition),
    {
      offset   : new Cesium.HeadingPitchRange(pEnv.cesium.camera.position.heading, pEnv.cesium.camera.position.pitch),
      complete : function() { pEnv.cesium.camera.position.height = pEnv.cesium.viewer.camera.positionCartographic.height; },
      cancel   : function() { pEnv.cesium.camera.position.height = pEnv.cesium.viewer.camera.positionCartographic.height; }
    });
  }
});

$("body").append($toolButton);
/******************************************************************************/
/* time button                                                                */
/******************************************************************************/
/*-----* initialize *---------------------------------------------------------*/
var $timeButton = $("<div id='nict_cesium_time_button'>");

$timeButton.append("<i id='nict_cesium_time_bottom_button'></i>");
$timeButton.append("<i id='nict_cesium_time_prev_button'  ></i>");
$timeButton.append("<i id='nict_cesium_time_next_button'  ></i>");
$timeButton.append("<i id='nict_cesium_time_top_button'   ></i>");
/*-----* bottom button *------------------------------------------------------*/
$timeButton.on("click", "#nict_cesium_time_bottom_button", function()
{
  var objTime = null;

  for (var strKey in pEnv.cesium.entity.device.data)
  {
    var objParent = pEnv.cesium.entity.device.data[strKey].entity;

    if (!objParent.show) continue;

    for (var i01 = 0; i01 < objParent._children.length; i01++)
    {
      if (objTime && Cesium.JulianDate.greaterThan(objParent._children[i01].availability.start, objTime)) break;

      if (typeof pCallBack.timeButtonEvent == "function")
      {
        if (pCallBack.timeButtonEvent(pEnv, objParent._children[i01]))
        {
          objTime = objParent._children[i01].availability.start;
          break;
        }
      }
      else
      {
        objTime = objParent._children[i01].availability.start;
        break;
      }
    }
  }

  if (objTime)
  {
    pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime = objTime;
    setTimeout(function() { $.nictCesium.changeSelectedEntity(pEnv, pCallBack); }, 100);
  }
});
/*-----* top button *---------------------------------------------------------*/
$timeButton.on("click", "#nict_cesium_time_top_button", function()
{
  var objTime = null;

  for (var strKey in pEnv.cesium.entity.device.data)
  {
    var objParent = pEnv.cesium.entity.device.data[strKey].entity;

    if (!objParent.show) continue;

    for (var i01 = objParent._children.length - 1; i01 > -1; i01--)
    {
      if (objTime && Cesium.JulianDate.lessThan(objParent._children[i01].availability.start, objTime)) break;

      if (typeof pCallBack.timeButtonEvent == "function")
      {
        if (pCallBack.timeButtonEvent(pEnv, objParent._children[i01]))
        {
          objTime = objParent._children[i01].availability.start;
          break;
        }
      }
      else
      {
        objTime = objParent._children[i01].availability.start;
        break;
      }
    }
  }

  if (objTime)
  {
    pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime = objTime;
    setTimeout(function() { $.nictCesium.changeSelectedEntity(pEnv, pCallBack); }, 100);
  }
});
/*-----* prev button *--------------------------------------------------------*/
$timeButton.on("click", "#nict_cesium_time_prev_button", function()
{
  var objTime = null;

  for (var strKey in pEnv.cesium.entity.device.data)
  {
    var objParent = pEnv.cesium.entity.device.data[strKey].entity;

    if (!objParent.show) continue;

    for (var i01 = pEnv.cesium.entity.device.data[strKey].current - 1; i01 > -1; i01--)
    {
      if (Cesium.JulianDate.lessThan(objParent._children[i01].availability.start, pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime))
      {
        if (objTime && Cesium.JulianDate.lessThan(objParent._children[i01].availability.start, objTime)) break;

        if (typeof pCallBack.timeButtonEvent == "function")
        {
          if (pCallBack.timeButtonEvent(pEnv, objParent._children[i01]))
          {
            objTime = objParent._children[i01].availability.start;
            break;
          }
        }
        else
        {
          objTime = objParent._children[i01].availability.start;
          break;
        }
      }
    }
  }

  if (objTime)
  {
    pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime = objTime;
    setTimeout(function() { $.nictCesium.changeSelectedEntity(pEnv, pCallBack); }, 100);
  }
});
/*-----* next button *--------------------------------------------------------*/
$timeButton.on("click", "#nict_cesium_time_next_button", function()
{
  var objTime = null;

  for (var strKey in pEnv.cesium.entity.device.data)
  {
    var objParent = pEnv.cesium.entity.device.data[strKey].entity;

    if (!objParent.show) continue;

    for (var i01 = pEnv.cesium.entity.device.data[strKey].current + 1; i01 < objParent._children.length; i01++)
    {
      if (Cesium.JulianDate.greaterThan(objParent._children[i01].availability.start, pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime))
      {
        if (objTime && Cesium.JulianDate.greaterThan(objParent._children[i01].availability.start, objTime)) break;

        if (typeof pCallBack.timeButtonEvent == "function")
        {
          if (pCallBack.timeButtonEvent(pEnv, objParent._children[i01]))
          {
            objTime = objParent._children[i01].availability.start;
            break;
          }
        }
        else
        {
          objTime = objParent._children[i01].availability.start;
          break;
        }
      }
    }
  }

  if (objTime)
  {
    pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime = objTime;
    setTimeout(function() { $.nictCesium.changeSelectedEntity(pEnv, pCallBack); }, 100);
  }
});

$("body").append($timeButton);
/******************************************************************************/
/* date button                                                                */
/******************************************************************************/
/*-----* initialize *---------------------------------------------------------*/
var $dateButton = $("<div id='nict_cesium_date_button'>");

$dateButton.append("<i id='nict_cesium_date_calendar_button'></i>");
$dateButton.append("<i id='nict_cesium_date_today_button'   ></i>");
/*-----* calendar button *----------------------------------------------------*/
$dateButton.on("click", "#nict_cesium_date_calendar_button", function()
{
  var $calendar = $("<div id='nict_cesium_calendar'><table></table></div>");

  $calendar.data       ("nictCesiumDateList"      , pEnv.cesium.selectTimes.slice());
  $calendar.toggleClass("nict_cesium_multi_select", pEnv.cesium.selectTimes.length > 1 && "ontouchend" in document);
/*-----* create year calendar *-----------------------------------------------*/
  $calendar.on("createYearCalendar.nictCesiumCalendar", function(pEvent, pExtra)
  {
    var objDate      = pExtra ? pExtra : new Date();
    var objStartDate = new Date(objDate.getFullYear() - 9, 0, 1);
    var objEndDate   = new Date(objDate.getFullYear()    , 0, 1);
    var intCols      = 0;
    var intRows      = 0;

    $calendar.find("table > *").remove();

    $calendar.find("table").attr  ("type", "year");
    $calendar.find("table").append("<caption><span class='prev'></span><span class='date'>&nbsp;</span><span class='next'></span></caption>");
    $calendar.find("table").append("<tfoot></tfoot>");
    $calendar.find("table").append("<tbody></tbody>");

    $calendar.find("tfoot").append("<tr><th class='clear'></th><th colspan='2'></th><th class='ok'></th><th class='cancel'></th></tr>");

    $calendar.find("tbody").append("<tr><td></td><td></td><td></td><td></td><td></td></tr>");
    $calendar.find("tbody").append("<tr><td></td><td></td><td></td><td></td><td></td></tr>");

    $calendar.find("table caption .date").attr("date", objStartDate.getTime());

    while (objStartDate <= objEndDate)
    {
      $calendar.find("tbody tr").eq(intRows).find("td").eq(intCols).text(objStartDate.getFullYear()).attr("date", objStartDate.getTime());
      objStartDate.setFullYear(objStartDate.getFullYear() + 1);
      intCols++;

      if (intCols > 4)
      {
        intCols = 0;
        intRows++;
      }
    }

    if (typeof pCallBack.calendarEvent == "object" && typeof pCallBack.calendarEvent.createCalendarEvent == "function") pCallBack.calendarEvent.createCalendarEvent(pEnv);
  });
/*-----* create month calendar *----------------------------------------------*/
  $calendar.on("createMonthCalendar.nictCesiumCalendar", function(pEvent, pExtra)
  {
    var objDate      = pExtra ? pExtra : new Date();
    var objStartDate = new Date(objDate.getFullYear(),  0,  1);
    var objEndDate   = new Date(objDate.getFullYear(), 11, 31);
    var intCols      = 0;
    var intRows      = 0;

    $calendar.find("table > *").remove();

    $calendar.find("table").attr  ("type", "month");
    $calendar.find("table").append("<caption><span class='prev'></span><span class='date'></span><span class='next'></span></caption>");
    $calendar.find("table").append("<tfoot></tfoot>");
    $calendar.find("table").append("<tbody></tbody>");

    $calendar.find("tfoot").append("<tr><th class='clear'></th><th></th><th class='ok'></th><th class='cancel'></th></tr>");

    $calendar.find("tbody").append("<tr><td></td><td></td><td></td><td></td></tr>");
    $calendar.find("tbody").append("<tr><td></td><td></td><td></td><td></td></tr>");
    $calendar.find("tbody").append("<tr><td></td><td></td><td></td><td></td></tr>");

    $calendar.find("table caption .date").text(objStartDate.getFullYear()).attr("date", objStartDate.getTime());

    while (objStartDate <= objEndDate)
    {
      $calendar.find("tbody tr").eq(intRows).find("td").eq(intCols).text(objStartDate.getMonth() + 1).attr("date", objStartDate.getTime());
      objStartDate.setMonth(objStartDate.getMonth() + 1);
      intCols++;

      if (intCols > 3)
      {
        intCols = 0;
        intRows++;
      }
    }

    if (typeof pCallBack.calendarEvent == "object" && typeof pCallBack.calendarEvent.createCalendarEvent == "function") pCallBack.calendarEvent.createCalendarEvent(pEnv);
  });
/*-----* create day calendar *------------------------------------------------*/
  $calendar.on("createDayCalendar.nictCesiumCalendar", function(pEvent, pExtra)
  {
    var objDate      = pExtra ? pExtra : new Date();
    var objStartDate = new Date(objDate.getFullYear(), objDate.getMonth()    , 1);
    var objEndDate   = new Date(objDate.getFullYear(), objDate.getMonth() + 1, 0);
    var objToday     = new Date(); objToday.setHours(0, 0, 0, 0);
    var intCols      = objStartDate.getDay();
    var intRows      = 0;

    $calendar.find("table > *").remove();

    $calendar.find("table").attr  ("type", "day");
    $calendar.find("table").append("<caption><span class='prev'></span><i class='nict_cesium_calendar_check_all_icon'></i><span class='date'><span class='year'></span><span class='month'></span></span><span class='next'></span></caption>");
    $calendar.find("table").append("<thead></thead>");
    $calendar.find("table").append("<tfoot></tfoot>");
    $calendar.find("table").append("<tbody></tbody>");

    $calendar.find("thead").append("<tr><th></th><th></th><th></th><th></th><th></th><th></th><th></th></tr>");
    $calendar.find("tfoot").append("<tr><th colspan='2' class='clear'></th><th colspan='1'></th><th colspan='2' class='ok'></th><th colspan='2' class='cancel'></th></tr>");

    $calendar.find("tbody").append("<tr><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td></tr>");
    $calendar.find("tbody").append("<tr><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td></tr>");
    $calendar.find("tbody").append("<tr><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td></tr>");
    $calendar.find("tbody").append("<tr><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td></tr>");
    $calendar.find("tbody").append("<tr><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td></tr>");
    $calendar.find("tbody").append("<tr><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td><td><i class='nict_cesium_calendar_check_icon'></i><span></span></td></tr>");

    $calendar.find("table caption .date" ).attr("date", objStartDate.getTime    ()    );
    $calendar.find("table caption .year" ).text(        objStartDate.getFullYear()    );
    $calendar.find("table caption .month").text(        objStartDate.getMonth   () + 1);

    while (objStartDate <= objEndDate)
    {
      $calendar.find("tbody tr").eq(intRows).find("td").eq(intCols).attr("date", objStartDate.getTime()).toggleClass("today", objStartDate.getTime() == objToday.getTime()).find("span").text(objStartDate.getDate());
      objStartDate.setDate(objStartDate.getDate() + 1);
      intCols++;

      if (intCols > 6)
      {
        intCols = 0;
        intRows++;
      }
    }

    for (var i01 = 0; i01 < $calendar.data("nictCesiumDateList").length; i01++)
    {
      var objSelectDate = new Date($calendar.data("nictCesiumDateList")[i01].getTime());
      objSelectDate.setHours(0, 0, 0, 0);
      $calendar.find("tbody td[date='" + objSelectDate.getTime() + "']").addClass("select");
    }

    $calendar.find("caption .nict_cesium_calendar_check_all_icon").toggleClass("select", $calendar.find("tbody td[date]:not(.select)").length <= 0);

    if (typeof pCallBack.calendarEvent == "object" && typeof pCallBack.calendarEvent.createCalendarEvent == "function") pCallBack.calendarEvent.createCalendarEvent(pEnv);
  });
/*-----* prev *---------------------------------------------------------------*/
  $calendar.on("click", ".prev", function(pEvent, pExtra)
  {
    var objDate = new Date(parseInt($calendar.find("caption .date").attr("date"), 10));

    if ($calendar.find("table").attr("type") == "year")
    {
      objDate.setFullYear(objDate.getFullYear() - 1);
      $calendar.trigger("createYearCalendar.nictCesiumCalendar", objDate);
    }
    else if ($calendar.find("table").attr("type") == "month")
    {
      objDate.setFullYear(objDate.getFullYear() - 1);
      $calendar.trigger("createMonthCalendar.nictCesiumCalendar", objDate);
    }
    else if ($calendar.find("table").attr("type") == "day")
    {
      objDate.setMonth(objDate.getMonth() - 1);
      $calendar.trigger("createDayCalendar.nictCesiumCalendar", objDate);
    }

    return false;
  });
/*-----* next *---------------------------------------------------------------*/
  $calendar.on("click", ".next", function(pEvent, pExtra)
  {
    var objDate = new Date(parseInt($calendar.find("caption .date").attr("date"), 10));

    if ($calendar.find("table").attr("type") == "year")
    {
      objDate.setFullYear(objDate.getFullYear() + 19);
      $calendar.trigger("createYearCalendar.nictCesiumCalendar", objDate);
    }
    else if ($calendar.find("table").attr("type") == "month")
    {
      objDate.setFullYear(objDate.getFullYear() + 1);
      $calendar.trigger("createMonthCalendar.nictCesiumCalendar", objDate);
    }
    else if ($calendar.find("table").attr("type") == "day")
    {
      objDate.setMonth(objDate.getMonth() + 1);
      $calendar.trigger("createDayCalendar.nictCesiumCalendar", objDate);
    }

    return false;
  });
/*-----* date *---------------------------------------------------------------*/
  $calendar.on("click", ".date", function(pEvent, pExtra)
  {
    var objDate = new Date(parseInt($(this).attr("date"), 10));

         if ($calendar.find("table").attr("type") == "month") $calendar.trigger( "createYearCalendar.nictCesiumCalendar", objDate);
    else if ($calendar.find("table").attr("type") == "day"  ) $calendar.trigger("createMonthCalendar.nictCesiumCalendar", objDate);

    return false;
  });
/*-----* all *----------------------------------------------------------------*/
  $calendar.on("click", ".nict_cesium_calendar_check_all_icon", function(pEvent, pExtra)
  {
    var objDate       = new Date(parseInt($calendar.find("caption .date").attr("date"), 10));
    var objDateOrigin = new Date(parseInt($calendar.find("caption .date").attr("date"), 10));
    var objDateList   = [];
    var intMonth      = objDate.getMonth();

    for (var i01 = 0; i01 < $calendar.data("nictCesiumDateList").length; i01++)
    {
      var objSelectDate = new Date($calendar.data("nictCesiumDateList")[i01].getTime());
      if (objDate.getFullYear() != objSelectDate.getFullYear() || objDate.getMonth() != objSelectDate.getMonth()) objDateList.push(new Date(objSelectDate.getTime()));
    }

    $(this).toggleClass("select");

    if ($(this).hasClass("select"))
    {
      while (objDate.getMonth() == intMonth)
      {
        objDateList.push   (new Date(objDate.getTime()));
        objDate    .setDate(objDate.getDate() + 1);
      }
    }

    $calendar.data   ("nictCesiumDateList"                  , objDateList.slice());
    $calendar.trigger("createDayCalendar.nictCesiumCalendar", objDateOrigin      );

    return false;
  });
/*-----* td *-----------------------------------------------------------------*/
  var strEvent = "ontouchend" in document ? "touchstart" : "click";

  $calendar.on(strEvent, "td", function(pEvent, pExtra)
  {
    if ($(this).attr("date"))
    {
      var objDate = new Date(parseInt($(this).attr("date"), 10));

           if ($calendar.find("table").attr("type") == "year" ) $calendar.trigger("createMonthCalendar.nictCesiumCalendar", objDate);
      else if ($calendar.find("table").attr("type") == "month") $calendar.trigger(  "createDayCalendar.nictCesiumCalendar", objDate);
      else if ($calendar.find("table").attr("type") == "day"  )
      {
        function _rangeSelect(pElement)
        {
          var objPrevDate = null;

          for (var i01 = 0; i01 < $calendar.data("nictCesiumDateList").length; i01++)
          {
            var objSelectDate = new Date($calendar.data("nictCesiumDateList")[i01].getTime());
            objSelectDate.setHours(0, 0, 0, 0);

            if (objSelectDate.getTime() < objDate.getTime() && (objPrevDate == null || objPrevDate.getTime() < objSelectDate.getTime())) objPrevDate = new Date(objSelectDate.getTime());
          }

          if (objPrevDate == null) objPrevDate = new Date(objDate.getTime());

          while (objPrevDate.getTime() <= objDate.getTime())
          {
            if (!$calendar.data("nictCesiumDateList").some(function(pValue){ return pValue.getTime() == objPrevDate.getTime() })) $calendar.data("nictCesiumDateList").push(new Date(objPrevDate.getTime()));
            objPrevDate.setDate(objPrevDate.getDate() + 1);
          }

          $calendar.trigger("createDayCalendar.nictCesiumCalendar", objDate);
        }

        function _multiSelect(pElement)
        {
          if (pElement.hasClass("select"))
          {
            for (var i01 = 0; i01 < $calendar.data("nictCesiumDateList").length; i01++)
            {
              var objSelectDate = new Date($calendar.data("nictCesiumDateList")[i01].getTime());
              objSelectDate.setHours(0, 0, 0, 0);

              if (objDate.getTime() == objSelectDate.getTime())
              {
                $calendar.data("nictCesiumDateList").splice(i01, 1);
                break;
              }
            }

            pElement.removeClass("select");
          }
          else
          {
            $calendar.data("nictCesiumDateList").push(new Date(objDate.getTime()));
            pElement.addClass("select");
          }

          $calendar.find("caption .nict_cesium_calendar_check_all_icon").toggleClass("select", $calendar.find("tbody td[date]:not(.select)").length <= 0);
        }

        function _singleSelect(pElement)
        {
          $calendar.data("nictCesiumDateList", [new Date(objDate.getTime())]);
          $calendar.find("tbody td").removeClass("select");
          pElement.addClass("select");
          $calendar.find("caption .nict_cesium_calendar_check_all_icon").toggleClass("select", $calendar.find("tbody td[date]:not(.select)").length <= 0);
        }

        if (strEvent == "click")
        {
               if (pEvent.shiftKey)  _rangeSelect($(this));
          else if (pEvent.ctrlKey )  _multiSelect($(this));
          else                      _singleSelect($(this));
        }
        else
        {
          if (!$calendar.hasClass("nict_cesium_multi_select"))
          {
            $calendar.data("nictCesiumTapHold", setTimeout(function()
            {
              $calendar.addClass("nict_cesium_multi_select");
              $calendar.data("nictCesiumTapHold", null);
            }, 1000));
          }

          if ($calendar.hasClass("nict_cesium_multi_select")) {  _multiSelect($(this)); $calendar.trigger("createDayCalendar.nictCesiumCalendar", objDate); }
          else                                                  _singleSelect($(this));
        }
      }
    }

    return false;
  });

  $calendar.on("touchend", "td", function(pEvent, pExtra)
  {
    if ($calendar.data("nictCesiumTapHold"))
    {
      clearTimeout($calendar.data("nictCesiumTapHold"));
      $calendar.data("nictCesiumTapHold", null);
    }

    return false;
  });
/*-----* clear *--------------------------------------------------------------*/
  $calendar.on("click", ".clear", function(pEvent, pExtra)
  {
    $calendar                        .data       ("nictCesiumDateList", []);
    $calendar                        .removeClass("nict_cesium_multi_select");
    $calendar.find("tbody td.select").removeClass("select");
    return false;
  });
/*-----* ok *-----------------------------------------------------------------*/
  $calendar.on("click", ".ok", function(pEvent, pExtra)
  {
    pEnv.cesium.selectTimes = $calendar.data("nictCesiumDateList").slice();
    $.nictCesium.changeSelectTimesEventHandler(pEnv, pCallBack);
    $calendar.remove();
    return false;
  });
/*-----* cancel *-------------------------------------------------------------*/
  $calendar.on("click", ".cancel", function(pEvent, pExtra)
  {
    $calendar.remove();
    return false;
  });
/*-----* open *---------------------------------------------------------------*/
  var objDate = Cesium.JulianDate.toDate(pEnv.cesium.viewer.clock.currentTime);
  $("body").append($calendar);
  $calendar.trigger("createDayCalendar.nictCesiumCalendar", objDate);
});
/*-----* today button *-------------------------------------------------------*/
$dateButton.on("click", "#nict_cesium_date_today_button", function()
{
  var objDate = new Date();

  objDate.setHours(0, 0, 0, 0);
  pEnv.cesium.selectTimes = [new Date(objDate.getTime())];
  $.nictCesium.changeSelectTimesEventHandler(pEnv, pCallBack);

  setTimeout(function _sleep()
  {
    if ($("body").data("nictCesiumChangeDate")) setTimeout(_sleep, 100);
    else
    {
      pEnv.cesium.viewer.animation.viewModel.playRealtimeViewModel.command();
    }
  }, 1000);

  return false;
});

$("body").append($dateButton);
$("body").append("<div id='nict_cesium_select_times' style='display:none;'></div>");
/******************************************************************************/
/* get url environment                                                        */
/******************************************************************************/
if(window.location.search.length > 1)
{
  var objGetQueryString = $.nictCesium.getQueryString(window.location.search.substring(1).split("&"));
/*-----* select times *-------------------------------------------------------*/
  if (Array.isArray(objGetQueryString.sTs))
  {
    for (var i01 = 0; i01 < objGetQueryString.sTs.length; i01++)
    {
      var aryDates = objGetQueryString.sTs[i01].indexOf(",") > -1 ? objGetQueryString.sTs[i01].split(",") : [objGetQueryString.sTs[i01]];

      if (aryDates.length == 2 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/) && typeof aryDates[1] == "string" && aryDates[1].match(/^\d{8}$/))
      {
        var objStart = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));
        var objEnd   = new Date(aryDates[1].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));

        while (objStart.getTime() <= objEnd.getTime())
        {
          pEnv.cesium.selectTimes.push(new Date(objStart.getTime()));
          objStart.setDate(objStart.getDate() + 1);
        }
      }
      else if (aryDates.length == 1 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/))
        pEnv.cesium.selectTimes.push(new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00")));
    }

    $.nictCesium.changeSelectTimesEventHandler(pEnv, pCallBack);
  }
  else if (typeof objGetQueryString.sTs == "string")
  {
    var aryDates = objGetQueryString.sTs.indexOf(",") > -1 ? objGetQueryString.sTs.split(",") : [objGetQueryString.sTs];

    if (aryDates.length == 2 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/) && typeof aryDates[1] == "string" && aryDates[1].match(/^\d{8}$/))
    {
      var objStart = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));
      var objEnd   = new Date(aryDates[1].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));

      while (objStart.getTime() <= objEnd.getTime())
      {
        pEnv.cesium.selectTimes.push(new Date(objStart.getTime()));
        objStart.setDate(objStart.getDate() + 1);
      }
    }
    else if (aryDates.length == 1 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/))
      pEnv.cesium.selectTimes.push(new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00")));

    $.nictCesium.changeSelectTimesEventHandler(pEnv, pCallBack);
  }
/*-----* current time *-------------------------------------------------------*/
  setTimeout(function _sleep()
  {
    if ($("body").data("nictCesiumChangeDate")) setTimeout(_sleep, 100);
    else
    {
      function _viewUrl()
      {
        var flgChangeEntityMode = false;

        if (typeof objGetQueryString.cT == "string" && objGetQueryString.cT.match(/^\d{14}$/))
        {
          var objCurrent = new Date(objGetQueryString.cT.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, "$1/$2/$3 $4:$5:$6"));
          pEnv.cesium.viewer.animation.viewModel.clockViewModel.currentTime = Cesium.JulianDate.fromDate(objCurrent);
        }
/*-----* speed *--------------------------------------------------------------*/
        if (typeof objGetQueryString.sp == "string" && objGetQueryString.sp.match(/^\d+$/))
        {
          var intSpeed = parseInt(objGetQueryString.sp, 10);
          if (intSpeed < pEnv.cesium.shuttleRingAngle.length) pEnv.cesium.viewer.animation.viewModel.shuttleRingAngle = pEnv.cesium.shuttleRingAngle[intSpeed];
        }
/*-----* device *-------------------------------------------------------------*/
        if (Array.isArray(objGetQueryString.dvs))
        {
          for (var i01 = 0; i01 < objGetQueryString.dvs.length; i01++)
          $("#nict_cesium_device_" + objGetQueryString.dvs[i01]).removeClass("nict_cesium_select");
          flgChangeEntityMode = true;
        }
        else if (typeof objGetQueryString.dvs == "string")
        {
          $("#nict_cesium_device_" + objGetQueryString.dvs     ).removeClass("nict_cesium_select");
          flgChangeEntityMode = true;
        }
/*-----* other *--------------------------------------------------------------*/
        if (typeof objGetQueryString.img == "string") $("#nict_cesium_imagery_provider select").val(objGetQueryString.img).trigger("change");
        if (typeof objGetQueryString.etm == "string") $("#nict_cesium_entity_mode      select").val(objGetQueryString.etm).trigger("change");
        if (       objGetQueryString.nt  == "1"     ) $("#nict_cesium_tool_north_button"      ).trigger("click");
        if (       objGetQueryString.ct  == "1"     ) $("#nict_cesium_tool_center_button"     ).trigger("click");

        if (typeof pCallBack.getUrlEnvEvent == "function")
        {
          if (pCallBack.getUrlEnvEvent(pEnv, objGetQueryString)) flgChangeEntityMode = true;
        }

        if (flgChangeEntityMode) $.nictCesium.changeEntityMode(pEnv, pCallBack);
      }
/*-----* camera position *----------------------------------------------------*/
      var objCameraPosition  = { west : null, south : null, east : null, north : null, heading : null, pitch : null, height : null };
      var flgExistNull       = false;

      if (typeof objGetQueryString.cmrRt == "string" && objGetQueryString.cmrRt.split(",").length == 4)
      {
        if (objGetQueryString.cmrRt.split(",")[0].match(/^[\-\d\.e]+$/)) objCameraPosition.west  = parseFloat(objGetQueryString.cmrRt.split(",")[0]);
        if (objGetQueryString.cmrRt.split(",")[1].match(/^[\-\d\.e]+$/)) objCameraPosition.south = parseFloat(objGetQueryString.cmrRt.split(",")[1]);
        if (objGetQueryString.cmrRt.split(",")[2].match(/^[\-\d\.e]+$/)) objCameraPosition.east  = parseFloat(objGetQueryString.cmrRt.split(",")[2]);
        if (objGetQueryString.cmrRt.split(",")[3].match(/^[\-\d\.e]+$/)) objCameraPosition.north = parseFloat(objGetQueryString.cmrRt.split(",")[3]);
      }

      if (typeof objGetQueryString.cmrHd == "string" && objGetQueryString.cmrHd.match(/^[\-\d\.e]+$/)) objCameraPosition.heading = parseFloat(objGetQueryString.cmrHd);
      if (typeof objGetQueryString.cmrPc == "string" && objGetQueryString.cmrPc.match(/^[\-\d\.e]+$/)) objCameraPosition.pitch   = parseFloat(objGetQueryString.cmrPc);
      if (typeof objGetQueryString.cmrHi == "string" && objGetQueryString.cmrHi.match(/^[\-\d\.e]+$/)) objCameraPosition.height  = parseFloat(objGetQueryString.cmrHi);

      for (var strKey in objCameraPosition) { if (objCameraPosition[strKey] == null || isNaN(objCameraPosition[strKey])) flgExistNull = true; }

      if (!flgExistNull)
      {
        pEnv.cesium.viewer.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromRectangle3D(new Cesium.Rectangle(objCameraPosition.west, objCameraPosition.south, objCameraPosition.east, objCameraPosition.north)),
        {
          offset   : new Cesium.HeadingPitchRange(objCameraPosition.heading, objCameraPosition.pitch, objCameraPosition.height),
          complete : function()
          {
            pEnv.cesium.camera.position.heading = objCameraPosition.heading;
            pEnv.cesium.camera.position.pitch   = objCameraPosition.pitch;
            pEnv.cesium.camera.position.height  = pEnv.cesium.viewer.camera.positionCartographic.height;
            _viewUrl();
          },
          cancel   : function()
          {
            pEnv.cesium.camera.position.heading = objCameraPosition.heading;
            pEnv.cesium.camera.position.pitch   = objCameraPosition.pitch;
            pEnv.cesium.camera.position.height  = pEnv.cesium.viewer.camera.positionCartographic.height;
            _viewUrl();
          }
        });
      }
      else
        _viewUrl();
    }
  }, 1000);
}
/******************************************************************************/
/* web socket                                                                 */
/******************************************************************************/
/*-----* initialize *---------------------------------------------------------*/
var $socket = io.connect(pEnv.server.webSocket.url, pEnv.server.webSocket.options);
/*-----* connect *------------------------------------------------------------*/
$socket.on("connect", function()
{
  $.nictCesium.putLog(pEnv, "begin connection");
});
/*-----* recv(transmitter.log) *----------------------------------------------*/
$socket.on("transmitter.log", function(pJson)
{
  var objSystemTime = Cesium.JulianDate.toDate(pEnv.cesium.viewer.animation.viewModel.clockViewModel.systemTime); objSystemTime.setHours(0, 0, 0, 0);
  var intCount      = 0;

  if (!$("body").data("nictCesiumChangeDate") && pEnv.cesium.selectTimes.some(function(pValue){ return pValue.getTime() == objSystemTime.getTime() }))
  {
    var objEntity = $.nictCesium.addEntity(pEnv, pCallBack, pJson);

    for (var strKey in pEnv.cesium.entity.device.data) intCount += pEnv.cesium.entity.device.data[strKey].entity._children.length;
    if (intCount == 1) pEnv.cesium.camera.position.height = 1000;

    if (typeof pCallBack.recvRealTimeDataEvent == "function") pCallBack.recvRealTimeDataEvent(pEnv, objEntity);
  }
});
/*-----* disconnect *---------------------------------------------------------*/
$socket.on("disconnect", function()
{
  $.nictCesium.putLog(pEnv, "end connection");
});
return this;
};})(jQuery);
;(function($){ $.nictCesium = {
/******************************************************************************/
/** NICT Cesium for JQuery Function                                           */
/** Inoue Computer Service.                                                   */
/******************************************************************************/
/******************************************************************************/
/* nictCesium.mouseOverEventHandler                                           */
/******************************************************************************/
mouseOverEventHandler : function(pEnv, pEvent)
{
  var objPicked = pEnv.cesium.viewer.scene.pick(pEvent.endPosition ? pEvent.endPosition : pEvent.position);

  if (Cesium.defined(objPicked))
  {
    objPicked.id.label.show = true;

    if (Array.isArray($("body").data("nictCesiumShowLabel"))) $("body").data("nictCesiumShowLabel").push(objPicked.id);
    else                                                      $("body").data("nictCesiumShowLabel",     [objPicked.id]);
  }
  else
  {
    if (Array.isArray($("body").data("nictCesiumShowLabel")))
    {
      while ($("body").data("nictCesiumShowLabel").length > 0)
      {
        $("body").data("nictCesiumShowLabel")[0].label.show = false;
        $("body").data("nictCesiumShowLabel").shift();
      }
    }
  }
},
/******************************************************************************/
/* nictCesium.zoomEventHandler                                                */
/******************************************************************************/
zoomEventHandler : function(pEnv)
{
  if (pEnv.cesium.camera.position.height     == null) return;
  if (pEnv.cesium.viewer.scene.tweens.length >     0) pEnv.cesium.viewer.scene.tweens.removeAll();

  pEnv.cesium.camera.position.height  = pEnv.cesium.viewer.camera.positionCartographic.height;
  pEnv.cesium.camera.position.heading = pEnv.cesium.viewer.camera.heading;
  pEnv.cesium.camera.position.pitch   = pEnv.cesium.viewer.camera.pitch;
  pEnv.cesium.camera.position.roll    = pEnv.cesium.viewer.camera.roll;
},
/******************************************************************************/
/* nictCesium.clickRealTimeEventHandler                                       */
/******************************************************************************/
clickRealTimeEventHandler : function(pEnv)
{
  var objStart = new Date($.nictCesium.formatDate(new Date(), "%y/%m/%d 00:00:00"));
  var objEnd   = new Date($.nictCesium.formatDate(new Date(), "%y/%m/%d 23:59:59"));

  pEnv.cesium.viewer.timeline.zoomTo(Cesium.JulianDate.fromDate(objStart), Cesium.JulianDate.fromDate(objEnd));
},
/******************************************************************************/
/* nictCesium.changeTimeEventHandler                                          */
/******************************************************************************/
changeTimeEventHandler : function(pEnv, pCallBack)
{
/*-----* check realtime *-----------------------------------------------------*/
  if (pEnv.cesium.viewer.animation.viewModel.playRealtimeViewModel.toggled && pEnv.cesium.selectTimes.length > 0)
  {
    var objToday = new Date();

    if (pEnv.cesium.selectTimes.some(function(pValue) { return objToday.getFullYear() == pValue.getFullYear() && objToday.getMonth() == pValue.getMonth() && objToday.getDate() == pValue.getDate(); }))
      $("#nict_cesium_date_today_button").toggleClass("on", true);
    else
      $("#nict_cesium_date_today_button").toggleClass("on", false);
  }
  else
    $("#nict_cesium_date_today_button").toggleClass("on", false);

  if ($("body").data("nictCesiumChangeDate")) return;
  if (typeof pCallBack.changeTimeEvent == "object" && typeof pCallBack.changeTimeEvent.beforeEvent == "function") pCallBack.changeTimeEvent.beforeEvent(pEnv);
/*-----* get current entity *-------------------------------------------------*/
  var aryPosition  = [];
  var intDirection = null;

  for (var strKey in pEnv.cesium.entity.device.data)
  {
    var objData          = pEnv.cesium.entity.device.data[strKey];
    var objParent        = objData.entity;
    var intIndex         = objData.current; if (intIndex >= objParent._children.length) continue;
    var objEntity        = objParent._children[intIndex];
    var objCurrentEntity;

    if (Cesium.JulianDate.greaterThan(objEntity.availability.start, pEnv.cesium.viewer.clock.currentTime))
    {
      for (var i01 = intIndex; i01 > -1; i01--)
      {
        if (Cesium.JulianDate.greaterThan     (objParent._children[i01].availability.start, pEnv.cesium.viewer.clock.currentTime))   intIndex = i01;
        else                                                                                                                       { intIndex = i01; break; }
      }
    }
    else
    {
      for (var i01 = intIndex; i01 < objParent._children.length; i01++)
      {
        if (Cesium.JulianDate.lessThanOrEquals(objParent._children[i01].availability.start, pEnv.cesium.viewer.clock.currentTime)) intIndex = i01;
        else                                                                                                                       break;
      }
    }

    objData.current  = intIndex;
    objCurrentEntity = objParent._children[intIndex];

    if (typeof pCallBack.changeTimeEvent == "object" && typeof pCallBack.changeTimeEvent.setEntityProperty == "function") pCallBack.changeTimeEvent.setEntityProperty(pEnv, objEntity, objCurrentEntity);

    if (objParent.show && objCurrentEntity.show)
    {
      aryPosition.push(objCurrentEntity.position._value);
      if (typeof objCurrentEntity.properties.direction == "object") intDirection = objCurrentEntity.properties.direction._value;
    }
  }

  if (pEnv.cesium.camera.enableFly && aryPosition.length > 0 && pEnv.cesium.camera.position.height != null)
  {
    if (pEnv.cesium.camera.autoHead && typeof intDirection == "number" && !isNaN(intDirection)) pEnv.cesium.camera.position.heading = Cesium.Math.toRadians(intDirection);

    pEnv.cesium.viewer.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromPoints(aryPosition),
    {
      offset         : new Cesium.HeadingPitchRange(pEnv.cesium.camera.position.heading, pEnv.cesium.camera.position.pitch, pEnv.cesium.camera.position.height),
      easingFunction : function(pTime) { return pTime * 4; }
    });
  }

  if (pEnv.cesium.viewer.animation.viewModel._isAnimating) $.nictCesium.changeSelectedEntity(pEnv, pCallBack);
},
/******************************************************************************/
/* nictCesium.changeSelectTimesEventHandler                                   */
/******************************************************************************/
changeSelectTimesEventHandler : function(pEnv, pCallBack)
{
  if (pEnv.cesium.viewer.animation.viewModel._isAnimating) pEnv.cesium.viewer.animation.viewModel.pauseViewModel.command();

  $.nictCesium.removeEntity(pEnv, pCallBack);
  $("#nict_cesium_select_times").css("display", "none");

  if (pEnv.cesium.selectTimes.length > 0)
  {
    pEnv.cesium.selectTimes.sort(function(pDate1, pDate2) { return pDate1.getTime() < pDate2.getTime() ? -1 : 1; });

    var objMinDate = new Date(pEnv.cesium.selectTimes[0                                 ].getTime()); objMinDate.setHours( 0,  0,  0,   0);
    var objMaxDate = new Date(pEnv.cesium.selectTimes[pEnv.cesium.selectTimes.length - 1].getTime()); objMaxDate.setHours(23, 59, 59, 999);

    pEnv.cesium.viewer.timeline.zoomTo(Cesium.JulianDate.fromDate(objMinDate), Cesium.JulianDate.fromDate(objMaxDate));
    pEnv.cesium.viewer.clock.currentTime = Cesium.JulianDate.fromDate(objMinDate);

    $("body").data("nictCesiumChangeDateStop", false);
    $("body").data("nictCesiumChangeDate"    , true);

    $.nictCesium.searchJson(pEnv, pCallBack);

    setTimeout(function _sleep()
    {
      if ($("body").data("nictCesiumChangeDate")) setTimeout(_sleep, 100);
      else                                        $("#nict_cesium_time_bottom_button").trigger("click");
    }, 1000);
  }
},
/******************************************************************************/
/* nictCesium.changeImageryProvider                                           */
/******************************************************************************/
changeImageryProvider : function(pEnv, pImageryProvider)
{
  pEnv.cesium.viewer.scene.imageryLayers.removeAll         ();
  pEnv.cesium.viewer.scene.imageryLayers.addImageryProvider(new Cesium.UrlTemplateImageryProvider(pEnv.cesium.imageryProvider[pImageryProvider].value));
},
/******************************************************************************/
/* nictCesium.changeEntityMode                                                */
/******************************************************************************/
changeEntityMode : function(pEnv, pCallBack, pEntityMode)
{
  pEnv.cesium.entity.mode.choice = typeof pEntityMode == "undefined" ? pEnv.cesium.entity.mode.choice : pEntityMode;

  if (typeof pCallBack.changeEntityModeEvent == "object" && typeof pCallBack.changeEntityModeEvent.beforeEvent   == "function") pCallBack.changeEntityModeEvent.beforeEvent(pEnv);

  for (var strKey in pEnv.cesium.entity.device.data)
  {
    var objParent = pEnv.cesium.entity.device.data[strKey].entity;

    objParent.show = $("#nict_cesium_device_" + strKey).hasClass("nict_cesium_select");

    for (var i01 = 0; i01 < objParent._children.length; i01++)
    {
      if (typeof pCallBack.changeEntityModeEvent == "object" && typeof pCallBack.changeEntityModeEvent.setEntityShow == "function")
        objParent._children[i01].show = pCallBack.changeEntityModeEvent.setEntityShow(pEnv, objParent._children[i01]);
      else
        objParent._children[i01].show = pEnv.cesium.entity.mode.list[pEnv.cesium.entity.mode.choice].show;
    }
  }

  if (typeof pCallBack.changeEntityModeEvent == "object" && typeof pCallBack.changeEntityModeEvent.afterEvent   == "function") pCallBack.changeEntityModeEvent.afterEvent(pEnv);
},
/******************************************************************************/
/* nictCesium.changeSelectedEntity                                            */
/******************************************************************************/
changeSelectedEntity : function(pEnv, pCallBack)
{
  if (typeof pEnv.cesium.viewer.selectedEntity != "undefined" && pEnv.cesium.viewer.selectedEntity.properties)
  {
    var objData;

    if (typeof pCallBack.changeSelectedEntityEvent == "function") objData = pCallBack.changeSelectedEntityEvent(pEnv);
    else                                                          objData = pEnv.cesium.entity.device.data[pEnv.cesium.viewer.selectedEntity.properties.device];

    if (-1 < objData.current && objData.current < objData.entity._children.length) pEnv.cesium.viewer.selectedEntity = objData.entity._children[objData.current];
  }
},
/******************************************************************************/
/* nictCesium.searchJson                                                      */
/******************************************************************************/
searchJson : function(pEnv, pCallBack)
{
/*-----* create query *-------------------------------------------------------*/
  $("body").append("<div id='nict_cesium_message'><div id='nict_cesium_message_loading'><div></div><div></div><span></span><span></span></div></div>");

  var objQuery   = { d : $.nictCesium.createSelectTimesQuery(pEnv) };
  var objMinDate = new Date(pEnv.cesium.selectTimes[0                                 ].getTime()); objMinDate.setHours(0, 0, 0, 0);
  var objMaxDate = new Date(pEnv.cesium.selectTimes[pEnv.cesium.selectTimes.length - 1].getTime()); objMaxDate.setHours(0, 0, 0, 0);
  var intDiff    = Math.floor((objMaxDate.getTime() - objMinDate.getTime()) / (1000 * 60 * 60 *24)) + 1;
  var strFormat  = pEnv.cesium.selectTimesFormat;

  strFormat = strFormat.replace("%start" , $.nictCesium.formatDate(objMinDate, "%y/%mm/%dd"));
  strFormat = strFormat.replace("%end"   , $.nictCesium.formatDate(objMaxDate, "%y/%mm/%dd"));
  strFormat = strFormat.replace("%count" , intDiff);
  strFormat = strFormat.replace("%select", pEnv.cesium.selectTimes.length);

  $("#nict_cesium_select_times").text(strFormat).css("display", "");

  if (typeof pCallBack.searchJsonEvent == "object" && typeof pCallBack.searchJsonEvent.beforeEvent == "function") pCallBack.searchJsonEvent.beforeEvent(pEnv, objQuery);
/*-----* ajax *---------------------------------------------------------------*/
  $.ajax({ type : "POST", url : pEnv.server.jsonUrl, data : JSON.stringify(objQuery), contentType : "application/json", dataType : "json" }).done(function(pJson)
  {
    var intLength   = pJson.length;
    var intCounter  = intLength > pEnv.server.downloadLimit ? intLength - pEnv.server.downloadLimit : 0;
    var intStep     = Math.round(intLength / 100);
    var aryPosition = [];

    $("#nict_cesium_message_loading").find("span:eq(1)").text("/ " + intLength);
    $.nictCesium.removeEntity(pEnv, pCallBack);

    setTimeout(function _addEntity()
    {
      var i01;

      for (i01 = intCounter; i01 < intLength; i01++)
      {
        var objEntity = $.nictCesium.addEntity(pEnv, pCallBack, pJson[i01]);
        if (objEntity        != null                  ) aryPosition.push(objEntity.position._value);
        if (i01 - intCounter >  intStep               ) break;
        if ($("body").data("nictCesiumChangeDateStop")) break;
      }

      intCounter = i01 + 1;
      $("#nict_cesium_message_loading").find("span:first").text(intCounter);

      if ($("body").data("nictCesiumChangeDateStop"))
      {
        $("#nict_cesium_message").remove();
        $("body"                ).data  ("nictCesiumChangeDate", false);
      }
      else
      {
        if (intCounter < intLength)
          setTimeout(_addEntity, 0);
        else
        {
          if (intLength > pEnv.server.downloadLimit)
          {
            $.nictCesium.openDialog("download_limit", $("<div></div>"), $("<div>" + pEnv.server.downloadLimit + "</div>"), 150);
          }

          _after();
        }
      }
    }, 0);

    function _after()
    {
      if (pEnv.cesium.viewer.entities.values.length > 0)
      {
        pEnv.cesium.camera.position.height = null;

        pEnv.cesium.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(pEnv.cesium.viewer.camera.position),
        {
          offset   : new Cesium.HeadingPitchRange(pEnv.cesium.camera.position.heading, pEnv.cesium.camera.position.pitch, 0),
          duration : 0
        });

        pEnv.cesium.viewer.camera.flyToBoundingSphere(Cesium.BoundingSphere.fromPoints(aryPosition),
        {
          offset   : new Cesium.HeadingPitchRange(pEnv.cesium.camera.position.heading, pEnv.cesium.camera.position.pitch),
          complete : function() { pEnv.cesium.camera.position.height = pEnv.cesium.viewer.camera.positionCartographic.height; },
          cancel   : function() { pEnv.cesium.camera.position.height = pEnv.cesium.viewer.camera.positionCartographic.height; }
        });

        for (var strKey in pEnv.cesium.entity.device.data)
        {
          var objData   = pEnv.cesium.entity.device.data[strKey];
          var objParent = objData.entity;

               if (Cesium.JulianDate.greaterThan(objParent._children[0                             ].availability.start, pEnv.cesium.viewer.clock.currentTime)) objData.current = 0;
          else if (Cesium.JulianDate.   lessThan(objParent._children[objParent._children.length - 1].availability.start, pEnv.cesium.viewer.clock.currentTime)) objData.current = objParent._children.length - 1;
          else
          {
            if (Cesium.JulianDate.secondsDifference(pEnv.cesium.viewer.clock.currentTime                                  , objParent._children[0].availability.start)
            <   Cesium.JulianDate.secondsDifference(objParent._children[objParent._children.length - 1].availability.start, pEnv.cesium.viewer.clock.currentTime))
              objData.current = 0;
            else
              objData.current = objParent._children.length - 1;
          }
        }

        if (typeof pCallBack.searchJsonEvent == "object" && typeof pCallBack.searchJsonEvent.afterEvent == "function") pCallBack.searchJsonEvent.afterEvent(pEnv);
      }

      $("#nict_cesium_message").remove();
      $("body"                ).data  ("nictCesiumChangeDate", false);
    }
  }).fail(function(pJson)
  {
    $("#nict_cesium_message").remove();
    $("body"                ).data  ("nictCesiumChangeDate", false);
  });
},
/******************************************************************************/
/* nictCesium.addEntity                                                       */
/******************************************************************************/
addEntity : function(pEnv, pCallBack, pJson)
{
  if (typeof pCallBack.addEntityEvent != "function") return null;

  var objEntity = pCallBack.addEntityEvent(pEnv, pJson);

  if (objEntity == null) return null;

  if (objEntity.properties && objEntity.properties.device)
  {
    if (!(objEntity.properties.device in pEnv.cesium.entity.device.data))
    {
      pEnv.cesium.entity.device.data[objEntity.properties.device] = { entity : new Cesium.Entity(), current : 0 };
      pEnv.cesium.viewer.entities.add(pEnv.cesium.entity.device.data[objEntity.properties.device].entity);
      $("#nict_cesium_device .nict_cesium_list").append     ("<li id='nict_cesium_device_" + objEntity.properties.device + "' class='nict_cesium_select'>" + objEntity.properties.device + "</li>");
      $("#nict_cesium_device"                  ).removeClass("no_device");
    }

    objEntity.parent = pEnv.cesium.entity.device.data[objEntity.properties.device].entity;
  }

  var objResult = pEnv.cesium.viewer.entities.add(objEntity);

  if (typeof objEntity.parent == "object" && Array.isArray(objEntity.parent._children) && objEntity.parent._children.length > 1)
  {
    for (var i01 = objEntity.parent._children.length - 1; i01 > 0; i01--)
    {
      if (Cesium.JulianDate.greaterThan(objEntity.parent._children[i01 - 1].availability.start, objEntity.parent._children[i01].availability.start))
        objEntity.parent._children.splice(i01 - 1, 2, objEntity.parent._children[i01], objEntity.parent._children[i01 - 1]);
      else
        break;
    }
  }

  $.nictCesium.putLog(pEnv, "add point " + objEntity.name);
  return objResult;
},
/******************************************************************************/
/* nictCesium.removeEntity                                                    */
/******************************************************************************/
removeEntity : function(pEnv, pCallBack)
{
  $("#nict_cesium_device .nict_cesium_list").empty   ();
  $("#nict_cesium_device"                  ).addClass("no_device");
  pEnv.cesium.viewer.entities.removeAll();

  for (var strKey in pEnv.cesium.entity.device.data) delete pEnv.cesium.entity.device.data[strKey];

  if (typeof pCallBack.removeEntityEvent == "function") pCallBack.removeEntityEvent(pEnv);
},
/******************************************************************************/
/* nictCesium.createSelectTimesQuery                                          */
/******************************************************************************/
createSelectTimesQuery : function(pEnv)
{
  var aryQuery = [];
  var intIndex = 0;

  while (intIndex < pEnv.cesium.selectTimes.length)
  {
    var strQuery    = $.nictCesium.formatDate(pEnv.cesium.selectTimes[intIndex], "%y%mm%dd");
    var flgEveryDay = false;

    while (intIndex < pEnv.cesium.selectTimes.length - 1)
    {
      var objCurrent = new Date(pEnv.cesium.selectTimes[intIndex    ].getTime());
      var objNext    = new Date(pEnv.cesium.selectTimes[intIndex + 1].getTime());

      objCurrent.setDate(objCurrent.getDate() + 1);

      if (objCurrent.getTime() != objNext.getTime()) break;

      flgEveryDay = true;
      intIndex++;
    }

    if (flgEveryDay) strQuery += $.nictCesium.formatDate(pEnv.cesium.selectTimes[intIndex], ",%y%mm%dd");

    aryQuery.push(strQuery);
    intIndex++;
  }

  return aryQuery;
},
/******************************************************************************/
/* nictCesium.getQueryString                                                  */
/******************************************************************************/
getQueryString : function(pParameters)
{
  var objGetQueryString = {};

  for( var i01 = 0; i01 < pParameters.length; i01++)
  {
    var strKey   = decodeURIComponent(pParameters[i01].split("=")[0]);
    var strValue = decodeURIComponent(pParameters[i01].split("=")[1]);

    if (strKey in objGetQueryString)
    {
      if (Array.isArray(objGetQueryString[strKey])) objGetQueryString[strKey].push(strValue);
      else                                          objGetQueryString[strKey] = [objGetQueryString[strKey], strValue];
    }
    else
      objGetQueryString[strKey] = strValue;
  }

  return objGetQueryString;
},
/******************************************************************************/
/* nictCesium.formatDate                                                      */
/******************************************************************************/
formatDate : function(pDate, pFormatString, pTimeZone)
{
  var objDate   = new Date(pDate.getTime());
  var strResult = pFormatString;

  if (typeof pTimeZone == "string")
  {
    if (pTimeZone.indexOf("+") != -1) objDate = new Date(objDate.toISOString().replace(/\-/g, "/").replace("T", " ").replace(/\.\d+/, "").replace("Z", " " + pTimeZone.replace("+", "-")));
    else                              objDate = new Date(objDate.toISOString().replace(/\-/g, "/").replace("T", " ").replace(/\.\d+/, "").replace("Z", " " + pTimeZone.replace("-", "+")));
  }

  strResult = strResult.replace(/%y/g ,          objDate.getFullYear    ()      .toString(  ));
  strResult = strResult.replace(/%mm/g, ("0"  + (objDate.getMonth       () + 1)).slice   (-2));
  strResult = strResult.replace(/%m/g ,         (objDate.getMonth       () + 1) .toString(  ));
  strResult = strResult.replace(/%dd/g, ("0"  + (objDate.getDate        ()    )).slice   (-2));
  strResult = strResult.replace(/%d/g ,          objDate.getDate        ()      .toString(  ));
  strResult = strResult.replace(/%H/g , ("0"  +  objDate.getHours       ()     ).slice   (-2));
  strResult = strResult.replace(/%M/g , ("0"  +  objDate.getMinutes     ()     ).slice   (-2));
  strResult = strResult.replace(/%S/g , ("0"  +  objDate.getSeconds     ()     ).slice   (-2));
  strResult = strResult.replace(/%N/g , ("00" +  objDate.getMilliseconds()     ).slice   (-3));

  return strResult;
},
/******************************************************************************/
/** nictSTARSImageViewer.openDialog                                           */
/******************************************************************************/
openDialog : function(pId, pTitle, pBody, pHeight)
{
/*-----* Variable *-----------------------------------------------------------*/
  var $dialog = $("<div    id='nict_cesium_dialog_" + pId + "'></div>");
  var $frame  = $("<div class='nict_cesium_dialog_frame'      ></div>");
  var $header = $("<div class='nict_cesium_dialog_header'     ></div>");
  var $close  = $("<div class='nict_cesium_dialog_close'      ><i class='nict_cesium_dialog_close_icon'></i></div>");
/*-----* Create Dialog *------------------------------------------------------*/
  $header                        .append(pTitle.addClass("nict_cesium_dialog_title"));
  $header                        .append($close);
  $frame                         .append($header);
  $frame                         .append(pBody .addClass("nict_cesium_dialog_body"));
  $dialog                        .append($frame);
  $("#nict_cesium_dialog_" + pId).remove();
  $("body"                      ).append($dialog);
  $close                         .on    ("click", function(){ $("#nict_cesium_dialog_" + pId).remove(); return false; });
/*-----* Style *--------------------------------------------------------------*/
  $frame .css({ height     : pHeight  });
  pBody  .css({ visibility : "hidden" });

  setTimeout(function() { pBody.css({ visibility:"visible", overflowY:"scroll", height:($frame.outerHeight() - $header.outerHeight() - 30) + "px", WebkitOverflowScrolling:"touch" }); }, 300);

  return $dialog;
},
/******************************************************************************/
/* nictCesium.putLog                                                          */
/******************************************************************************/
putLog : function(pEnv, pMessage)
{
  if (pEnv.showLogConsole) console.log($.nictCesium.formatDate(new Date(), "%y/%mm/%dd %H:%M:%S.%N") + " " + pMessage);
},
/******************************************************************************/
/* nictCesium.isJson                                                     */
/******************************************************************************/
isJson : function(pJson)
{
  return (pJson instanceof Object && !(pJson instanceof Array)) ? true : false;
}
};})(jQuery);
