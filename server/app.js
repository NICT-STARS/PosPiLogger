/******************************************************************************/
/* Raspberry Pi PosPiLogger Server                                            */
/* Copyright 2022 National Institute of Information and Communication Technology (NICT)  */
/******************************************************************************/
/******************************************************************************/
/* Initialize                                                                 */
/******************************************************************************/
/*-----* variable *-----------------------------------------------------------*/
var $package         = require("./package.json");
var $config          = require("config");
var $express         = require("express");
var $http            = require("http");
var $bodyParser      = require("body-parser");
var $socketIo        = require("socket.io");
var $mongoDb         = require("mongodb");
var $async           = require("async");
var $util            = require("util");
var $application     = $express();
var $httpServer      = $http.Server($application);
var $socket          = $socketIo($httpServer);
var $transmitterNs   = $socket.of($config.transmitterNamespace);
var $userInterfaceNs = $socket.of($config.userInterfaceNamespace);
var $mongoClient     = $mongoDb.MongoClient;
var $jsonWriterQue   = $async.queue(saveJson);
/*-----* console *------------------------------------------------------------*/
console.log("%s Version: %s"             , $package.description, $package.version);
console.log("");
console.log("Port: %d"                   , $config.port);
console.log("UserInterface Namespace: %s", $config.userInterfaceNamespace);
console.log("Transmitter   Namespace: %s", $config.  transmitterNamespace);
console.log("MongoDB Host: %s"           , $config.mongoDb.host);
console.log("MongoDB DataBase: %s"       , $config.mongoDb.database);
console.log("MongoDB Collection: %s"     , $config.mongoDb.collection);
console.log("");
/*-----* http server *--------------------------------------------------------*/
$socket     .set   ("heartbeat timeout" , 20000);
$socket     .set   ("heartbeat interval", 20000);
$httpServer .listen($config.port, function(){ putLog("http server start"); });
$application.use   ($express.static(__dirname + "/public"));
$application.use   ($bodyParser.urlencoded({ extended : true }));
$application.use   ($bodyParser.json      ());
$application.get   ("/data", function(pRequest, pResponse) { putJson(pRequest.query, pResponse); });
$application.post  ("/data", function(pRequest, pResponse) { putJson(pRequest.body , pResponse); });
/******************************************************************************/
/* Transmitter Namespace                                                      */
/******************************************************************************/
/*-----* connect *------------------------------------------------------------*/
$transmitterNs.on("connection",function(pSocket)
{
  putLog($util.format("begin connection from %s %s", pSocket.id, pSocket.handshake.address));
/*-----* recv(log) *----------------------------------------------------------*/
  pSocket.on("log", function(pJson)
  {
    if (!isJson(pJson)) return;

    putLog($util.format("recv log from %s", pSocket.id));

    var objDate = new Date();

    pJson.time = objDate.toISOString();

    if (typeof pJson.GNSS == "object" && typeof pJson.GNSS.time == "string")
    {
      var objGpsDate = new Date(pJson.GNSS.time);

      if (objDate.getFullYear() == objGpsDate.getFullYear() && objDate.getMonth() == objGpsDate.getMonth() && objDate.getDate() == objGpsDate.getDate())
      {
        $userInterfaceNs.json.emit("transmitter.log", pJson);
        putLog($util.format("send transmitter.log to %s [ %s ]", $config.userInterfaceNamespace, JSON.stringify(pJson)));
      }
    }

    $jsonWriterQue.push(pJson);
  });
/*-----* disconnect *---------------------------------------------------------*/
  pSocket.once("disconnect", function()
  {
    putLog($util.format("end from %s", pSocket.id));
  });
});
/******************************************************************************/
/* UserInterface Namespace                                                    */
/******************************************************************************/
/*-----* connect *------------------------------------------------------------*/
$userInterfaceNs.on("connection",function(pSocket)
{
  putLog($util.format("begin connection from %s %s", pSocket.id, pSocket.handshake.address));
/*-----* disconnect *---------------------------------------------------------*/
  pSocket.once("disconnect", function()
  {
    putLog($util.format("end from %s", pSocket.id));
  });
});
/******************************************************************************/
/* SIGINT Hundler                                                             */
/******************************************************************************/
process.on("SIGINT", function()
{
  console    .log  ("");
  $socket    .close();
  $httpServer.close();
  putLog("http server stop");
  process.stdin.pause();
  process.exit();
});
/******************************************************************************/
/* saveJson                                                                   */
/******************************************************************************/
function saveJson(pJson, pCallback)
{
  $mongoClient.connect("mongodb://" + $config.mongoDb.auth + "@" + $config.mongoDb.host + "/" + $config.mongoDb.database, function(pErr, pClient)
  {
    if (pErr)
    {
      putLog("mongodb connection error. " + pErr);
      pCallback();
      return;
    }

    pClient.db($config.mongoDb.database).collection($config.mongoDb.collection, { strict:true }, function(pErr, pCollection)
    {
      if (pErr)
      {
        putLog("mongodb collection error. " + pErr);
        pClient.close();
        pCallback();
        return;
      }

      pCollection.insertOne(pJson, function(pErr, pResult)
      {
        if (pErr) putLog("mongodb insert error. " + pErr);
        pClient.close();
        pCallback();
      });
    });
  });
}
/******************************************************************************/
/* putJson                                                                    */
/******************************************************************************/
function putJson(pParam, pResponse)
{
/*-----* create filter *------------------------------------------------------*/
  pResponse.header("Content-Type", "application/json; charset=UTF-8");

  var objFilter;

  if (Array.isArray(pParam.d))
  {
    objFilter = { $or : [] };

    for (var i01 = 0; i01 < pParam.d.length; i01++)
    {
      var aryDates = pParam.d[i01].indexOf(",") > -1 ? pParam.d[i01].split(",") : [pParam.d[i01]];
      var objStart;
      var objEnd;

           if (aryDates.length == 2 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/) && typeof aryDates[1] == "string" && aryDates[1].match(/^\d{8}$/))
      {
        objStart = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));
        objEnd   = new Date(aryDates[1].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 23:59:59"));
      }
      else if (aryDates.length == 1 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/))
      {
        objStart = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));
        objEnd   = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 23:59:59"));
      }
      else
      {
        pResponse.send("[]");
        return;
      }

      if (isNaN(objStart.getTime())) { pResponse.send("[]"); return; }
      if (isNaN(objEnd  .getTime())) { pResponse.send("[]"); return; }

      var strStart = objStart.toISOString().replace(/\..+$/, "Z");
      var strEnd   = objEnd  .toISOString().replace(/\..+$/, "Z");

      objFilter.$or.push({ "GNSS.time" : { $gte : strStart, $lte : strEnd } });
    }
  }
  else if (typeof pParam.d == "string")
  {
    var aryDates = pParam.d.indexOf(",") > -1 ? pParam.d.split(",") : [pParam.d];
    var objStart;
    var objEnd;

         if (aryDates.length == 2 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/) && typeof aryDates[1] == "string" && aryDates[1].match(/^\d{8}$/))
    {
      objStart = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));
      objEnd   = new Date(aryDates[1].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 23:59:59"));
    }
    else if (aryDates.length == 1 && typeof aryDates[0] == "string" && aryDates[0].match(/^\d{8}$/))
    {
      objStart = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 00:00:00"));
      objEnd   = new Date(aryDates[0].replace(/^(\d{4})(\d{2})(\d{2})$/, "$1/$2/$3 23:59:59"));
    }
    else
    {
      pResponse.send("[]");
      return;
    }

    if (isNaN(objStart.getTime())) { pResponse.send("[]"); return; }
    if (isNaN(objEnd  .getTime())) { pResponse.send("[]"); return; }

    var strStart = objStart.toISOString().replace(/\..+$/, "Z");
    var strEnd   = objEnd  .toISOString().replace(/\..+$/, "Z");

    objFilter = { "GNSS.time" : { $gte : strStart, $lte : strEnd } };
  }
  else
  {
    pResponse.send("[]");
    return;
  }
