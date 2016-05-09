function checkLogin() {
	if (sessionStorage.user === '' || sessionStorage.user === undefined) {
		window.location.href = 'login.html';
	}
	else {
		$('#container').attr('style', '');
	}
}

function logout() {
	sessionStorage.user = '';
	window.location.href = 'login.html';
}

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
	var password = $('#password').val();
	if ([firstName, lastName, phone, email, address, city, zipCode, state, password].indexOf('') !== -1) {
		alert('You left an important field blank!');
	}
	else if (!(password === $('#passwordCheck').val())) {
		alert('Your passwords need to match!');
	}
	else {
		var key = firstName.toLowerCase() + lastName[0].toUpperCase() + lastName.substring(1);
		userRef.child(key).set({
			'firstName': firstName,
			'lastName': lastName,
			'password': password,
			'phone': phone,
			'email': email,
			'address': address,
			'city': city,
			'zipCode': zipCode,
			'state': state,
			'company': company,
			'companyPhone': companyPhone,
			'referral': referral,
			'admin': 'No'
		}, function(error) {
			if (error) {
				alert('Error creating user, contact admin.');
			}
			else {
				// sendMail(email, firstName, lastName);
				window.location.href = 'login.html';	
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
	    			sessionStorage.setItem("user", user.firstName + ' ' + user.lastName);
	    			if (user.admin === 'Yes') {
	    				window.location.href = 'admin.html';
	    			}
	    			else {
	    				window.location.href = 'index.html';
	    			}
	    			return true;
	    		}
	    		else {
	    			$(errorAlert('Wrong password.')).insertBefore('#email');
	    			return true;
	    		}
	    	}
	  	})) 
	  	{
	  		$(errorAlert('Email not found, create an account!')).insertBefore('#email');
		}
	});  
}

function errorAlert(text) {
	return "<div class='alert alert-danger alert-dismissable'>" + 
	"<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;</button>" + 
	"<strong>Error!</strong> " + text + "</div>"
}

function submitRequest(image) {
	var airplaneRef = new Firebase('https://chesapeake-airplane.firebaseio.com/airplanes');
	var make = $('#make').val();
	var model = $('#model').val();
	var mileage = $('#mileage').val();
	var regNum = $('#regNum').val();
	var year = $('#year').val();
	var condition = $('#condition').val();
	var owners = $('#owners').val();
	var buyer = $('#buyer').val();
	var use = $('#use').val();
	var company = $('#company').val();
	var companyPhone = $('#companyPhone').val();
	var referral = $('#referral').val();

	if ([make, model, mileage, regNum, year, condition, owners, buyer, use, company, companyPhone].indexOf('') !== -1) {
		alert('You left an important field blank!');
	}
	else {
		airplaneRef.child(regNum).set({
			'make': make,
			'model': model,
			'mileage': mileage,
			'regNum': regNum,
			'year': year,
			'condition': condition,
			'owners': owners,
			'buyer': buyer,
			'use': use,
			'company': company,
			'companyPhone': companyPhone,
			'referral': referral,
			'appraised': 'No',
			'offer': '',
			'date': '',
			'comments': '',
			'seller': sessionStorage.user,
			'image': image
		}, function(error) {
			if (error) {
				alert('Error submitting request, contact admin.');
			}
			else {
				window.location.href = "view_status.html"
			}
		});
	}
	airplaneRef.off();
}

function populateTable() {
	var airplaneRef = new Firebase('https://chesapeake-airplane.firebaseio.com/airplanes');

	airplaneRef.once('value', function(snapshot) {
		var i = 1;
		snapshot.forEach(function(childSnapshot) {
			var plane = childSnapshot.val();
			var make = plane.make;
			var model = plane.model;
			var mileage = plane.mileage;
			var regNum = plane.regNum;
			var seller = plane.seller;
			var appraised = plane.appraised;
			var template = "<td>" + make + "</td>" +
						   "<td>" + model + "</td>" +
						   "<td>" + mileage + "</td>" +
						   "<td type='regNum'>" + regNum + "</td>" +
						   "<td>" + seller + "</td>";
			if (appraised === 'Yes') {
				template += '<td><span class="label label-success label-mini">Done</span></td>';
			} else {
				template += '<td><span class="label label-danger label-mini">Incomplete</span></td>';
			}
			
			var row = document.createElement('tr');
			row.id = "tr" + i++;
			row.innerHTML = template;
			row.style = "cursor: pointer;";
			row.onclick = function () {
				num = $("#" + row.id + " td[type='regNum']")[0].innerHTML;
				console.log(num);
				window.location.href = "plane.html";
				sessionStorage.regNum = num;

			}
			$('#tableBody').append(row);
	  	});
	}); 
}

