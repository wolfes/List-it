// Author: Wolfe Styke
// List-it Options Control Page

// Pass requests to background page for:

// Sync Service View Controllers
var syncView = { 
    disableInputs:function(disable) {
	gid('sync_email').disabled = disable;
	gid('sync_pass').disabled = disable;
    },

    showCancel:function() {
	$('#saveLogin').fadeOut(200, function () {
	    $('#cancelLogin').fadeIn(200, function() {})
	});
    },
    showLogin:function() {
	$('#cancelLogin').fadeOut(200, function () {
	    $('#saveLogin').fadeIn(200, function() {})
	});
    },

    getEmail:function() {
	return gid('sync_email').value;
    },
    getPass:function() {
	return gid('sync_pass').value;
    },

    setSyncData:function(email, password) {
	gid('sync_email').value = email;
	gid('sync_pass').value = password;
    },
    setStatusMsg:function(msg, valid) {
	if (valid) {
	    $('#sync_output').addClass('valid')
	} else {
	    $('#sync_output').removeClass('valid')
	}
	gid('sync_output').innerHTML = msg;
    },
    setSyncMsg:function(msg, valid) {
	return;

	$('#sync_request').fadeIn(300);
	if (valid) {
	    $('#sync_request').addClass('valid')
	} else {
	    $('#sync_request').removeClass('valid')
	}
	gid('sync_request').innerHTML = msg;
    }
};



// Registration View Controllers
var regView = { 
    setStatusMsg:function(msg, valid) {
	if (valid) {
	    $('#reg_output').addClass('valid')
	} else {
	    $('#reg_output').removeClass('valid')
	}
	gid('reg_output').innerHTML = msg;
    }
};