/*-----* response *-----------------------------------------------------------*/
  $mongoClient.connect("mongodb://" + $config.mongoDb.auth + "@" + $config.mongoDb.host + "/" + $config.mongoDb.database, function(pErr, pClient)
  {
    if (pErr)
    {
      putLog("mongodb connection error. " + pErr);
      pResponse.send("[]");
      return;
    }

    pClient.db($config.mongoDb.database).collection($config.mongoDb.collection, { strict:true }, function(pErr, pCollection)
    {
      if (pErr)
      {
        putLog("mongodb collection error. " + pErr);
        pResponse.send("[]");
        pClient.close();
        return;
      }

      pCollection.find(objFilter, { projection : { "_id" : 0 } }).toArray(function(pErr, pDocument)
      {
        if (pErr)
        {
          putLog("mongodb find error. " + pErr);
          pResponse.send("[]");
        }
        else
        {
          if (pParam.format) pResponse.send(JSON.stringify(pDocument, null, 2));
          else               pResponse.send(JSON.stringify(pDocument));

          putLog("mongodb find [ " + JSON.stringify(objFilter) + " ]");
        }

        pClient.close();
      });
    });
  });
}
/******************************************************************************/
/* isJson                                                                     */
/******************************************************************************/
function isJson(pJson)
{
  return (pJson instanceof Object && !(pJson instanceof Array)) ? true : false;
}
/******************************************************************************/
/* formatDate                                                                 */
/******************************************************************************/
function formatDate(pDate, pFormatString, pTimeZone)
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
}
/******************************************************************************/
/* putLog                                                                     */
/******************************************************************************/
function putLog(pMessage)
{
  var objDate = new Date();
  console.log("%s %s", formatDate(objDate, "%y/%mm/%dd %H:%M:%S.%N"), pMessage);
}
