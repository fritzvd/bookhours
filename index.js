// How much do you work.
var HOURS = 32; 


var page = require('webpage').create();


var user, pass, myUrl;

var getCredentials = function () {
  data = fs.read('sso.conf')

  user = data.split('\n')[0].split('=')[1];
  pass = data.split('\n')[1].split('=')[1];
  HOURS = data.split('\n')[2].split('=')[1];
  myUrl = 'https://trs.lizard.net#' + HOURS;
};

var fs = require('fs');
getCredentials();


var crawler = function (cred) {
  if (location.host === 'sso.lizard.net') {
    var lastli = $('.nav').find('li').last();
    if (lastli.text() !== 'Log out' ||
        lastli.text() !== 'Uitloggen') {
      $('#id_username').val(cred.user);
      $('#id_password').val(cred.pass);
      if ($('input.btn')[0].value === 'Log in' ||
          $('input.btn')[0].value === 'Inloggen') {
        document.querySelector('#login-form').submit();
        return 'logging in';
      }  
    }
    
  } else if (location.host === 'trs.lizard.net' ||
             location.host === 'trs.nelen-schuurmans.nl') {
    var nxt = document.getElementById('id_intern.1414');
    nxt.value = cred.hours;
    $('input.btn').click();
    return 'hours';
  } else {
    return 'location: ' + location.host
  }
};

var results = function (result) {
  console.log(result);
  if (result === 'logging in') {
    setTimeout(function () {    
      var result = page.evaluate(crawler, {hours: HOURS});
      results(result);
    }, 4000);
  } else if ('hours'){
    setTimeout(function () {
      phantom.exit();
    }, 4000);
  } else {
    console.log('something went wrong');
    phantom.exit();
  }
};

page.open(myUrl, function (status) {
  console.log(user)
  if (status === 'success') {
    var result = page.evaluate(crawler, {
      user: user, 
      pass: pass});
    results(result);
  } else {
    console.log('broken', status);
    phantom.exit();
  }
});
