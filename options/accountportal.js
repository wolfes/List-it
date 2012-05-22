/**
 * @filedesc Creates account login / register component.
 *
 * @author wstyke@gmail.com - Wolfe Styke
 */

goog.provide('AccountPortal');

/**
 * Create user login/register component.
 */
AccountPortal = function(opt_domHelper) {
  goog.ui.Component.call(this, opt_domHelper);
};
goog.inherits(AccountPortal, goog.ui.Component);


/**
 * Create DOM element for login/register component.
 *
 */
AccountPortal.prototype.createDom = function() {
  var portalBox = goog.dom.createElement('div'); 
  portalBox.id = 'service';
  portalBox.className ='item';
  
  // Add Title Section.
  var titleBox = goog.dom.createElement('div');
  titleBox.id = 'serviceTitle';
  titleBox.className = 'hbox';
  
  var loginTitle = goog.dom.createElement('div');
  loginTitle.id = 'loginTitle';
  loginTitle.className = 'flex center';
  loginTitle.innerHTML = '<h3>Login</h3>';
  titleBox.appendChild(loginTitle);

  var registerTitle = goog.dom.createElement('div');
  registerTitle.id = 'registerTitle';
  registerTitle.className = 'flex center';
  registerTitle.innerHTML = '<h3>Register</h3>';
  titleBox.appendChild(registerTitle);
  
  portalBox.appendChild(titleBox);

  // Add Form Section.
  var formBox = goog.dom.createElement('div');
  formBox.id = 'serviceContainer';
  
  var description = goog.dom.createElement('p');
  description.innerHTML = "" +
	"<a href='http://listit.csail.mit.edu/'>List.it</a> " +
	"is a <a href='http://code.google.com/p/list-it'>free " +
	"and open-source</a> note-taking tool from " +
	"<a href='http://www.csail.mit.edu/'>MIT CSAIL</a> that " +
	"lets you safely, quickly, and easily write stuff down.";
  formBox.appendChild(description);

  var form = goog.dom.createElement('form');
  form.id = 'loginRegisterForm';

  // User Email Label + Input.
  var emailLabel = goog.dom.createElement('div');
  emailLabel.className = 'label';
  emailLabel.innerText = 'Email:';
  form.appendChild(emailLabel);

  var emailInput = goog.dom.createElement('input');
  emailInput.id = 'email';
  emailInput.type = 'email';
  emailInput.name = 'email';
  emailInput.setAttribute('spellcheck', false);
  emailInput.setAttribute('required', '');
  emailInput.setAttribute('autofocus', '');
  form.appendChild(emailInput);

  // First password Label + Input.
  var passwordLabel = goog.dom.createElement('div');
  passwordLabel.className = 'label';
  passwordLabel.innerText = 'Password:';
  form.appendChild(passwordLabel);

  var passwordInput = goog.dom.createElement('input');
  passwordInput.id = 'pw1';
  passwordInput.type = 'password';
  passwordInput.name = 'pw1';
  passwordInput.setAttribute('spellcheck', false);
  passwordInput.setAttribute('required', '');
  form.appendChild(passwordInput);

  // Second password Label + Input (Registration Only).
  var passwordBLabel = goog.dom.createElement('div');
  passwordBLabel.className = 'label registerOnly';
  passwordBLabel.innerText = 'Password:';
  form.appendChild(passwordBLabel);

  var passwordBInput = goog.dom.createElement('input');
  passwordBInput.id = 'pw2';
  passwordBInput.className = 'registerOnly'
  passwordBInput.type = 'password';
  passwordBInput.name = 'pw2';
  passwordBInput.setAttribute('spellcheck', false);
  passwordBInput.setAttribute('required', '');
  form.appendChild(passwordBInput);


  // Login + Registration Status Outputs:
  var loginOutput = goog.dom.createElement('div');
  loginOutput.id = 'loginOutput'
  loginOutput.className = 'output loginOnly hide';
  form.appendChild(loginOutput);

  var registerOutput = goog.dom.createElement('div');
  registerOutput.id = 'registerOutput'
  registerOutput.className = 'output registerOnly hide';
  form.appendChild(registerOutput);
  
  
  // Login / Logout buttons.
  var loginOptions = goog.dom.createElement('div');
  loginOptions.className = 'center loginOnly';

  var loginButton = goog.dom.createElement('input');
  loginButton.id = 'loginButton';
  loginButton.setAttribute('type', 'submit');
  loginButton.value = " Login ";
  loginOptions.appendChild(loginButton);

  var logoutButton = goog.dom.createElement('input');
  logoutButton.id = 'logoutButton';
  logoutButton.setAttribute('type', 'button'); // Logout not a 'submit'.
  logoutButton.value = " Log Out & Remove Notes from Only This Computer ";
  logoutButton.style.display = 'none';
  loginOptions.appendChild(logoutButton);

  // Finished loginOptions: add to form.
  form.appendChild(loginOptions);


  // Registration Study Details / Register Button.
  var registerOptions = goog.dom.createElement('div');
  registerOptions.className = 'registerOnly';
  
  registerOptions.innerHTML += "<p class='study_details'><b>" +
	"Contribute to science!</b><br/> " +
	"We are conducting research on note taking. If you give us " +
	"permission to let us (researchers at MIT) study your notes, " +
	"you will be helping us better understand how people write " +
	"information and enable us to build better tools.</p>";
  
  registerOptions.innerHTML += "<p class='study_details'>If you " +
	"participate, your notes will be kept confidential to " +
	"<i>the list.it group</i> and will not be divulged to " +
	"anyone outside without your explicit (further) permission.</p>";
  
  // Study Participation Checkbox.
  var studyLabel = goog.dom.createElement('div');
  studyLabel.className = 'label';
  studyLabel.innerText = 'Participate in research study? ';
  registerOptions.appendChild(studyLabel);

  var studyInput = goog.dom.createElement('input');
  studyInput.id = 'participate';
  studyInput.type = 'checkbox';
  studyInput.setAttribute('default', true);
  registerOptions.appendChild(studyInput);

  
  // Register & Login Button.
  var registerButtonBox = goog.dom.createElement('div');
  registerButtonBox.className = 'center';
  var registerButton = goog.dom.createElement('input');
  registerButton.id = 'register';
  registerButton.type = 'submit';
  registerButton.value = 'Register & Login';
  registerButtonBox.appendChild(registerButton);
  registerOptions.appendChild(registerButtonBox);

  // Finished registerOptions: Add to form.
  form.appendChild(registerOptions);

  // Finished form: Add to formBox.
  formBox.appendChild(form);
  // Finished formBox: Add to portalBox.
  portalBox.appendChild(formBox);
  
  this.decorateInternal(portalBox);
};

