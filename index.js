// How much do you work.
var HOURS = 32; 


var page = require('webpage').create();
var fs = require('fs');

var user, pass, myUrl, projectId;

var getCredentials = function () {
  data = fs.read('sso.conf');

  user = data.split('\n')[0].split('=')[1];
  pass = data.split('\n')[1].split('=')[1];
  HOURS = data.split('\n')[2].split('=')[1];
  myUrl = 'https://trs.lizard.net/'; //#' + HOURS;
  projectId = data.split('\n')[3].split('=')[1];
};

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
    console.log(cred.projectId)
    var nxt = document.getElementById(cred.projectId);
    nxt.value = cred.hours;
    $('input.btn').click();
    return 'hours';
  } else {
    return 'location: ' + location.host;
  }
};

var results = function (result) {
  console.log(result);
  if (result === 'logging in') {
    setTimeout(function () {    
      var result = page.evaluate(crawler, {hours: HOURS, projectId: projectId});
      results(result);
    }, 4000);
  } else if ('hours'){
    setTimeout(function () {
      //phantom.exit();
    }, 4000);
  } else {
    console.log('something went wrong');
    //phantom.exit();
  }
};


page.onError = function(msg, trace) {
  var msgStack = ['PHANTOM ERROR: ' + msg];
  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function(t) {
      msgStack.push(' -> ' + (t.file || t.sourceURL) + ': ' + t.line + (t.function ? ' (in function ' + t.function +')' : ''));
        });
  }
  console.error(msgStack.join('\n'));
  phantom.exit(1);
};

//page.settings.userAgent = 'henkie'
console.log(page.settings.userAgent);
page.open(myUrl, function (status) {
  console.log(user, status, myUrl);
  //if (status === 'success') {
    var result = page.evaluate(crawler, {
      user: user, 
      pass: pass,
      projectId: projectId
    });
    results(result);
  //} else {
    //throw new Error(status)
    console.log('broken\n because: ', status);
    //phantom.exit();
  //}
});

