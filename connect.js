const remote = require('electron').remote,
			path = remote.getGlobal('path'),
			{ipcRenderer} = require('electron'),
			http = require('http'),
			http_post = require('http-post'),
			fs = require('fs');

			user = "{132643DA-4EFF-439C-847E-4AD7554D3D7A}",
			kiosk = "{9ABD7B37-35FE-4174-B2D5-85A2A9B92693}",
			campaign = 'prkentwood',
			keyword = 'prkentwood',

			first = document.getElementById('first'),
			last = document.getElementById('last'),
			birthdate = document.getElementById('birthdate'),
			mobile = document.getElementById('mobile'),
			email = document.getElementById('email'),

			submit = document.getElementById('submit'),
			pointButton = document.getElementById('points'),
			pauseBox = document.getElementById('pauseBox');

var post_mobile = [],
		logButton = document.getElementById('logModalButton'),
		isPaused = false;


	var inputs = document.getElementsByTagName('input'),
	timer = window.setInterval(function() {
		if (!isPaused) {
			getStuff();
		}
	}, 10000);

function logModal() {
		ipcRenderer.messaging = {
			sendOpenLogWindow: function() {
				ipcRenderer.send('open-second-window', 'an-argument')
			},
			sendCloseLogWindow: function() {
				ipcRenderer.send('close-second-window', 'an-argument')
			},

			init: function() {
				logButton.addEventListener('click', function() {
					ipcRenderer.messaging.sendOpenLogWindow();
				});
			}
		};
    ipcRenderer.messaging.init();
}

logModal();

console.log(path);

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
				let parsedData = JSON.parse(rawData),
					phone = parsedData.mobile.toString(),
					phoneArea = phone.substring(0, 3),
					phoneThree = phone.substring(3, 6),
					phoneFour = phone.substring(6, 10),
					parsedPhone = "(" + phoneArea + ") " + phoneThree + "-" + phoneFour;

				post_mobile[0] = parsedData.mobile;

				if (parsedData.firstname === undefined) {
					let input = document.createElement('input'),
						child = first.firstChild;
					input.setAttributes({
					    'id':'firstInput',
					    'placeholder': 'First Name'
					});
					first.innerHTML = '';
					first.appendChild(input);
				} else {
					first.innerHTML = parsedData.firstname;
				}

				if (parsedData.lastname === undefined) {
					let input = document.createElement('input'),
						child = last.firstChild;
					input.setAttributes({
					    'id':'lastInput',
					    'placeholder': 'Last Name'
					});
					last.innerHTML = '';
					last.appendChild(input);
				} else {
					last.innerHTML = parsedData.lastname;
				}

				if (parsedData.birthdate === undefined) {
					let input = document.createElement('input'),
						child = birthdate.firstChild;
					input.setAttributes({
					    'id':'birthdateInput',
							'type': 'date'
					});
					birthdate.innerHTML = '';
					birthdate.appendChild(input);
				} else {
					birthdate.innerHTML = parsedData.birthdate;
				}

				if (parsedData.mobile === undefined) {
					let input = document.createElement('input'),
						child = mobile.firstChild;
					input.setAttributes({
					    'id':'mobileInput',
							'type': 'tel'
					});
					mobile.innerHTML = '';
					mobile.appendChild(input);
				} else {
					mobile.innerHTML = parsedPhone;
				}

				if (parsedData.email === undefined) {
					let input = document.createElement('input'),
						child = email.firstChild;
					input.setAttributes({
							'id':'emailInput',
							'type': 'email'
					});
					email.innerHTML = '';
					email.appendChild(input);
				} else {
					email.innerHTML = parsedData.email;
				}
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
	var post_first = document.getElementById('firstInput').value,
		post_last = document.getElementById('lastInput').value,
		post_birthdate = document.getElementById('birthdateInput').value,
		post_email = document.getElementById('emailInput').value;

		let timeStamp = new Date(),
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
			console.log('The "data to append" was appended to' + path + '/log.txt');
		});
	http_post('http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' + user + '&campaign=' + campaign + '&keyword=' + keyword + '&firstname=' + post_first + '&mobile=2693529412' /* + post_mobile[0] */ , function (res) {
		response.setEncoding('utf8');
		res.on('data', function (e) {
		});
		res.on('end', function () {
			try {
			} catch (e) {
				console.log(e.message);
			}
		})
	}).on('error', function (e) {
		console.log("Got error: " + (e.message));
	});
}

function givePoints() {

}

submit.addEventListener('click', function () {
	pushStuff();
	getStuff();
	isPaused = false;
	pauseBox.innerHTML = '';
});