/**
 * Decorates element with account login/register component.
 * @param {Object} element The element to decorate.
 */
AccountPortal.prototype.decorateInternal = function(element) {
  AccountPortal.superClass_.decorateInternal.call(this, element);
  this.element_ = element;
};

/**
 * Called when account portal is rendered into page.
 */
AccountPortal.prototype.enterDocument = function() {
  AccountPortal.superClass_.enterDocument.call(this);
  var this_ = this;


  this.showRegister(); // Default, but get login status.
  if (!controller.isChromeExt()) {
    controller.publishSyncSuccess();
  }

  //TODO(wstyke): Attach event listeners!

  // Password Verification
  goog.events.listen(goog.dom.getElement('pw1'),
		     goog.events.EventType.INPUT,
		     this.verifyPasswords, false, this);
  goog.events.listen(goog.dom.getElement('pw2'),
		     goog.events.EventType.INPUT,
		     this.verifyPasswords, false, this);

  goog.events.listen(goog.dom.getElement('loginRegisterForm'),
		     goog.events.EventType.SUBMIT,
		     this.accountAction, false, this);

  // Title Tabs:
  goog.events.listen(goog.dom.getElement('loginTitle'),
		     goog.events.EventType.CLICK,
		     this.showLogin, false, this);
  goog.events.listen(goog.dom.getElement('registerTitle'),
		     goog.events.EventType.CLICK,
		     this.showRegister, false, this);

  // Logout Button
  goog.events.listen(goog.dom.getElement('logoutButton'),
		     goog.events.EventType.CLICK,
		     this.logoutClicked, false, this);
  
  
  // Model Listeners
  /*
  model.publisher.subscribe(model.EventType.SYNC_SUCCESS, function(msg) {
    this.updateLoginSuccess_(msg.email);
  }, this);
  model.publisher.subscribe(model.EventType.SYNC_FAILURE, function(msg) {
    this.updateLoginFailure_(msg.email);
  }, this);*/

  model.publisher.subscribe(model.EventType.USER_VALIDATED, function(msg) {
    this.updateLoginSuccess_(msg.email);
  }, this);
  model.publisher.subscribe(model.EventType.USER_INVALID, function(msg) {
    var status = "Oops, are you sure that's your password?";
    this.updateLoginFailure_(msg.email, status);
  }, this);
  model.publisher.subscribe(model.EventType.SERVER_UNREACHABLE, function(msg) {
    var status = '';
    if (navigator.onLine) {
      status = ("Oops, it looks like the server is down,<br/>" + 
		"please try again in a little bit.");
    } else {
      status = "Oops, it looks like you're offline.";
    }
    this.updateLoginFailure_(msg.email, status);
  }, this);
  model.publisher.subscribe(model.EventType.USER_LOGIN_STATE, function(msg) {
    if (msg.loggedIn) {
      this.updateLoginSuccess_(msg.email);
    } else {
      var status = ''
      this.updateLoginFailure_('', status);
    }
  }, this);


  model.publisher.subscribe(model.EventType.LOGOUT, function(msg) {
    this.updateLogout();
  }, this);
  model.publisher.subscribe(model.EventType.REGISTER_SUCCESS, function(msg) {
    debug(msg); // DEPRECATED - Sync Success Used Instead.
    this.updateLoginSuccess_(msg.email);
  }, this);
  model.publisher.subscribe(model.EventType.REGISTER_FAILURE, function(msg) {
    this.updateRegisterFailure_(msg.email);
  }, this);

};

