function generatePassword() {
	var randomstring = Math.random().toString(36).slice(-8);
	return randomstring;
}

function createUser() {
	var userRef = new Firebase('https://chesapeake-airplane.firebaseio.com/users');
	var firstName = $('#first').val();
	var lastName = $('#last').val();
	var phone = $('#phone').val();
	var email = $('#email').val();
	var address = $('#address').val();
	var city = $('#city').val();
	var zipCode = $('#zipcode').val();
	var state = $('#state').val();
	var company = $('#company').val();
	var companyPhone = $('#companyPhone').val();
	var referral = $('#referral').val();
	if ([firstName, lastName, phone, email, address, city, zipCode, state].indexOf('') !== -1) {
		alert('You left an important field blank!');
	}
	else {
		var key = firstName.toLowerCase() + lastName[0].toUpperCase() + lastName.substring(1);
		userRef.child(key).set({
			'firstName': firstName,
			'lastName': lastName,
			'password': generatePassword(),
			'phone': phone,
			'email': email,
			'address': address,
			'city': city,
			'zipCode': zipCode,
			'state': state,
			'company': company,
			'companyPhone': companyPhone,
			'referral': referral
		}, function(error) {
			if (error) {
				alert('Error creating user, contact admin.');
			}
			else {
				// sendMail(email, firstName, lastName);
				window.location.replace('login.html');	
			}
		});
	}
	userRef.off();
}

function validateUser(email, password) {
	var userRef = new Firebase('https://chesapeake-airplane.firebaseio.com/users');

	userRef.once('value', function(snapshot) {
		if (!snapshot.forEach(function(childSnapshot) {
			var user = childSnapshot.val();
	    	if (user.email === email) {
	    		if (user.password === password) {
	    			window.location.replace('index.html');
	    			return true;
	    		}
	    		else {
	    			$(errorAlert('Wrong password.')).insertBefore('#email');
	    			return true;
	    		}
	    	}
	  	})) {
	  		$(errorAlert('Email not found, create an account!')).insertBefore('#email');
		}
	});  
}

function errorAlert(text) {
	return "<div class='alert alert-danger alert-dismissable'>" + 
	"<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" + 
	"<strong>Error!</strong> " + text + "</div>"
}
