const http = require('http'),

	user = "{132643DA-4EFF-439C-847E-4AD7554D3D7A}",
	kiosk = "{9ABD7B37-35FE-4174-B2D5-85A2A9B92693}",

	first = document.getElementById('first'),
	last = document.getElementById('last'),
	birthdate = document.getElementById('birthdate'),
	mobile = document.getElementById('mobile'),
	email = document.getElementById('email');

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

				if (parsedData.firstname === undefined) {
					let input = document.createElement('input');
					input.setAttribute('id', 'firstInput');
					first.appendChild(input);
				} else {
					first.innerHTML = parsedData.firstname;
				}

				if (parsedData.lastname === undefined) {
					let input = document.createElement('input');
					input.setAttribute('id', 'lastInput');
					last.appendChild(input);
				} else {
					last.innerHTML = parsedData.lastname;
				}

				if (parsedData.birthdate === undefined) {
					let input = document.createElement('input');
					input.setAttribute('id', 'birthdateInput');
					birthdate.appendChild(input);
				} else {
					birthdate.innerHTML = parsedData.birthdate;
				}

				if (parsedData.mobile === undefined) {
					let input = document.createElement('input');
					input.setAttribute('id', 'mobileInput');
					mobile.appendChild(input);
				} else {
					mobile.innerHTML = parsedPhone;
				}

				if (parsedData.email === undefined) {
					let input = document.createElement('input');
					input.setAttribute('id', 'emailInput');
					email.appendChild(input);
				} else {
					email.innerHTML = parsedData.email;
				}
			} catch (e) {
				console.log(e.message);
			}
		});

	}).on('error', function (e) {
		console.log(("Got error: " + (e.message)));
	});
}
const refreshBtn = document.getElementById('refresh');

refreshBtn.addEventListener('click', function () {
	getStuff();
});
getStuff();
setInterval(getStuff, 10000);

function giveStuff() {

}