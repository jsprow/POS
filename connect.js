const remote = require('electron').remote,
	path = remote.getGlobal('path'),
	{
		ipcRenderer
	} = require('electron'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	$ = require('jquery'),

	kiosks = document.getElementById('kioskGroup').children,
	kioskArr = [{
			'name': 'kiosk1',
			'key': '{4B910699-82E9-4B0F-8E37-7195C48FF3FC}'
		},
		{
			'name': 'kiosk2',
			'key': '{46076CD3-BA4F-48EE-A2B2-51D9D52B468E}'
		},
		{
			'name': 'kiosk3',
			'key': '{0DCD53A6-FEBF-4AD3-B412-D26119D5FC06}'
		},
		// {
		// 	'name': 'kiosk4',
		// 	'key': '{276334FF-09DC-48C3-B64E-EA7DF48FA120}'
		// }
	],
	spans = document.getElementsByClassName('info-span'),
	first = document.getElementById('first'),
	last = document.getElementById('last'),
	birthdate = document.getElementById('birthdate'),
	mobile = document.getElementById('mobile'),
	email = document.getElementById('email'),
	points = document.getElementById('points'),

	logButton = document.getElementById('logModalButton'),
	submitButton = document.getElementById('submitButton'),
	pointsButton = document.getElementById('pointsButton'),
	pointsYes = document.getElementById('yes'),
	pointsNo = document.getElementById('no'),
	confirmation = document.getElementById('areyousure'),
	hideButton = document.getElementById('hideButton'),
	refreshButton = document.getElementById('refresh'),
	pauseButton = document.getElementById('pause'),
	kioskButton = document.getElementById('kioskButton');

var post_mobile = [],
	isPaused = false,
	inputs = document.getElementsByClassName('input'),
	user = "{132643DA-4EFF-439C-847E-4AD7554D3D7A}",
	campaign = 'prkentwood',
	keyword = 'prkentwood',
	isFirst = false, //isFirst uses the 'state' field
	kiosk,
	kioskName,
	currentLoyalty,
	usedLoyalty, //usedLoyalty uses the 'address' field
	parsedPoints;

if (fs.existsSync(path + '/kiosk.txt')) {
	kiosk = fs.readFileSync(path + '/kiosk.txt');
} else {
	kiosk = '{4B910699-82E9-4B0F-8E37-7195C48FF3FC}';
}


for (var i = 0; i < kioskArr.length; i++) {
	if (kiosk == kioskArr[i].key) {
		$('#' + kioskArr[i].name).attr('checked', true);
		kioskName = kioskArr[i].name;
	}
}

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
//set multiple attributes at once
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
//convert strings to proper case
String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
};
//choose kiosk
for (var i = 0; i < kiosks.length; i++) {
	let pick = kiosks[i];
	if (pick.className == 'kioskGroup-input') {
		pick.addEventListener('change', () => {
			pause();
			if (pick.id == 'kiosk1') {
				kiosk = '{0DCD53A6-FEBF-4AD3-B412-D26119D5FC06}';
				kioskName = 'kiosk1';
			} else if (pick.id == 'kiosk2') {
				kiosk = '{46076CD3-BA4F-48EE-A2B2-51D9D52B468E}';
				kioskName = 'kiosk2';
			} else if (pick.id == 'kiosk3') {
				kiosk = '{4B910699-82E9-4B0F-8E37-7195C48FF3FC}';
				kioskName = 'kiosk3';
			}
			// else if (pick.id == 'kiosk4') {
			// 	kiosk = '{276334FF-09DC-48C3-B64E-EA7DF48FA120}';
			// 	kioskName = 'kiosk4';
			// }
			if (pick.id == kioskName) {
				kioskClick(pick);
			}
			let replace = () => {
				first.replaceWith(first);
				last.replaceWith(last);
				birthdate.replaceWith(birthdate);
				email.replaceWith(email);
			}
			$.when(replace()).done(() => {
				getStuff();
				unPause();
				kioskGroup.classList.remove('show');
			});
			fs.writeFile(path + '/kiosk.txt', kiosk, (err) => {
				if (err) throw err;
			});
		});
	}
}
//pause when entering data
function pause() {
	isPaused = true;
	pauseButton.classList.add('paused');
	refreshButton.classList.add('paused');
}