function populatePlane() {
	var airplaneRef = new Firebase('https://chesapeake-airplane.firebaseio.com/airplanes');
	var userRef = new Firebase('https://chesapeake-airplane.firebaseio.com/users');

	airplaneRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var plane = childSnapshot.val();

			if (sessionStorage.regNum === plane.regNum) {
				console.log("found! " + plane.seller);
				var key = plane.seller.split(' ')[0].toLowerCase() + plane.seller.split(' ')[1][0].toUpperCase() + plane.seller.split(' ')[1].substring(1);
				userRef.once('value', function(userSnapshot){
					userSnapshot.forEach(function(userNode) {
						var user = userNode.val();
						if (userNode.key() === key) {
							$('#company')[0].innerHTML = "<b>Company:</b> " + plane.company;
							$('#phone')[0].innerHTML = "<b>Phone:</b> " + user.phone;
							$('#address')[0].innerHTML = user.address;
							$('#state')[0].innerHTML = user.city + ", " + user.state + " " + user.zipCode;
							$('#make')[0].innerHTML = "<b>Make:</b> " + plane.make;
							$('#model')[0].innerHTML = "<b>Model:</b> " + plane.model;
							$('#mileage')[0].innerHTML = "<b>Mileage:</b> " + plane.mileage;
							$('#regNum')[0].innerHTML = "<b>Regulation #:</b> " + plane.regNum;
							$('#name')[0].innerHTML = "<b>" + plane.seller + "</b>";
							$('#condition')[0].innerHTML = "<b>Condition:</b> " + plane.condition;
							$('#use')[0].innerHTML = "<b>Intended Use:</b> " + plane.use;
							$('#owners')[0].innerHTML = "<b># of Owners:</b> " + plane.owners;
							$('#buyer')[0].innerHTML = "<b>Found a buyer: </b>" + plane.buyer;
							$('#referral')[0].innerHTML = "<b>Referral: </b>" + plane.referral;
							$('#planeImage').attr('src', plane.image)
							$('#appraisal').val(plane.offer);
							$('textarea').val(plane.comments);
							$('#date').val(plane.date);
						}
					});
				});
			}
	  	});
	}); 
}

function submitAppraisal() {
	var regNum = $('#regNum').text().split(' ')[2];
	var airplaneRef = new Firebase('https://chesapeake-airplane.firebaseio.com/airplanes/' + regNum);
	var comments = $('textarea').val();
	var appraisal = $('#appraisal').val();
	var date = $('#date').val();

	if ([appraisal, date, comments].indexOf('') !== -1) {
		alert('You left an important field blank!');
	}
	else {
		airplaneRef.child('comments').set(comments);
		airplaneRef.child('offer').set(appraisal);
		airplaneRef.child('date').set(date);
		airplaneRef.child('appraised').set('Yes');
		alert('Success!');
		window.location.href = "admin.html"
	}
}

