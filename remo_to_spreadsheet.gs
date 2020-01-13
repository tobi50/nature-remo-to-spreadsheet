

// Please get your access token from https://home.nature.global/
var REMO_ACCESS_TOKEN = 'YourAccessToken';

// Please set your spreadsheet url.
var SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/hogehoge/edit#gid=0'

// First, Exec this script to create new device sheet. Check new device sheet, and Set your device id.
var REMO_TARGET_DEVICE_ID = 'YourDeviceId'

// Second, Exec this script. Check data sheet (default is "remo_logs"). if you can check your device data, Congratuation!
// Finaly, Set Triger on your project to exec every XXX minutes or hours.



var REMO_BASE_URL = 'https://api.nature.global/1/'
var SPREADSHEET_DATA_SHEET_NAME = 'remo_logs'

function get_sensor_data(){
  
  const params = {
    "method" : "get",
    'headers': {'authorization': "Bearer " + REMO_ACCESS_TOKEN}
  };
  try {
    var response = UrlFetchApp.fetch(REMO_BASE_URL + '/devices', params);
  } catch(e){
    Logger.log("failed to connect.Check your Nature Remo Access Token Setting");
    Browser.msgBox("failed to connect.Check your Nature Remo Access Token Setting");
    return;
  }
    
  try {
    var devices = JSON.parse(response);
  } catch (e) {
    Logger.log("failed to parse response: " + response);
    Browser.msgBox("failed to parse response: " + response);
    return;
  }
  
  var newest_events = null;
  
  devices.forEach(function( value ) {
    if(value.id === REMO_TARGET_DEVICE_ID){
      newest_events = value.newest_events
    }
  })
  
  var sheet = SpreadsheetApp.openByUrl(SPREADSHEET_URL);
  if(newest_events === null){
    devices.forEach( function( device ) {
      var device_sheet_name = 'device_info_'+device.id
      var device_sheet = sheet.getSheetByName(device_sheet_name)
      if(!device_sheet){
        var device_list = [];
        for (var key in device) {
          device_list.unshift([key,device[key]]);
        };
        var new_device_sheet = sheet.insertSheet(device_sheet_name)
        new_device_sheet.getRange("A1:B"+device_list.length.toString(10)).setValues(device_list)
      }
    })
    
    Logger.log("failed to find target device. Please check device sheet and setting target device id.");
    Browser.msgBox("failed to find target device. Please check device sheet and setting target device id.");
    return;
  }
  
  var data_sheet = SpreadsheetApp.getActive().getSheetByName(SPREADSHEET_DATA_SHEET_NAME)
  if(!data_sheet){
    var new_data_sheet = sheet.insertSheet(SPREADSHEET_DATA_SHEET_NAME)
    new_data_sheet.getRange("A1:I1").setValues([["get_time","Temperature_Created_at","Temperature","Humidity_Created_at","Humidity","illumination_Created_at","illumination","movement_Created_at","movement"]])
    data_sheet = new_data_sheet
  }
  
  now = new Date()
  data_sheet.appendRow([
    now,
    _get_jst_datetime(newest_events.te.created_at),
    newest_events.te.val,
    _get_jst_datetime(newest_events.hu.created_at),
    newest_events.hu.val,
    _get_jst_datetime(newest_events.il.created_at),
    newest_events.il.val,
    _get_jst_datetime(newest_events.mo.created_at),
    newest_events.mo.val,
  ]);
}

function _get_jst_datetime(datetime){
  date = new Date(datetime);
  return date
}