/**
 * Called when AccountPortal leaves html page
 * through AccountPortal.dispose().
 */
AccountPortal.prototype.exitDocument = function() {  
  //TODO(wstyke): Unlisten all other listeners.
};


/**
 * The Modes the Account Portal can be in.
 * @static (is this a property?)
 */
AccountPortal.ModeType = {
  LOGIN: 'login',
  REGISTER: 'register'
};

/**
 * Current mode of an Account Portal.
 */
AccountPortal.prototype.mode = AccountPortal.ModeType.REGISTER;

/**
 * Show form elements for login mode.
 */
AccountPortal.prototype.showLogin = function() {
  this.mode = AccountPortal.ModeType.LOGIN;
  this.showModeElements_(this.mode);
  goog.dom.classes.add(goog.dom.getElement('loginTitle'),
		       'selectedTitle');
  goog.dom.classes.remove(goog.dom.getElement('registerTitle'),
			  'selectedTitle');
  goog.dom.getElement('pw2').required = false;
  this.setPasswordValidity_(''); 
};

/**
 * Show form elements for register mode.
 */
AccountPortal.prototype.showRegister = function() {
  this.mode = AccountPortal.ModeType.REGISTER;
  this.showModeElements_(this.mode); 
  goog.dom.classes.add(goog.dom.getElement('registerTitle'),
		       'selectedTitle');
  goog.dom.classes.remove(goog.dom.getElement('loginTitle'),
			  'selectedTitle');
  goog.dom.getElement('pw2').required = true;
};

/**
 * Hide all elements that are only for other modes and show this mode's elements.
 * @param {AccountPortal.ModeType.X} accountMode The mode to show.
 */
