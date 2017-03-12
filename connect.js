const remote = require('electron').remote,
			path = remote.getGlobal('path'),
			{ipcRenderer} = require('electron'),
			http = require('http'),
			https = require('https'),
			fs = require('fs'),
      $ = require('jquery'),

			user = "{132643DA-4EFF-439C-847E-4AD7554D3D7A}",
			kiosk = "{9ABD7B37-35FE-4174-B2D5-85A2A9B92693}",
			campaign = 'prkentwood',
			keyword = 'prkentwood',

			first = document.getElementById('first'),
			last = document.getElementById('last'),
			birthdate = document.getElementById('birthdate'),
			mobile = document.getElementById('mobile'),
			email = document.getElementById('email'),

			logButton = document.getElementById('logModalButton'),
			submitButton = document.getElementById('submitButton'),
			pointButton = document.getElementById('pointsButton'),
      hideButton = document.getElementById('hideButton'),
			pauseBox = document.getElementById('pauseBox');

var post_mobile = [],
		isPaused = false,
		inputs = document.getElementsByTagName('input'),
		timer = window.setInterval(function() {
			if (!isPaused) {
				getStuff();
			}
		}, 10000);

function ipcFunction() {
	ipcRenderer.messaging = {
    sendShrink: function() {
			ipcRenderer.send('shrink-window', 'an-argument')
		},
		sendGrow: function() {
			ipcRenderer.send('grow-window', 'an-argument')
		},
		sendOpenLogWindow: function() {
			ipcRenderer.send('open-second-window', 'an-argument')
		},
		sendCloseLogWindow: function() {
			ipcRenderer.send('close-second-window', 'an-argument')
		},

		init: function() {
      var shrunk = false;
			hideButton.addEventListener('click', function() {
        if (!shrunk) {
          $('.to-hide').addClass('hidden');
  				ipcRenderer.messaging.sendShrink();
          shrunk = true;
        } else {
          $('.to-hide').removeClass('hidden');
          ipcRenderer.messaging.sendGrow();
          shrunk = false;
        }
			});
			logButton.addEventListener('click', function() {
				ipcRenderer.messaging.sendOpenLogWindow();
			});
		}
	};
  ipcRenderer.messaging.init();
}

ipcFunction();

Element.prototype.setAttributes = function (attrs) {
    for (var idx in attrs) {
        if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
            for (var prop in attrs[idx]){this.style[prop] = attrs[idx][prop];}
        } else if (idx === 'html') {
            this.innerHTML = attrs[idx];
        } else {
            this.setAttribute(idx, attrs[idx]);
        }
    }
};

function getStuff() {
	http.get('http://www.repleotech.com/gateway/kiosk_last_checkin.asp?kiosk=' + kiosk + '&user_guid=' + user, function (res) {

		var statusCode = res.statusCode,
			contentType = res.headers['content-type'];
		var error;
		if (statusCode !== 200) {
			error = new Error("Request Failed.\n" +
				"Status Code: " + statusCode);
		}
		if (error) {
			console.log(error.message);
			res.resume();
			return
		}

		res.setEncoding('utf8');
		var rawData = '';
		res.on('data', function (chunk) {
			return rawData += chunk;
		});
		res.on('end', function () {
			try {
				var parsedData = JSON.parse(rawData),
					phone = parsedData.mobile.toString(),
					phoneArea = phone.substring(0, 3),
					phoneThree = phone.substring(3, 6),
					phoneFour = phone.substring(6, 10),
					parsedPhone = "(" + phoneArea + ") " + phoneThree + "-" + phoneFour;

				post_mobile[0] = parsedData.mobile;

				function inputGen(parsedKey, element, inputId, placeholder, type) {
					if (parsedKey === undefined) {
						var input = document.createElement('input'),
						child = element.firstChild;
						input.setAttributes({
							'id': inputId,
							'placeholder': placeholder,
							'type': type
						});
						element.innerHTML = '';
						element.appendChild(input);
					} else {
						element.innerHTML = parsedKey;
					}
				}
				inputGen(parsedData.firstname, first, 'firstInput', 'First Name', '');
				inputGen(parsedData.lastname, last, 'lastInput', 'Last Name', '');
				inputGen(parsedData.birthdate, birthdate, 'birthdateInput', '', 'date');
				inputGen(parsedPhone, mobile, 'mobileInput', '5555555555', 'tel');
				inputGen(parsedData.email, email, 'emailInput', 'name@example.com', 'email');

				for (var i = 0; i < inputs.length; i++) {
					inputs[i].addEventListener('click', function() {
						isPaused = true;
						pauseBox.innerHTML = '...refresh is paused while you type';
					});
				}
			} catch (e) {
				console.log(e.message);
			}
		});
	}).on('error', function (e) {
		console.log("Got error: " + (e.message));
	});
}
const refreshBtn = document.getElementById('refresh');

