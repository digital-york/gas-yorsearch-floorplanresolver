// Script-as-app template.
function doGet(e) {
  
  /*
  
  Example Query String for testing: ?library_code=JBM&location_code=O&location_name=Morrell+-+Ordinary&call_number=SK+46+JAV%2FF
  Example query string returning multiple rows: ?library_code=JBM&location_code=O&location_name=Morrell+-+Ordinary&call_number=M
  
  ISSUES & IMPROVEMENTS:
  
  (1) Issue: Using newer IFRAME sandbox mode breaks the script for anoymous users. See https://code.google.com/p/google-apps-script-issues/issues/detail?id=4689
      and http://stackoverflow.com/questions/27948769/iframe-sandbox-mode-as-anonymous-user-500-internal-server-error
      EDIT: 02/02/2015: Seems to be working now - can no longer reproduce the problem
  
  (2) Issue: Potential abuse of the shelf mark GET parameter reflection e.g. ?library_code=JBM&location_code=O&location_name=Morrell+-+Ordinary&call_number=YO+u're+a+vagrant
      Reg ex filtering probably not possible because some items have odd shelf locations e.g. "Peggy Janiurek"
      document.referrer filter next best option but always returns undefined with NATIVE sandbox mode, and returns "https://script.google.com/*" in IFRAME mode. Gah!!!
      See http://stackoverflow.com/questions/27950791/google-apps-script-check-the-referring-url-of-the-request-standalone-web-app and
      https://code.google.com/p/google-caja/issues/detail?id=944
      
      Decided not too much of an issue as the same as possible in e.g. search engines.
  
  (3) Possible improvement: Experiment with "pin on a map" feature; use http://stackoverflow.com/questions/3901043/position-fixed-images-within-div-pins-on-map as the basis
  
  Note: Javascript MUST be turned on in both NATIVE and SANDBOX mode for the script to work. This isn't a limitation of this script, more of GA scripts in general. 
        Caja - the sanitization engine - filters <noscipt></noscript> tags, transforming them to <caja-v-noscript></caja-v-noscript>, see https://code.google.com/p/google-caja/issues/detail?id=99
  
  */
  
  var validParameters = false,
  skipHttp = false
  
  // Useful information on URL parameters at https://developers.google.com/apps-script/guides/web#url_parameters
  if (e.parameter.library_code) {
    var libraryCode = e.parameter.library_code
    validParameters = true
  } else var libraryCode = ""
  
  if (e.parameter.location_code) {
    var locationCode = e.parameter.location_code
    validParameters = true
  } else var locationCode = ""
  
  if (e.parameter.location_name) {
    var locationName = e.parameter.location_name
    validParameters = true
  } else var locationName = ""
  
  if (e.parameter.call_number) {
    var callNumber = e.parameter.call_number
    validParameters = true
  } else var callNumber = ""
  
  if (e.queryString == undefined || validParameters == false) {
    skipHttp = true
  }
    
  if (skipHttp == true) { 
    var heading = "No valid GET parameters",
    bodyText = "In order for this google script to work, at least one valid key/value pair must be provided in the URL query string",
    imageLink = "//placehold.it/300&text=No+valid+GET+params!"
  } else {
    var heading,
    bodyText,
    imageLink,
    httpResult
  }
  
  if (skipHttp == false) {
    try {
      var finalUrl = buildSqlUrl(libraryCode,locationCode,locationName,callNumber)
    } catch (err) {
      Logger.log("Build SQL error message: " + err.message + ", File: " + err.fileName + ", Line: " + err.lineNumber)
    }
 
   // Make the HTTP request
   try {
     Logger.log("First HTTP request: "+finalUrl)
     var theRequest = makeHttpRequest(finalUrl)
     httpResult = theRequest[0]
     heading = theRequest[1]
     bodyText = theRequest[2]
     imageLink = theRequest[3]
     
   } catch (err) {
     heading = "Service currently unavailable"
     bodyText = "We're sorry but the floorplan resolver is currently unavailable"
     Logger.log("Message: " + err.message + ", File: " + err.fileName + ", Line: " + err.lineNumber)
   }
   
   // Here we make a second attempt at finding a floorplan, in cases where querying on a 2 char shelfmark does not retrieve a row in the spreadsheet
   if ( httpResult == false && callNumber.match(/^[A-Z]{2,3}\s/) ) {
     var callNumber1char = callNumber.substr(0, 1) + " "
     try {
       var finalUrl = buildSqlUrl(libraryCode,locationCode,locationName,callNumber1char)
     } catch (err) {
       Logger.log("Build SQL error")
       Logger.log("Message: " + err.message + ", File: " + err.fileName + ", Line: " + err.lineNumber)
     }
     try {
       Logger.log("Second HTTP request: "+finalUrl)
       var theRequest = makeHttpRequest(finalUrl)
       httpResult = theRequest[0]
       heading = theRequest[1]
       bodyText = theRequest[2]
       imageLink = theRequest[3]
     } catch (err) {
       heading = "Service currently unavailable"
       bodyText = "We're sorry but the floorplan resolver is currently unavailable"
       Logger.log("Message: " + err.message + ", File: " + err.fileName + ", Line: " + err.lineNumber)
     }
   }
    
   // Here we make a third and final attempt at finding a floorplan, ommitting a shelfmark, in cases where querying on a 1 char shelfmark does not retrieve a row in the spreadsheet
   if ( httpResult == false && callNumber.length ) {
     try {
       var finalUrl = buildSqlUrl(libraryCode,locationCode,locationName,"")
     } catch (err) {
       Logger.log("Build SQL error")
       Logger.log("Message: " + err.message + ", File: " + err.fileName + ", Line: " + err.lineNumber)
     }
     try {
       Logger.log("Third HTTP request: "+finalUrl)
       var theRequest = makeHttpRequest(finalUrl)
       httpResult = theRequest[0]
       heading = theRequest[1]
       bodyText = theRequest[2]
       imageLink = theRequest[3]
     } catch (err) {
       heading = "Service currently unavailable"
       bodyText = "We're sorry but the floorplan resolver is currently unavailable"
       Logger.log("Message: " + err.message + ", File: " + err.fileName + ", Line: " + err.lineNumber)
     }
   } 
    
}
  var t = HtmlService.createTemplateFromFile('index');
  // Here we push variables into the template by assigning them as properties of the HtmlTemplate object - see https://developers.google.com/apps-script/guides/html/templates#pushing_variables_to_templates
  t.heading = heading
  t.bodyText = bodyText
  t.imageLink = imageLink
  t.callNumber = callNumber
  t.httpResult = httpResult
  // Using IFRAME sandbox mode returns a generic error for anonymous users, so we use NATIVE mode instead
  return t.evaluate().setSandboxMode(HtmlService.SandboxMode.IFRAME).setTitle('University Library - Floorplan');
}