function populateStatus() {
	var airplaneRef = new Firebase('https://chesapeake-airplane.firebaseio.com/airplanes');

	airplaneRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var plane = childSnapshot.val();

			if (sessionStorage.user === plane.seller) {
				var appraised = (plane.appraised === 'Yes') ? 'Appraised!' : 'Pending';
				if (plane.appraised === 'Yes'){
					var template = '<div class="row"><div class="col-md-10 col-md-offset-1"><div class="showback"><div class="row">' + 
						'<div class="col-sm-4"><img style="width: 100%" src="' + plane.image + '"/></div>' +
	                    '<div class="col-sm-7"><h4>' + plane.regNum + '</h4><h4><b>Status:</b> ' + appraised + '</h4>' +
	                    '<h5><b>Estimated Value:</b> ' + plane.offer + ' USD</h5><h5><b>Meeting Date:</b> ' + plane.date + '</h5>' +
	                    '<h5><b>Comments:</b> ' + plane.comments + '</h5>' +
	                  	'</div></div></div></div></div>';
	             }
	             else {
	             	var template = '<div class="row"><div class="col-md-10 col-md-offset-1"><div class="showback"><div class="row">' + 
						'<div class="col-sm-4"><img style="width: 100%" src="' + plane.image + '"/></div>' +
	                    '<div class="col-sm-7"><h4>' + plane.regNum + '</h4><h4><b>Status:</b> ' + appraised + '</h4>' +
	                    '<h5><b>Estimated Value:</b> N/A</h5><h5><b>Meeting Date:</b> N/A</h5>' +
	                    '<h5><b>Comments:</b> N/A</h5>' +
	                  	'</div></div></div></div></div>';
	             }     
				$('.wrapper').append(template);
			}
	  	});
	}); 
}

function upload() {
	if ($("#image")[0].files.length == 0) {
		alert("Upload an image!");
	}
	else {
	    var xhttp    = new XMLHttpRequest(),
	        fd       = new FormData();
	        file = $("#image")[0].files[0];

	    fd.append('image', file);
	    xhttp.open('POST', 'https://api.imgur.com/3/image');
	    xhttp.setRequestHeader('Authorization', 'Client-ID 144574cce5a4b62'); //Get yout Client ID here: http://api.imgur.com/
	    xhttp.onreadystatechange = function () {
	        if (xhttp.status === 200 && xhttp.readyState === 4) {
	            var res = JSON.parse(xhttp.responseText);
	            var image = res.data.link;
	            submitRequest(image);
	        }
	    };
	    xhttp.send(fd);
	}
}


function populateViewAircraft() {
	var airplaneRef = new Firebase('https://chesapeake-airplane.firebaseio.com/airplanes');
	var count = 0;
	airplaneRef.once('value', function(snapshot) {
		snapshot.forEach(function(childSnapshot) {
			var plane = childSnapshot.val();

			if (plane.appraised === 'Yes' ) {
				var template = '<div class="col-lg-4 col-md-4 col-sm-4 mb"><div class="content-panel pn">'
                				+ '<div id="profile-01" style="background-image: url(' + plane.image + ');">'
                  				+ '<h3>' + plane.make + ' ' + plane.model + '</h3><h6>' + plane.year + '</h6></div><div class="profile-01 centered">'
                  				+ '<p>$' + plane.offer + '</p></div></div></div>';

                var templateDiv = document.createElement('div');
                templateDiv.innerHTML = template;
                templateDiv.onclick = function () {
                	$('#make')[0].innerHTML = "<b>Make:</b> " + plane.make;
					$('#model')[0].innerHTML = "<b>Model:</b> " + plane.model;
					$('#mileage')[0].innerHTML = "<b>Mileage:</b> " + plane.mileage;
					$('#regNum')[0].innerHTML = "<b>Regulation #:</b> " + plane.regNum;
					$('#condition')[0].innerHTML = "<b>Condition:</b> " + plane.condition;
					$('#use')[0].innerHTML = "<b>Intended Use:</b> " + plane.use;
					$('#owners')[0].innerHTML = "<b># of Owners:</b> " + plane.owners;
					$('#buyer')[0].innerHTML = "<b>Found a buyer: </b>" + plane.buyer;
					$('#referral')[0].innerHTML = "<b>Referral: </b>" + plane.referral;
					$('#myModal').modal('show');
				};

				if (count == 0) {
					var card = document.createElement('div');
					card.setAttribute('class','row');
        			card.appendChild(templateDiv);
        			$('.wrapper').append(card);
				}
				else {
					$('.row').last().append(templateDiv);
				}
				count = (count + 1) % 3;
			}
	  	});
	}); 
}


