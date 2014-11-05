// How much do you work.
var HOURS = 32; 

var page = require('webpage').create();
var authenticate = require('./authenticate'); 
var user, pass, myUrl;

var getCredentials = function () {
  data = fs.read('sso.conf')

  user = data.split('\n')[0].split('=')[1];
  pass = data.split('\n')[1].split('=')[1];
  HOURS = data.split('\n')[2].split('=')[1];
  myUrl = 'https://trs.nelen-schuurmans.nl/persons/60/booking/2014-44/#' + HOURS;
};

var fs = require('fs');
getCredentials();

var houradjustment = function (cred) {
  if (location.host === 'trs.lizard.net' ||
             location.host === 'trs.nelen-schuurmans.nl') {
    var nxt = document.getElementById('id_intern.1414');
    nxt.value = 0;
    var urlEnd = location.pathname.split('/');
    var weeknr = parseInt(urlEnd[urlEnd.length - 2].split('-')[1]);
    var zetting = document.getElementById('id_P0116.2');
    zetting.value = cred.hours;
    
    $('input.btn').click();
    var thisone = {
      weeknr: weeknr,
      path: location.toString()
    };
    return thisone;
  } else {
    return 'location: ' + location.host
  }
};

var results = function (result) {
  if (!(result instanceof Object)) {
    console.log(result);
  } else {
    console.log(result.weeknr);
  }
  if (result === 'logged in') {
    setTimeout(function () {    
      var result = page.evaluate(houradjustment, {hours: HOURS});
      results(result);
    }, 4000);

  } else if  (result.weeknr > 10) {
      var newresult = openPage(page, result);
  } else if (result.weeknr === 10){
    setTimeout(function () {
      phantom.exit();
    }, 4000);
  } else {
    console.log('something went wrong');
    phantom.exit();
  }
};

var openPage = function (thisPage, result) {
  var url = result.path.split('-');
  url[url.length - 1] = result.weeknr - 1;
  var newUrl = url.join('-');
  thisPage.open(newUrl, function (status) {
    if (status === 'success') {
      var newresult = thisPage.evaluate(houradjustment, {hours: HOURS});
    setTimeout(function () {    
      results(newresult);
    }, 4000);
      //return result;
    }
  });
}

page.open(myUrl, function (status) {
  console.log(user)
  if (status === 'success') {
    var result = page.evaluate(authenticate, {
      user: user, 
      pass: pass});
    results(result);
  } else {
    console.log('broken', status);
    phantom.exit();
  }
});