refreshBtn.addEventListener('click', function () {
	getStuff();
	isPaused = false;
	pauseBox.innerHTML = '';
});

getStuff();

function pushStuff() {
	if (document.getElementById('firstInput') != null) {
		var post_first = document.getElementById('firstInput').value;
	} else {
		var post_first = '';
	}
	if (document.getElementById('lastInput') != null) {
		var post_last = document.getElementById('lastInput').value;
	} else {
		var post_last = '';
	}
	if (document.getElementById('birthdateInput') != null) {
		var post_birthdate = document.getElementById('birthdateInput').value;
	} else {
		var post_birthdate = '';
	}
	if (document.getElementById('emailInput') != null) {
		var post_email = document.getElementById('emailInput').value;
	} else {
		var post_email = '';
	}
	let time = new Date,
			month = time.getMonth(),
			date = time.getDate(),
			year = time.getFullYear(),
			hour = time.getHours(),
			min = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes(),
			timeStamp = month+"/"+date+"/"+year+" "+hour+":"+min;
			postData = JSON.stringify({
				'timestamp': timeStamp,
				'mobile': post_mobile[0],
				'first': post_first,
				'last': post_last,
				'birthdate': post_birthdate,
				'email': post_email
			});
	fs.appendFile(path + '/log.txt', postData + '\n', (err) => {
		if (err) throw err;
	});
	console.log(post_first, post_last, post_birthdate, post_email, post_mobile[0]);
	http.get('http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' + user + '&campaign=' + campaign + '&keyword=' + keyword + '&firstname=' + post_first + '&lastname=' + post_last + '&birthdate=' + post_birthdate + '&email=' + post_email + '&mobile=' + post_mobile[0], function (res) {
		var statusCode = res.statusCode,
			contentType = res.headers['content-type'];
		var error;
		if (statusCode !== 200) {
			error = new Error("Request Failed.\n" +
				"Status Code: " + statusCode);
		}
		if (error) {
			console.log(error.message);
			res.resume();
			return
		}
		res.setEncoding('utf8');
		var rawData = '';
		res.on('data', function (chunk) {
			console.log(rawData += chunk);
		});
	});
}
pointsButton.addEventListener('click', function() {
	let pointsQty = document.getElementById('pointsQty');
	if (pointsQty.checkValidity()) {
		var post_qty = pointsQty.value;
		givePoints(post_qty);
	} else {
		pointsQty.setAttribute('invalid', '');
	}
});
function givePoints(qty) {
	http.get('http://www.repleotech.com/gateway/kiosk_submission.asp?user_guid=' + user + '&kiosk=' + keyword + '&mobile=2693529412' + /* todo replace my number with post_mobile[0] + */ '&submission_type=loyalty&quantity=' + qty, function(res) {

		/* todo use &submission_type=loyalty or =datacapture ? */

		var statusCode = res.statusCode,
			contentType = res.headers['content-type'];
		var error;
		if (statusCode !== 200) {
			error = new Error("Request Failed.\n" +
				"Status Code: " + statusCode);
		}
		if (error) {
			console.log(error.message);
			res.resume();
			return
		}
		res.setEncoding('utf8');
		var rawData = '';
		res.on('data', function (chunk) {
			console.log(rawData += chunk);
		});
	});
}

submitButton.addEventListener('click', function () {
	pushStuff();
	getStuff();
	isPaused = false;
	pauseBox.innerHTML = '';
});
