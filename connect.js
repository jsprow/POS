const remote = require('electron').remote,
	path = remote.getGlobal('path'),
	{ ipcRenderer	} = require('electron'),
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
	refreshButton = document.getElementById('refresh');

var post_mobile = [],
	isPaused = false,
	inputs = document.getElementsByTagName('input');

function ipcFunction() {
	ipcRenderer.messaging = {
		sendShrink: () => {
			ipcRenderer.send('shrink-window', 'an-argument')
		},
		sendGrow: () => {
			ipcRenderer.send('grow-window', 'an-argument')
		},
		sendOpenLogWindow: () => {
			ipcRenderer.send('open-second-window', 'an-argument')
		},
		sendCloseLogWindow: () => {
			ipcRenderer.send('close-second-window', 'an-argument')
		},

		init: () => {
			var shrunk = false;
			hideButton.addEventListener('click', () => {
				if (!shrunk) {
					$('.to-hide').addClass('hidden');
					$('.minus').addClass('rotate');
					$('.plus').addClass('rotate');
					$('.to-show').addClass('showing');
					ipcRenderer.messaging.sendShrink();
					shrunk = true;
				} else {
					$('.to-hide').removeClass('hidden');
					$('.minus').removeClass('rotate');
					$('.plus').removeClass('rotate');
					$('.to-show').removeClass('showing');
					ipcRenderer.messaging.sendGrow();
					shrunk = false;
				}
			});
			logButton.addEventListener('click', () => {
				ipcRenderer.messaging.sendOpenLogWindow();
			});
		}
	};
	ipcRenderer.messaging.init();
}

ipcFunction();

Element.prototype.setAttributes = function(attrs) {
	for (var idx in attrs) {
		if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
			for (var prop in attrs[idx]) {
				this.style[prop] = attrs[idx][prop];
			}
		} else if (idx === 'html') {
			this.innerHTML = attrs[idx];
		} else {
			this.setAttribute(idx, attrs[idx]);
		}
	}
};

function getStuff() {
	http.get('http://www.repleotech.com/gateway/kiosk_last_checkin.asp?kiosk=' + kiosk + '&user_guid=' + user, (res) => {

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
		res.on('data', (chunk) => {
			return rawData += chunk;
		});
		res.on('end', () => {
			try {
				var parsedData = JSON.parse(rawData),
					phone = parsedData.mobile.toString(),
					phoneArea = phone.substring(0, 3),
					phoneThree = phone.substring(3, 6),
					phoneFour = phone.substring(6, 10),
					parsedPhone = "(" + phoneArea + ") " + phoneThree + "-" + phoneFour;

				post_mobile[0] = parsedData.mobile;

				function spanGen(parsedKey, element, inputId, type, spanId) {
					if (parsedKey != undefined && inputId) {
						let input = document.getElementById(inputId);
						input.classList.add('hidden');
					}
					let span = document.getElementById(spanId);
					if (parsedKey != undefined) {
						span.classList.add('filled');
						span.innerHTML = parsedKey;
						if (spanId != 'mobileSpan') {
							let img = document.createElement('img');
							img.setAttributes({
								'src': 'pencil_grey.svg'
							});
							img.classList.add('edit-img');
							span.appendChild(img);
							img.addEventListener('click', () => {
								isPaused = true;
								$('#pauseBox').addClass('paused');
								let input = document.getElementById(inputId);
								let span = document.getElementById(spanId);
								span.classList.add('hidden');
								window.setTimeout( () => {
									input.classList.remove('hidden');
								}, 300);
								input.focus();
								submitButton.addEventListener('click', () => {
									input.classList.add('hidden');
									input.value = '';
									window.setTimeout( () => {
										span.classList.remove('hidden');
									}, 300);
								});
								refreshButton.addEventListener('click', () => {
									input.classList.add('hidden');
									input.value = '';
									window.setTimeout( () => {
										span.classList.remove('hidden');
									}, 300);
								});
							});
						}
					}
				}
				spanGen(parsedData.firstname, first, 'firstInput', '', 'firstSpan');
				spanGen(parsedData.lastname, last, 'lastInput', '', 'lastSpan');
				spanGen(parsedData.birthdate, birthdate, 'birthdateInput', 'date', 'birthdateSpan');
				var dateInput = document.querySelector('#birthdateInput');
				if (dateInput) {
					dateInput.addEventListener('keyup', (e) => {
						$('#birthdateInput').addClass('date-changed');
						if (dateInput.validity.valid) {
							$('#birthdateInput').addClass('valid');
						}
					});
				}
				spanGen(parsedPhone, mobile, '', 'tel', 'mobileSpan');
				spanGen(parsedData.email, email, 'emailInput', 'email', 'emailSpan');
				for (var i = 0; i < inputs.length; i++) {
					inputs[i].addEventListener('click', () => {
						isPaused = true;
						$('#pauseBox').addClass('paused');
					});
				}
			} catch (e) {
				console.log(e.message);
			}
		});
	}).on('error', (e) => {
		console.log("Got error: " + (e.message));
	});
}
getStuff();

window.setInterval(() => {
	if (!isPaused) {
		getStuff();
	} else {
		return;
	}
}, 5000);

refreshButton.addEventListener('click', () => {
	getStuff();
	isPaused = false;
	$('#pauseBox').removeClass('paused');
});

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
		timeStamp = month + "/" + date + "/" + year + " " + hour + ":" + min;
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
	http.get('http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' + user + '&campaign=' + campaign + '&keyword=' + keyword + '&firstname=' + post_first + '&lastname=' + post_last + '&birthdate=' + post_birthdate + '&email=' + post_email + '&mobile=' + post_mobile[0], (res) => {
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
		res.on('data', (chunk) => {
			console.log(rawData += chunk);
		});
	});
}
pointsButton.addEventListener('click', () => {
	let pointsQty = document.getElementById('pointsQty');
	if (pointsQty.checkValidity()) {
		var post_qty = pointsQty.value;
		givePoints(post_qty);
		getStuff();
		pointsQty.value = '';
		isPaused = false;
		$('#pauseBox').removeClass('paused');
	} else {
		pointsQty.setAttribute('invalid', '');
	}
});

function givePoints(qty) {
	http.get('http://www.repleotech.com/gateway/kiosk_submission.asp?user_guid=' + user + '&kiosk=' + keyword + '&mobile=2693529412' + /* todo replace my number with post_mobile[0] + */ '&submission_type=datacapture&quantity=' + qty, function(res) {

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
		res.on('data', function(chunk) {
			console.log(rawData += chunk);
		});
	});
}
/* todo ensure that form cannot be submitted with invalid input */

submitButton.addEventListener('click', () => {
	pushStuff();
	getStuff();
	isPaused = false;
	$('#pauseBox').removeClass('paused');
});
