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
const apiUrl = 'https://02ca2gksv2.execute-api.us-east-1.amazonaws.com/default/new-event';
const localStorageVariable = 'bc_tracker_utm';

function saveQueryParametersAsCookie() { 
  var referralHost = getReferrerUrl("hostname");
  var hostname = getUrl("hostname");
  var queryString = getUrl("query"); 
  if (queryString.indexOf(localStorageVariable) !== -1) {            
    queryString += "&created_at=" + getTimestamp();
    queryString += "&hostname=" + encodeUriComponent(hostname);           
    queryString += "&referral_hostname=" + encodeUriComponent(referralHost);       
    localStorage.setItem(localStorageVariable, "?"+queryString);
  }  
}
  
function sendEventToBCAPI(eventName) {
  var localStorageValue = localStorage.getItem(localStorageVariable);  
  sendPixel(apiUrl+encodeUriComponent(localStorageValue));
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

  saveQueryParametersAsCookie();
  
  if(data.bc_tag_event_name==="page_visit"){
    sendEventToBCAPI("page_visit");
  } else if(data.bc_tag_event_name==="add_to_cart"){
    sendEventToBCAPI("add_to_cart");
  } else if(data.bc_tag_event_name==="conversion"){
    sendEventToBCAPI("conversion");
  }
  
  data.gtmOnSuccess();
};

start(data);
