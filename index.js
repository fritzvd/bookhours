// How much do you work.
var page = require('webpage').create();
var fs = require('fs');

var user, pass, myUrl, projects;

var getCredentials = function () {
  var data = fs.read('sso.json');
  data = JSON.parse(data);
  
  user = data.username;
  pass = data.password;
  projects = data.projects;
  myUrl = 'https://trs.lizard.net/'; //#' + HOURS;
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
    Object.keys(cred.projects).forEach(function (projectId) {
      console.log(projectId);
      var nxt = document.getElementById(projectId);
      nxt.value = cred.projects[projectId];
    });
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
      var result = page.evaluate(crawler, {projects: projects});
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
  if (status === 'success') {
    var result = page.evaluate(crawler, {
      user: user, 
      pass: pass,
      projects: projects
    });
    results(result);
  } else {
    //throw new Error(status)
    console.log('broken\n because: ', status);
    phantom.exit();
  }
});

