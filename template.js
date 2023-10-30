const log = require("logToConsole");
const Object = require("Object");
const JSON = require("JSON");
const decode = require('decodeUriComponent');
const getUrl = require('getUrl');
const getReferrerUrl = require('getReferrerUrl');
const localStorage = require('localStorage');
const sendPixel = require('sendPixel');
const encodeUriComponent = require('encodeUriComponent');
const getTimestamp = require('getTimestamp');

// default values
const apiUrl = 'https://02ca2gksv2.execute-api.us-east-1.amazonaws.com/default/v1/new-event';
const localStorageVariable = 'bc_tracker_utm';

function saveQueryParametersAsCookie() { 
  var queryString = getUrl("query"); 
  if (queryString.indexOf(localStorageVariable) !== -1) {            
    localStorage.setItem(localStorageVariable, "?"+queryString);
  }  
}
  
function sendEventToBCAPI(eventName) {
  var localStorageValue = localStorage.getItem(localStorageVariable); 
  var _referralHost = getReferrerUrl("hostname");
  var _hostname = getUrl("hostname");
  var created_at = "&created_at=" + getTimestamp();
  var hostname = "&hostname=" + encodeUriComponent(_hostname);           
  var referral_hostname = "&referral_hostname=" + encodeUriComponent(_referralHost);       
  var event_name = "&bc_tag_event_name="+eventName;
  if(localStorageValue){
    log(apiUrl+localStorageValue+created_at+hostname+referral_hostname+event_name);
    sendPixel(apiUrl+localStorageValue+created_at+hostname+referral_hostname+event_name);
  }  
}

const validate = (data) => {
  const errors = [];
  const warnings = [];
  // errors
  if (data.bc_tag_event_name !== "page_visit" && data.bc_tag_event_name !== "add_to_cart" && data.bc_tag_event_name !== "conversion") {
    errors.push("data.bc_tag_event_name not found");
  }  
  // warnings
  if (data.email) {

  }
  for (const msg of warnings) {
    log("[WARN] " + msg);
  }
  for (const msg of errors) {
    log("[ERROR] " + msg);
  }
  return errors;
};

const start = (data) => {
  
  const errors = validate(data);
  if (errors.length > 0) {
    log("errors:", errors);
    data.gtmOnFailure();
    return;
  }
  
  if(data.bc_tag_event_name==="page_visit"){
    log("sending blind creator tag page_visit event...");
    sendEventToBCAPI("page_visit");
  } else if(data.bc_tag_event_name==="add_to_cart"){
    log("sending blind creator tag add_to_cart event...");
    sendEventToBCAPI("add_to_cart");
  } else if(data.bc_tag_event_name==="conversion"){
    log("sending blind creator tag add_to_cart conversion...");
    sendEventToBCAPI("conversion");
  }
  
  data.gtmOnSuccess();
};

saveQueryParametersAsCookie();


start(data);
