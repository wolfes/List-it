/**
 * View for Account Login/Registration.
 * Hastily moved in from Google Closure, could benefit from re-structuring.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

var L = L || {};
/** Maker Namespace */
L.make = L.make || {};
/** Mode Namespace */
L.mode = L.mode || {};

/**
 * View for User Account Information.
 */
L.make.AccountView = Backbone.View.extend({
  tagName: 'div',
  initialize: function() {
    //this.model.on('change:noteHeight', this.fixHeight, this);

    // Handle user validation response
    model.publisher.on(model.EventType.USER_VALIDATED, function(msg) {
      this.updateLoginSuccess_(msg.email);
    }, this);
    model.publisher.on(model.EventType.USER_INVALID, function(msg) {
      var status = 'Oops, are you sure that\'s your password?';
      this.updateLoginFailure_(msg.email, status);
    }, this);

    // Handle Server Reachability
    model.publisher.on(model.EventType.SERVER_UNREACHABLE, function(msg) {
      var status = '';
      if (navigator.onLine) {
        status = ('Oops, it looks like the server is down,<br/>' +
          'please try again in a little bit.');
      } else {
        status = 'Oops, it looks like you\'re offline.';
      }
      this.updateLoginFailure_(msg.email, status);
    }, this);

    model.publisher.on(model.EventType.USER_LOGIN_STATUS, function(msg) {
      if (msg.loggedIn) {
        this.updateLoginSuccess_(msg.email);
      } else {
        var status = '';
        this.updateLoginFailure_('', status);
      }
    }, this);

    // Handle User Logout Event
    model.publisher.on(model.EventType.LOGOUT, function(msg) {
      this.updateLogout_();
    }, this);

    model.publisher.on(model.EventType.REGISTER_SUCCESS, function(msg) {
      this.updateLoginSuccess_(msg.email);
    }, this);
    model.publisher.on(model.EventType.REGISTER_FAILURE, function(msg) {
      this.updateRegisterFailure_(msg.email);
    }, this);


    $('#showListLink').live('click', this.showListit);
  },
  render: function() {
    var portalBox = document.createElement('div');

    var portalTitle = document.createElement('span');
    portalTitle.className = 'itemTitle';
    portalTitle.innerHTML = 'Account Backup Service';
    portalBox.appendChild(portalTitle);

    var description = document.createElement('p');
    description.innerHTML = '' +
      '<a href=\'http://listit.csail.mit.edu/\'>List.it</a> ' +
      'is a <a href=\'http://code.google.com/p/list-it\'>free ' +
      'and open-source</a> note-taking tool from ' +
      '<a href=\'http://www.csail.mit.edu/\'>MIT CSAIL</a> that ' +
      'lets you safely, quickly, and easily write stuff down.';
    portalBox.appendChild(description);

    portalBox.innerHTML += '<ul>' +
      '<li>Access your notes online at ' +
      '<a href=\'https://welist.it/zen/index.html\'>List-it Zen</a>.</li>' +
      '<li>Free backup: your notes are safe.</li>' +
      '</ul>';

    var form = document.createElement('form');
    form.id = 'loginRegisterForm';
    form.className = 'loginForm';

    // User Email Label + Input.
    var emailLabel = document.createElement('div');
    emailLabel.className = 'inputLabel';
    emailLabel.innerHTML = 'Email:';
    form.appendChild(emailLabel);

    var emailInput = document.createElement('input');
    emailInput.id = 'email';
    emailInput.type = 'email';
    emailInput.name = 'email';
    emailInput.setAttribute('spellcheck', false);
    emailInput.setAttribute('required', '');
    emailInput.setAttribute('autofocus', '');
    form.appendChild(emailInput);

    // First password Label + Input.
    var passwordLabel = document.createElement('div');
    passwordLabel.className = 'inputLabel';
    passwordLabel.innerHTML = 'Password:';
    form.appendChild(passwordLabel);

    var passwordInput = document.createElement('input');
    passwordInput.id = 'pw1';
    passwordInput.type = 'password';
    passwordInput.name = 'pw1';
    passwordInput.setAttribute('spellcheck', false);
    passwordInput.setAttribute('required', '');
    form.appendChild(passwordInput);

    /**
     * Registration Info:
     */
    var registerInfoA = document.createElement('div');
    registerInfoA.className = 'registerPane registerOnly';
    registerInfoA.style.display = 'none';

    // Second password Label + Input (Registration Only).
    var passwordBLabel = document.createElement('div');
    passwordBLabel.className = 'inputLabel';
    passwordBLabel.innerHTML = 'Re-type Password:';
    registerInfoA.appendChild(passwordBLabel);

    var passwordBInput = document.createElement('input');
    passwordBInput.id = 'pw2';
    passwordBInput.type = 'password';
    passwordBInput.name = 'pw2';
    passwordBInput.setAttribute('spellcheck', false);
    passwordBInput.setAttribute('required', '');
    registerInfoA.appendChild(passwordBInput);

    form.appendChild(registerInfoA);

    // Login + Registration Status Outputs:
    var formStatus = document.createElement('div');
    formStatus.id = 'formStatus';
    formStatus.className = 'formStatus';
    formStatus.style.display = 'none';
    form.appendChild(formStatus);

    /**
     * Login / Register Buttons:
     */
    var loginButton = document.createElement('input');
    loginButton.id = 'loginButton';
    loginButton.type = 'button';
    loginButton.className = 'button';
    loginButton.value = 'Login';
    form.appendChild(loginButton);

    var logoutButton = document.createElement('input');
    logoutButton.id = 'logoutButton';
    logoutButton.type = 'button';
    logoutButton.className = 'button';
    logoutButton.style.display = 'none';
    logoutButton.value = 'Logout';
    form.appendChild(logoutButton);

    var registerButton = document.createElement('input');
    registerButton.id = 'registerButton';
    registerButton.type = 'button';
    registerButton.className = 'button';
    registerButton.value = 'New Account';
    form.appendChild(registerButton);

    portalBox.appendChild(form);

    var registerInfoB = document.createElement('div');
    registerInfoB.className = 'registerPane registerOnly';
    registerInfoB.style.display = 'none';


    // Study Description
    registerInfoB.innerHTML += '<p class='study_details'>' +
      '<b>Contribute to science!</b><br/> ' +
      'We are conducting research on note taking. <br /><br /> ' +
      'If you give us (researchers at MIT) permission to study your notes, ' +
      'you will be helping us better understand how people write ' +
      'information and enable us to build better tools.</p>';

    registerInfoB.innerHTML += '<p class=\'study_details\'>If you ' +
      'participate, your notes will be kept confidential to ' +
      '<i>the list.it group</i> and will not be divulged to ' +
      'anyone outside without your explicit (further) permission.</p>';


    // Study Participation Checkbox.
    var studyInput = document.createElement('input');
    studyInput.id = 'participate';
    studyInput.className = 'studyOption';
    studyInput.type = 'checkbox';
    studyInput.setAttribute('default', true);
    studyInput.setAttribute('checked', true);
    registerInfoB.appendChild(studyInput);

    var studyLabel = document.createElement('span');
    studyLabel.className = 'studyOption';
    studyLabel.innerHTML = 'Participate in research study?';
    registerInfoB.appendChild(studyLabel);

    form.appendChild(registerInfoB);

    this.setElement($(portalBox));
    return this.$el;
  },
  events: {
    'keyup #pw1': 'verifyPasswords',
    'keyup #pw2': 'verifyPasswords',

    'submit #loginRegisterForm': 'tryRegister_',

    'click #loginButton': 'tryLogin_',
    'click #logoutButton': 'logoutClicked',

    'click #registerButton': 'showRegister'
  },
  showListit: function() {
    L.views.showListit();
  },
  /**
   * Show form elements for login mode.
   */
  showLogin: function() {
    this.model.set('mode', L.mode.account.LOGIN);
    this.showModeElements_(this.model.get('mode'));
    $('#pw2')[0].required = false;
    this.verifyPasswords();
    $('#registerButton')[0].value = 'New Account';
    $('#registerButton')[0].type = 'button';
  },
  /**
   * Show form elements for register mode.
   */
  showRegister: function() {
    this.model.set('mode', L.mode.account.REGISTER);
    this.showModeElements_(this.model.get('mode'));
    $('#pw2')[0].required = true;
    $('#registerButton')[0].value = 'Create Account!';
    $('#registerButton')[0].type = 'submit';
  },
  /**
   * Hide all elts that are only for other modes and show this mode's elements.
   * @param {AccountPortal.ModeType.X} accountMode The mode to show.
   */
  showModeElements_: function(accountMode) {
    var loginElts = $('.loginOnly');
    var registerElts = $('.registerOnly');

    var loginDisplay = accountMode === L.mode.account.LOGIN ? '' : 'none';
    var showReg = accountMode === L.mode.account.REGISTER;
    var registerDisplay = showReg ? '' : 'none';

    // There aren't any loginOnly elts currently...
    for (var i = 0; i < loginElts.length; i++) {
      loginElts[i].style.display = loginDisplay;
    }
    for (var i = 0; i < registerElts.length; i++) {
      if (showReg) {
        $(registerElts[i]).slideDown();
      } else {
        $(registerElts[i]).slideUp();
      }
    }
  },
  /**
   * Verifies passwords.
   */
  verifyPasswords: function(event) {
    var pw1 = $('#pw1')[0];
    var pw2 = $('#pw2')[0];
    pw1.setCustomValidity('');
    pw2.setCustomValidity('');
    if (this.mode !== L.mode.account.REGISTER) {
      return;
    }
    // Look for something wrong with passwords:
    if (pw1.value.length < 4) {
      pw1.setCustomValidity(
        'Please choose a password with more than 3 characters.');
    } else if (pw1.value !== pw2.value) {
      pw2.setCustomValidity('Passwords do not match.');
    }
  },
  /**
   * Attempt to log the user in.
   * @param {object} event The submit event.
   * @private
   */
  tryLogin_: function(event) {
    event.preventDefault();
    debug('trying to log in');
    var email = $('#email')[0].value;
    var password = $('#pw1')[0].value;
    controller.validateUserLogin(email, password);
  },
  /**
   * Attempt to register the user.
   * @param {object} event The submit event.
   * @private
   */
  tryRegister_: function(event) {
    event.preventDefault();
    var email = $('#email')[0].value;
    var password = $('#pw1')[0].value;
    var couhes = $('#participate')[0].checked;
    controller.userSignup(email, password, couhes);
  },
  /**
   * Update login view with success.
   * @param {string} email The user's email.
   * @private
   */
  updateLoginSuccess_: function(email) {
    $('#email')[0].value = email;
    $('#pw1')[0].value = '';
    $('#pw2')[0].value = '';

    this.showValidStatus_(
        'You\'re logged in & syncing every 5 minutes!'
        );

    $('#loginButton')[0].style.display = 'none';
    $('#logoutButton')[0].style.display = '';
    this.showLogin();
  },
  /**
   * Update login view with failure.
   * @param {string} email The user's email.
   * @param {string} opt_msg Optional message to show.
   * @private
   */
  updateLoginFailure_: function(email, opt_msg) {
    if (email === '') {
      return; // No email: occurs on options page load.
    }
    $('#email')[0].value = email;
    $('#pw1')[0].value = '';
    $('#pw2')[0].value = '';
    $('#pw1')[0].focus();

    var msg = opt_msg || ('Uh oh, we were unable to sync: <br />' +
        'Check your password or internet connection?');
    this.showInvalidStatus_(msg);

    $('#loginButton')[0].style.display = '';
    $('#logoutButton')[0].style.display = 'none';
  },
  /**
   * Update register view with failure.
   * @param {string} email The user's email.
   * @private
   */
  updateRegisterFailure_: function(email) {
    $('#email')[0].value = email;
    //$('#pw1')[0].value = '';
    $('#pw2')[0].value = '';

    this.showInvalidStatus_(
        'This email is already registered, try logging in?'
        );
    $('#loginButton')[0].style.display = '';
    $('#logoutButton')[0].style.display = 'none';
  },
  /**
   * Update view due to logout event.
   * @private
   */
  updateLogout_: function() {
    $('#email')[0].value = '';
    $('#pw1')[0].value = '';
    $('#pw2')[0].value = '';

    //controller.logoutUser();

    this.showValidStatus_(
        'You\'re logged out!'
        );
    $('#loginButton')[0].style.display = '';
    $('#logoutButton')[0].style.display = 'none';

    //TODO(wstyke): showLogin?
    this.showLogin();
  },
  /**
   * Show valid form status text.
   * @param {string} status The status text to show.
   * @private
   */
  showValidStatus_: function(status) {
    var formStatus = $('#formStatus')[0];
    formStatus.innerHTML = status;

    $(formStatus).addClass('valid');
    $(formStatus).removeClass('invalid');
    $('#formStatus').slideDown();
  },
  /**
   * Show invalid form status text.
   * @param {string} status The status text to show.
   * @private
   */
  showInvalidStatus_: function(status) {
    var formStatus = $('#formStatus')[0];
    formStatus.innerHTML = status;
    $(formStatus).addClass('invalid');
    $(formStatus).removeClass('valid');
    $('#formStatus').slideDown();
  },
  /**
   * Called when logout button is clicked.
   * @param {object} clickEvent The button click event.
   */
  logoutClicked: function(clickEvent) {
    $('#loginButton')[0].style.display = '';
    $('#logoutButton')[0].style.display = 'none';
    controller.logoutUser();
  }
});