AccountPortal.prototype.showModeElements_ = function(accountMode) {
  var loginElts = goog.dom.getElementsByClass('loginOnly');
  var registerElts = goog.dom.getElementsByClass('registerOnly');

  var loginDisplay = accountMode === AccountPortal.ModeType.LOGIN ? '' : 'none';
  var registerDisplay = accountMode === AccountPortal.ModeType.REGISTER ? '' : 'none';
  
  for (var i = 0; i < loginElts.length; i++) {
    loginElts[i].style.display = loginDisplay;
  }
  for (var i = 0; i < registerElts.length; i++) {
    registerElts[i].style.display = registerDisplay;    
  }
};

/**
 * Verifies form input passwords when in register mode.
 */
AccountPortal.prototype.verifyPasswords = function(event) {
  if (this.mode != AccountPortal.ModeType.REGISTER) {
    return; // Only verify when registering new user.
  }
  if (pw1.value !== pw2.value) {
    this.setPasswordValidity_('Passwords do not match.');
  } else if (pw1.value.length < 4) {
    this.setPasswordValidity_(
      'Please choose a password with more than 3 characters.');
  } else {
    this.setPasswordValidity_('');    
  }
};

/**
 * Set password input validity message.
 * @param {string} msg The invalid input message to show.
 * @private
 */
AccountPortal.prototype.setPasswordValidity_ = function(msg) {
  var pw1 = goog.dom.getElement('pw1');
  var pw2 = goog.dom.getElement('pw2');
  pw1.setCustomValidity(msg);
  pw2.setCustomValidity(msg);
};

/**
 * Handles login/register form submit.
 * @param {object} event The submit event.
 */
AccountPortal.prototype.accountAction = function(event) {
  debug('AccountPortal.accountAction()');
  if (this.mode === AccountPortal.ModeType.LOGIN) {
    this.login();
    event.preventDefault();
  } else if (this.mode === AccountPortal.ModeType.REGISTER) {
    this.register();
    event.preventDefault();
  } else {
    debug('AccountPortal instance: Account action in un-recognized mode.');
  }
};

/**
 * Sign in user and sync with server.
 */
AccountPortal.prototype.login = function() {
  var email = goog.dom.getElement('email').value;
  var password = goog.dom.getElement('pw1').value;

  controller.validateUserLogin(email, password);
  this.showValidLoginStatus(
    'Logging in! <br />' +
    'One moment while we fetch your notes.'
  );			    
  
};

/**
 * Register new user, sign in, pull notes.
 */
AccountPortal.prototype.register = function() {
  debug('AccountPortal.register()')
  var email = goog.dom.getElement('email').value;
  var password = goog.dom.getElement('pw1').value;
  var couhes = goog.dom.getElement('participate').checked;

  controller.userSignup(email, password, couhes);
};



/**
 * Update login state for options page.
 * @param {boolean} loggedIn True if user logged in.
 * @param {string} email The user's email or empty string.
 */
AccountPortal.prototype.updateLoginState = function(loggedIn, email) {
  if (loggedIn) {
    this.updateLoginSuccess_(email);
  } else {
    this.updateLoginFailure_(email);
  }
};


/**
 * Update login view with success.
 * @param {string} email The user's email.
 * @private
 */
AccountPortal.prototype.updateLoginSuccess_ = function(email) {
  debug('AccountPortal.updateLoginSuccess()');
  goog.dom.getElement('email').value = email;
  goog.dom.getElement('pw1').value = '';
  goog.dom.getElement('pw2').value = '';

  this.showValidLoginStatus(
    "You're logged in & syncing every 5 minutes!"
  );
  goog.dom.getElement('loginButton').style.display = 'none';
  goog.dom.getElement('logoutButton').style.display = '';

  this.showLogin();
};

/**
 * Update login view with failure.
 * @param {string} email The user's email.
 * @param {string} opt_msg Optional message to show.
 * @private
 */
