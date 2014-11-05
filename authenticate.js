module.exports = function (cred) {
  if (location.host === 'sso.lizard.net') {
    var lastli = $('.nav').find('li').last();
    if (lastli.text() !== 'Log out' ||
        lastli.text() !== 'Uitloggen') {
      $('#id_username').val(cred.user);
      $('#id_password').val(cred.pass);
      if ($('input.btn')[0].value === 'Log in' ||
          $('input.btn')[0].value === 'Inloggen') {
        document.querySelector('#login-form').submit();
        return 'logged in';
      }  
    }
  } else {
    return 'logged in';
  }
};