function buildSqlUrl(libraryCode,locationCode,locationName,callNumber) {
	var regExp_AZ_1 = new RegExp("(^[A-Z]{1}\\s)", "gi"),
	regExp_AZ_23 = new RegExp("(^[A-Z]{2,3}\\s)", "gi"),
	queryBaseUrl = 'http://spreadsheets.google.com/tq?key=11VbCwEhnmY_dRxC_gY5BWc47AYS2AFqFYIfTaDFEklU&tq=',
	querySql = "select F, G, H where "
    
    // Here we build the SQL statement
	if (libraryCode.length) {
		querySql += "A = '"+libraryCode+"' and "
	}
	if (locationCode.length) {
		querySql += "B = '"+locationCode+"' and "
	}
	if (locationName.length) {
		querySql += "C = '"+locationName+"' and "
	}

    if (regExp_AZ_1.exec(callNumber)) {
		querySql += "D = '"+callNumber.substr(0, 1)+"' and "
	}
    else if (regExp_AZ_23.exec(callNumber)) {
        querySql += "D = '"+callNumber.substr(0, 2)+"' and "
    }
    // Handle shelfmarks for J and Y journals, and beginning 0
    else if (callNumber == 'J' || callNumber == 'Y' || callNumber.substr(0, 1) == '0') {
        querySql += "D = '"+callNumber.substr(0, 1)+"' and "
    }
    
    // Here we snip off the trailing 'and '
	if ( querySql.substring(querySql.length - 4 ) == "and " ) {
		querySql = querySql.substring(0, querySql.length - 4)
	}
    
    // Remove the pluses (+) from the querySql variable and trim the string
	var querySql = querySql.replace(/\+/g, " ").trim()
    Logger.log("buildSqlUrl returned (unencoded): " + querySql)
    querySql = encodeURIComponent(querySql)
    var finalUrl  = queryBaseUrl + querySql
    return finalUrl   
}

function makeHttpRequest(url) {
  var response = UrlFetchApp.fetch(url);
    if(response.getResponseCode() === 200) {
      
      // Strip out the unwanted characters in the JSON response
      var regExp_gv = /.*google.visualization.Query.setResponse\((.*)\)/

      // Assign the second part of the JSON response to the jsonContent var
      var jsonContent = regExp_gv.exec(response)[1];

      // Parse the var using JSON.parse and assign to objectContent var
      var objectContent = JSON.parse(jsonContent); 
  
      // Here lies some conditionals to check what the response contained and return an array
      if (objectContent.table.rows[0] && !objectContent.table.rows[1]) { 
        return [true, objectContent.table.rows[0].c[0].v, objectContent.table.rows[0].c[1].v,objectContent.table.rows[0].c[2].v ];  
      }
      else if (objectContent.table.rows[0] && objectContent.table.rows[1]) { 
        return [false, "Floorplan not found", "We are very sorry but we were unable to locate a floorplan at this time (multiple rows returned).", "//placehold.it/300&text=No+floorplan+found" ]
      }
      else { return [false, "Floorplan not found", "We are very sorry but we were unable to locate a floorplan at this time.", "//placehold.it/300&text=No+floorplan+found" ] }
      
   }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename)
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .getContent();
}