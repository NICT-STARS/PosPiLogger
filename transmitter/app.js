/******************************************************************************/
/* Raspberry Pi PosPiLogger Transmitter Client                                */
/* Copyright 2022 National Institute of Information and Communication Technology (NICT)  */
/******************************************************************************/
/******************************************************************************/
/* Initialize                                                                 */
/******************************************************************************/
/*-----* variable *-----------------------------------------------------------*/
var $package        = require("./package.json");
var $config         = require("config");
var $socketIoClient = require("socket.io-client");
var $httpProxyAgent = require("http-proxy-agent");
var $childProc      = require("child_process");
var $util           = require("util");
var $socketOption   = { path:$config.server.folder + "/socket.io" };
var $socket;
var $spawn          = null;
/*-----* console *------------------------------------------------------------*/
console.log("%s Version: %s"          , $package.description, $package.version);
console.log("");
console.log("Device Name: %s"         , $config.device);
console.log("Server Url: %s"          , $config.server.url);
console.log("Server Folder: %s"       , $config.server.folder);
console.log("Server Authorization: %s", $config.server.authorization.length > 0);
console.log("Get Log Command: %s %s"  , $config.getLog.command, $config.getLog.args.join(" "));
console.log("");
/*-----* create socket *------------------------------------------------------*/
if ($config.server.authorization.length > 0)
{
  var objBuffer = new Buffer($config.server.authorization);
  $socketOption.extraHeaders = { Authorization:"Basic " + objBuffer.toString("base64") };
}

     if ($config.server.url.slice(0, 5) == "http:"  && process.env.http_proxy ) $socketOption.agent = new $httpProxyAgent(process.env.http_proxy );
else if ($config.server.url.slice(0, 6) == "https:" && process.env.https_proxy) $socketOption.agent = new $httpProxyAgent(process.env.https_proxy);

$socket = $socketIoClient.connect($config.server.url, $socketOption);
putLog("web socket client start");
/******************************************************************************/
/* Client Socket                                                              */
/******************************************************************************/
/*-----* connect *------------------------------------------------------------*/
$socket.on("connect", function()
{
  putLog("begin connection");
  sendLog();
});
/*-----* disconnect *---------------------------------------------------------*/
$socket.on("disconnect", function()
{
  if ($spawn) process.kill(-$spawn.pid);
  putLog("end connection");
});
/******************************************************************************/
/* sendLog                                                                    */
/******************************************************************************/
function sendLog()
{
  putLog($util.format("exec command [ %s %s ]", $config.getLog.command, $config.getLog.args.join(" ")));
  var strBuffer = "";

  $spawn = $childProc.spawn($config.getLog.command, $config.getLog.args, { detached:true });
/*-----* stdout *-------------------------------------------------------------*/
  $spawn.stdout.on("data", function(pStream)
  {
    strBuffer += pStream;

    while (strBuffer.indexOf("\n") > -1)
    {
      var strData = strBuffer.split("\n")[0];

      if (strData.slice(0, 1) == "{" && strData.slice(-1) == "}")
      {
        try
        {
          var objJson = JSON.parse(strData);
          objJson.device = $config.device;
          $socket.json.emit("log", objJson);
          putLog($util.format("send log [ %s ]", JSON.stringify(objJson)));
        }
        catch (e)
        {
          putLog(e);
        }
      }

      strBuffer = strBuffer.substr(strBuffer.indexOf("\n") + 1);
    }
  });
/*-----* stderr *-------------------------------------------------------------*/
  $spawn.stderr.on("data", function(pStream)
  {
    putLog(pStream);
  });
/*-----* exit *---------------------------------------------------------------*/
  $spawn.on("exit", function(pCode, pSignal)
  {
    putLog($util.format("exit command code=%d signal=%s", pCode, pSignal));
    if (pCode == 0 && !pSignal) setTimeout(function(){ sendLog(); }, 1000);
  });
};
/******************************************************************************/
/* SIGINT Hundler                                                             */
/******************************************************************************/
process.on("SIGINT", function()
{
  console.log("");
  $socket.close();
  putLog("web socket client stop");
  process.stdin.pause();
  process.exit();
});
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