AccountPortal.prototype.updateLoginFailure_ = function(email, opt_msg) {
  if (email === '') {
    return; // No email: occurs on options page load.
  }
  debug('AccountPortal.updateLoginFailure()');
  goog.dom.getElement('email').value = email;
  goog.dom.getElement('pw1').value = '';
  goog.dom.getElement('pw2').value = '';
  $('#pw1').focus();

  var msg = opt_msg || ('Uh oh, we were unable to sync: <br />' +
		        'Check your password or internet connection?');

  this.showInvalidLoginStatus(msg);
  goog.dom.getElement('loginButton').style.display = '';
  goog.dom.getElement('logoutButton').style.display = 'none';
};

/**
 * Update register view with failure.
 * @param {string} email The user's email.
 * @private
 */
AccountPortal.prototype.updateRegisterFailure_ = function(email) {
  debug('AccountPortal.updateRegisterFailure()');
  goog.dom.getElement('email').value = email;
  goog.dom.getElement('pw1').value = '';
  goog.dom.getElement('pw2').value = '';
  
  this.showInvalidRegisterStatus(
    'This email is already registered, try logging in?'
  );
  goog.dom.getElement('loginButton').style.display = '';
  goog.dom.getElement('logoutButton').style.display = 'none';
};

/**
 * Update view due to logout event.
 * @private
 */
AccountPortal.prototype.updateLogout = function() {
  goog.dom.getElement('email').value = '';
  goog.dom.getElement('pw1').value = '';
  goog.dom.getElement('pw2').value = '';

  this.showValidLoginStatus(
    "You're logged out!"
  );
  goog.dom.getElement('loginButton').style.display = '';
  goog.dom.getElement('logoutButton').style.display = 'none';

  this.showLogin();
};


/**
 * Show valid status text for login.
 * @param {string} status The status text to show.
 */
AccountPortal.prototype.showValidLoginStatus = function(status) {
  var loginStatus = goog.dom.getElement('loginOutput');
  loginStatus.innerHTML = status;
  goog.dom.classes.add(loginStatus, 'valid');
  goog.dom.classes.remove(loginStatus, 'invalid');
  goog.dom.classes.remove(loginStatus, 'hide');
};

/**
 * Show invalid status text for login.
 * @param {string} status The status text to show.
 */
AccountPortal.prototype.showInvalidLoginStatus = function(status) {
  var loginStatus = goog.dom.getElement('loginOutput');
  loginStatus.innerHTML = status;
  goog.dom.classes.add(loginStatus, 'invalid');
  goog.dom.classes.remove(loginStatus, 'valid');
  goog.dom.classes.remove(loginStatus, 'hide');
};

/**
 * Show valid status msg of registration.
 * @param {string} status Valid registration status to show.
 */
AccountPortal.prototype.showValidRegisterStatus = function(status) {
  var registerStatus = goog.dom.getElement('registerOutput');
  registerStatus.innerHTML = status;
  goog.dom.classes.add(registerStatus, 'valid');
  goog.dom.classes.remove(registerStatus, 'invalid');
  goog.dom.classes.remove(registerStatus, 'hide');
};

/**
 * Show invalid status msg of registration.
 * @param {string} status Invalid registration status.
 */
AccountPortal.prototype.showInvalidRegisterStatus = function(status) {
  var registerStatus = goog.dom.getElement('registerOutput');
  registerStatus.innerHTML = status;
  goog.dom.classes.add(registerStatus, 'invalid');
  goog.dom.classes.remove(registerStatus, 'valid');
  goog.dom.classes.remove(registerStatus, 'hide');
};

/**
 * Called when logout button is clicked.
 * @param {object} clickEvent The button click event.
 */
AccountPortal.prototype.logoutClicked = function(clickEvent) {
  goog.dom.getElement('loginButton').style.display = '';
  goog.dom.getElement('logoutButton').style.display = 'none';
  controller.logoutUser();
};

//TODO(wstyke): Finish adding event-listening responding code from
// options/views.js !!