function unPause() {
	isPaused = false;
	pauseButton.classList.remove('paused');
	refreshButton.classList.remove('paused');
}
//send call to get customer info
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
				currentLoyalty = parsedData.current_loyalty;
				usedLoyalty = parsedData.address; //uses 'address' field

				if (currentLoyalty == 1) {
					console.log('currentLoyalty: ' + currentLoyalty);
					isFirst = true;
					currentLoyalty = currentLoyalty + 1;

					http.get('http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' + user + '&mobile=' + post_mobile[0] + '&state=true', (res) => {
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

				if (!currentLoyalty) {
					currentLoyalty = 0;
				}
				if (!usedLoyalty) {
					usedLoyalty = 0;
				}
				var parsedPoints = '$' + ((currentLoyalty - usedLoyalty) * 0.5).toFixed(2);

				function spanGen(parsedKey, element, inputId, type, spanId, labelId) {
					var span = document.getElementById(spanId),
						input = document.getElementById(inputId),
						label = document.getElementById(labelId);
					input = document.getElementById(inputId);

					if (parsedKey === undefined) {
						span.classList.add('hidden');
						span.classList.remove('filled');
						span.innerHTML = '';
						if (input) {
							input.classList.remove('hidden');
						}
						if (label) {
							label.classList.remove('hidden');
						}
					}

					if (parsedKey != undefined) {
						let spanP = document.createElement('p');
						spanP.innerHTML = parsedKey;
						span.classList.remove('hidden');
						span.classList.add('filled');
						span.innerHTML = '';
						span.appendChild(spanP);
						if (input) {
							input.classList.add('hidden');
						}
						if (spanId != 'mobileSpan' && spanId != 'pointsSpan') {
							let img = document.createElement('img');
							img.setAttributes({
								'src': 'pencil_grey.svg'
							});
							img.classList.add('edit-img');
							span.appendChild(img);
							img.addEventListener('click', () => {
								pause();
								input = document.getElementById(inputId);
								span = document.getElementById(spanId);
								label = document.getElementById(labelId);
								span.classList.add('hidden');
								label.classList.add('hidden');
								window.setTimeout(() => {
									input.classList.remove('hidden');
								}, 300);
								input.focus();
								submitButton.addEventListener('click', () => {
									input.classList.add('hidden');
									label.classList.add('hidden');
									input.value = '';
									window.setTimeout(() => {
										span.classList.remove('hidden');
									}, 300);
								});
								refreshButton.addEventListener('click', () => {
									input.classList.add('hidden');
									label.classList.add('hidden');
									input.value = '';
									window.setTimeout(() => {
										span.classList.remove('hidden');
									}, 300);
								});
								pauseButton.addEventListener('click', () => {
									input.classList.add('hidden');
									label.classList.add('hidden');
									input.value = '';
									window.setTimeout(() => {
										span.classList.remove('hidden');
									}, 300);
								});
							});
						}
					} else {}
					if (span.classList.contains('filled')) {
						label = document.getElementById(labelId);
						label.classList.add('hidden');
					}
				}
				spanGen(parsedData.firstname, first, 'firstInput', '', 'firstSpan', 'firstLabel');
				spanGen(parsedData.lastname, last, 'lastInput', '', 'lastSpan', 'lastLabel');
				spanGen(parsedData.birthdate, birthdate, 'birthdateInput', 'date', 'birthdateSpan', 'birthdateLabel');
				var dateInput = document.querySelector('#birthdateInput');
				if (dateInput) {
					dateInput.addEventListener('keyup', (e) => {
						$('#birthdateInput').addClass('date-changed');
						if (dateInput.validity.valid) {
							$('#birthdateInput').addClass('valid');
						}
					});
				}
				spanGen(parsedPhone, mobile, '', 'tel', 'mobileSpan', 'mobileLabel');
				spanGen(parsedPoints, points, '', 'number', 'pointsSpan', 'pointsLabel');
				spanGen(parsedData.email, email, 'emailInput', 'email', 'emailSpan', 'emailLabel');
				for (var i = 0; i < inputs.length; i++) {
					inputs[i].addEventListener('click', () => {
						pause();
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
//redeem rewards
var confirmationPause = false;
pointsButton.addEventListener('click', () => {
	if (confirmationPause) {
		confirmationPause = false;
		unPause();
	} else {
		confirmationPause = true;
		pause();
	}
	confirmation.classList.toggle('show');
});
pointsYes.addEventListener('click', () => {
	cashOut();
	getStuff();
	unPause();
	confirmation.classList.remove('show');
});
pointsNo.addEventListener('click', () => {
	confirmation.classList.remove('show');
	unPause();
});
//bind enter to submit button
$(document).bind('keypress', function(e) {
	if (e.keyCode == 13) {
		$(submitButton).trigger('click');
	}
});
//send contact info update
submitButton.addEventListener('click', () => {
	pushStuff();
	getStuff();
	unPause();
});
//kiosk picker
var kioskPause = false;

function kioskClick(button) {
	button.addEventListener('click', () => {
		if (kioskGroup.classList.contains('show')) {
			kioskPause = true;
		} else {
			kioskPause = false;
		}
		if (kioskPause) {
			kioskPause = false;
			unPause();
		} else {
			kioskPause = true;
			pause();
		}
		kioskGroup.classList.toggle('show');
	});
}

kioskClick(kioskButton);

function cashOut() {
	if (!currentLoyalty) {
		currentLoyalty = 0;
	}
	if (!usedLoyalty) {
		usedLoyalty = 0;
	}
	var parsedPoints = '$' + ((currentLoyalty - usedLoyalty) * 0.5).toFixed(2);

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
		'kiosk': kioskName,
		'points': parsedPoints,
		'mobile': post_mobile[0],
		'isFirst': isFirst,
		'first': post_first,
		'last': post_last,
		'birthdate': post_birthdate,
		'email': post_email
	});
	fs.appendFile(path + '/log.txt', postData + '\n', (err) => {
		if (err) throw err;
	});
	http.get('http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' + user + '&mobile=' + post_mobile[0] + '&address=' + currentLoyalty + '&state=false', (res) => {
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
window.setInterval(() => {
	if (!isPaused) {
		getStuff();
	} else {
		return;
	}
}, 2000);

pauseButton.addEventListener('click', () => {
	unPause();
	getStuff();
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].value = '';
	}
});

function pushStuff() {
	if (!currentLoyalty) {
		currentLoyalty = 0;
	}
	if (!usedLoyalty) {
		usedLoyalty = 0;
	}
	var parsedPoints = '$' + ((currentLoyalty - usedLoyalty) * 0.5).toFixed(2);

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
		month = time.getMonth() + 1,
		date = time.getDate(),
		year = time.getFullYear(),
		hour = time.getHours(),
		min = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes(),
		timeStamp = month + "/" + date + "/" + year + " " + hour + ":" + min;

	postData = JSON.stringify({
		'timestamp': timeStamp,
		'kiosk': kioskName,
		'points': parsedPoints,
		'mobile': post_mobile[0],
		'first': post_first,
		'last': post_last,
		'birthdate': post_birthdate,
		'email': post_email
	});
	fs.appendFile(path + '/log.txt', postData + '\n', (err) => {
		if (err) throw err;
	});
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
/* todo ensure that form cannot be submitted with invalid input */
