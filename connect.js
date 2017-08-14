const remote = require('electron').remote,
	path = remote.getGlobal('path'),
	{ ipcRenderer } = require('electron'),
	http = require('http'),
	https = require('https'),
	fs = require('fs'),
	$ = require('jquery'),
	kiosks = document.getElementById('kioskGroup').children,
	kioskArr = [
		{
			name: 'kiosk1',
			key: '{0877CE0C-3A84-4D0E-AE02-81966655B025}'
		}
		// ,{
		// 	name: 'kiosk2',
		// 	key: '{02A84516-88E1-4BE7-AD30-F1ACE961BF9D}'
		// },
		// {
		// 	name: 'kiosk3',
		// 	key: '{EDDF031C-F147-45FD-8CB6-8FFFF979BF15}'
		// },
		// {
		// 	name: 'kiosk4',
		// 	key: '{13DB79E6-787A-46E1-9406-511F12C3CCE3}'
		// },
		// {
		// 	name: 'kiosk5',
		// 	key: '{5B5ADCEA-50C3-4DB5-B354-10CFB9896B7A}'
		// }
	],
	spans = document.getElementsByClassName('info-span'),
	first = document.getElementById('first'),
	last = document.getElementById('last'),
	birthdate = document.getElementById('birthdate'),
	anniversary = document.getElementById('anniversary'),
	mobile = document.getElementById('mobile'),
	email = document.getElementById('email'),
	points = document.getElementById('points'),
	couponsBox = document.getElementById('couponsBox'),
	logButton = document.getElementById('logModalButton'),
	submitButton = document.getElementById('submitButton'),
	settingsButton = document.getElementById('settingsButton'),
	settingsBox = document.getElementById('settingsBox'),
	userGUIDInput = document.getElementById('userGUIDInput'),
	couponInput = document.getElementById('couponInput'),
	keywordInput = document.getElementById('keywordInput'),
	submitSettings = document.getElementById('submitSettings'),
	addCouponButton = document.getElementById('addCouponButton'),
	useCouponButton = document.getElementById('useCouponButton'),
	addYes = document.getElementById('addYes'),
	redeemYes = document.getElementById('redeemYes'),
	addNo = document.getElementById('addNo'),
	redeemNo = document.getElementById('redeemNo'),
	confirmationAdd = document.getElementById('areYouSureAdd'),
	confirmationRedeem = document.getElementById('areYouSureRedeem'),
	hideButton = document.getElementById('hideButton'),
	refreshButton = document.getElementById('refresh'),
	pauseButton = document.getElementById('pause'),
	kioskButton = document.getElementById('kioskButton')

var post_mobile = [],
	isPaused = false,
	inputs = document.getElementsByClassName('input'),
	user = '{5CFA7E11-3148-4558-A99C-B475A91B68D0}',
	coupon_guid = '{AE4C14C4-AF9A-427F-8EF7-1B4A8C3A0A5C}',
	keyword = 'disctroy',
	isFirst = false, //isFirst uses the 'state' field
	kiosk,
	kioskName,
	currentLoyalty,
	usedLoyalty, //usedLoyalty uses the 'address' field
	parsedPoints,
	today = new Date(),
	month = today.getMonth() + 1,
	day = today.getDate(),
	todayString

todayString = ('0' + month).slice(-2) + '-' + ('0' + day).slice(-2)

fs.writeFileSync(
	path + '/user.txt',
	JSON.stringify({ user: '{5CFA7E11-3148-4558-A99C-B475A91B68D0}', keyword: 'disctroy', coupon: '{AE4C14C4-AF9A-427F-8EF7-1B4A8C3A0A5C}' })
)
//populate settings menu
submitSettings.addEventListener('click', () => {
	fs.writeFileSync(
		path + '/user.txt',
		JSON.stringify({
			user: userGUIDInput.value,
			keyword: keywordInput.value,
			coupon: couponInput.value
		})
	)
})

if (fs.existsSync(path + '/user.txt')) {
	userData = JSON.parse(fs.readFileSync(path + '/user.txt', 'utf8'))
	user = userData.user
	keyword = userData.keyword
	coupon_guid = userData.coupon

	userGUIDInput.placeholder = user
	keywordInput.placeholder = keyword
	couponInput.placeholder = coupon_guid
} else {
	user = ''
	keyword = ''
	fs.writeFileSync(path + '/user.txt', JSON.stringify({ user: user, keyword: keyword }))
}

if (fs.existsSync(path + '/kiosk.txt')) {
	kiosk = fs.readFileSync(path + '/kiosk.txt')
} else {
	kiosk = '{0877CE0C-3A84-4D0E-AE02-81966655B025}'
	fs.writeFileSync(path + '/kiosk.txt', kiosk)
}

for (var i = 0; i < kioskArr.length; i++) {
	if (kiosk == kioskArr[i].key) {
		$('#' + kioskArr[i].name).attr('checked', true)
		kioskName = kioskArr[i].name
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
			var shrunk = false
			hideButton.addEventListener('click', () => {
				if (!shrunk) {
					$('.to-hide').addClass('hidden')
					$('.minus').addClass('rotate')
					$('.plus').addClass('rotate')
					$('.to-show').addClass('showing')
					ipcRenderer.messaging.sendShrink()
					shrunk = true
				} else {
					$('.to-hide').removeClass('hidden')
					$('.minus').removeClass('rotate')
					$('.plus').removeClass('rotate')
					$('.to-show').removeClass('showing')
					ipcRenderer.messaging.sendGrow()
					shrunk = false
				}
			})
			logButton.addEventListener('click', () => {
				ipcRenderer.messaging.sendOpenLogWindow()
			})
		}
	}
	ipcRenderer.messaging.init()
}

ipcFunction()
//set multiple attributes at once
Element.prototype.setAttributes = function(attrs) {
	for (var idx in attrs) {
		if ((idx === 'styles' || idx === 'style') && typeof attrs[idx] === 'object') {
			for (var prop in attrs[idx]) {
				this.style[prop] = attrs[idx][prop]
			}
		} else if (idx === 'html') {
			this.innerHTML = attrs[idx]
		} else {
			this.setAttribute(idx, attrs[idx])
		}
	}
}
//convert strings to proper case
String.prototype.toProperCase = function() {
	return this.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
	})
}
//open settings menu
settingsButton.addEventListener('click', () => {
	if (!isPaused) {
		pause()
	} else {
		unPause()
	}
	settingsBox.classList.toggle('show')
})
//choose kiosk
for (var i = 0; i < kiosks.length; i++) {
	let pick = kiosks[i]
	if (pick.className == 'kioskGroup-input') {
		pick.addEventListener('change', () => {
			pause()
			if (pick.id == 'kiosk1') {
				kiosk = kioskArr[0].key
				kioskName = kioskArr[0].name
			} else if (pick.id == 'kiosk2') {
				kiosk = kioskArr[1].key
				kioskName = kioskArr[1].name
			} else if (pick.id == 'kiosk3') {
				kiosk = kioskArr[2].key
				kioskName = kioskArr[2].name
			} else if (pick.id == 'kiosk4') {
				kiosk = kioskArr[3].key
				kioskName = kioskArr[3].name
			} else if (pick.id == 'kiosk5') {
				kiosk = kioskArr[4].key
				kioskName = kioskArr[4].name
			}
			if (pick.id == kioskName) {
				kioskClick(pick)
			}
			let replace = () => {
				first.replaceWith(first)
				last.replaceWith(last)
				birthdate.replaceWith(birthdate)
				anniversary.replaceWith(anniversary)
				email.replaceWith(email)
			}
			$.when(replace()).done(() => {
				getStuff()
				unPause()
				kioskGroup.classList.remove('show')
			})
			fs.writeFile(path + '/kiosk.txt', kiosk, err => {
				if (err) throw err
			})
		})
	}
}
//pause when entering data
function pause() {
	isPaused = true
	pauseButton.classList.add('paused')
	refreshButton.classList.add('paused')
}

function unPause() {
	isPaused = false
	pauseButton.classList.remove('paused')
	refreshButton.classList.remove('paused')
}
//send call to get customer info
function couponGen(id, name) {
	let coupon = document.createElement('div'),
		couponName = document.createElement('p'),
		couponRedeem = document.createElement('div')

	couponName.innerText = name

	couponRedeem.id = id
	couponRedeem.innerText = '$'
	couponRedeem.classList.add('coupon-redeem')

	coupon.classList.add('coupon')
	coupon.appendChild(couponRedeem)
	coupon.appendChild(couponName)

	couponsBox.appendChild(coupon)
}
function spanGen(parsedKey, element, inputId, type, spanId, labelId) {
	var span = document.getElementById(spanId),
		input = document.getElementById(inputId),
		label = document.getElementById(labelId)
	input = document.getElementById(inputId)

	if (parsedKey === undefined) {
		span.classList.add('hidden')
		span.classList.remove('filled')
		span.innerHTML = ''
		if (input) {
			input.classList.remove('hidden')
		}
		if (label) {
			label.classList.remove('hidden')
		}
	}

	if (parsedKey != undefined) {
		let spanP = document.createElement('p')
		spanP.innerHTML = parsedKey
		span.classList.remove('hidden')
		span.classList.add('filled')
		span.innerHTML = ''
		span.appendChild(spanP)
		if (input) {
			input.classList.add('hidden')
		}
		if (spanId != 'mobileSpan' && spanId != 'pointsSpan') {
			let img = document.createElement('img')
			img.setAttributes({
				src: 'icons/pencil_grey.svg'
			})
			img.classList.add('edit-img')
			span.appendChild(img)
			img.addEventListener('click', () => {
				pause()
				input = document.getElementById(inputId)
				span = document.getElementById(spanId)
				label = document.getElementById(labelId)
				span.classList.add('hidden')
				label.classList.add('hidden')
				window.setTimeout(() => {
					input.classList.remove('hidden')
				}, 300)
				input.focus()
				submitButton.addEventListener('click', () => {
					input.classList.add('hidden')
					label.classList.add('hidden')
					input.value = ''
					window.setTimeout(() => {
						span.classList.remove('hidden')
					}, 300)
				})
				refreshButton.addEventListener('click', () => {
					input.classList.add('hidden')
					label.classList.add('hidden')
					input.value = ''
					window.setTimeout(() => {
						span.classList.remove('hidden')
					}, 300)
				})
				pauseButton.addEventListener('click', () => {
					input.classList.add('hidden')
					label.classList.add('hidden')
					input.value = ''
					window.setTimeout(() => {
						span.classList.remove('hidden')
					}, 300)
				})
			})
		}
	} else {
	}
	if (span.classList.contains('filled')) {
		label = document.getElementById(labelId)
		label.classList.add('hidden')
	}
}
function getStuff() {
	http.get(
		`http://www.repleotech.com/gateway/coupons_by_mobile.asp?` +
			`user_guid=${user}&mobile=${post_mobile[0]}`,
		res => {
			let statusCode = res.statusCode, contentType = res.headers['content-type']
			let error
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' + 'Status Code: ' + statusCode)
			}
			if (error) {
				console.log(error.message)
				res.resume()
				return
			}

			res.setEncoding('utf8')
			let rawData = ''
			res.on('data', chunk => {
				return (rawData += chunk)
			})
			res.on('end', () => {
				if (rawData[0] !== 's') {
					let coupons = JSON.parse(rawData)

					couponsBox.innerHTML = ''
					for (var i = 0; i < coupons.length; i++) {
						let coupon = coupons[i]
						couponGen(coupon.cc_guid, coupon.coupon_name)

						let _coupon = document.getElementById(coupon.cc_guid)

						_coupon.addEventListener('click', c => {
							http.get(
								`http://www.repleotech.com/gateway/coupons_manager.asp?` +
									`user_guid={${user}}` +
									`&action=redeem` +
									`&mobile=${post_mobile[0]}` +
									`&cc_guid={${c.target.id}}`,
								_res => {
									let statusCode = _res.statusCode,
										contentType = _res.headers['content-type']
									let error
									if (statusCode !== 200) {
										error = new Error(
											'Request Failed.\n' + 'Status Code: ' + statusCode
										)
									}
									if (error) {
										console.log(error.message)
										_res.resume()
										return
									}
								}
							)
						})
					}
				}
			})
		}
	)
	http
		.get(
			'http://www.repleotech.com/gateway/kiosk_last_checkin.asp?kiosk=' +
				kiosk +
				'&user_guid=' +
				user,
			res => {
				var statusCode = res.statusCode, contentType = res.headers['content-type']
				var error
				if (statusCode !== 200) {
					error = new Error('Request Failed.\n' + 'Status Code: ' + statusCode)
				}
				if (error) {
					console.log(error.message)
					res.resume()
					return
				}

				res.setEncoding('utf8')
				var rawData = ''
				res.on('data', chunk => {
					return (rawData += chunk)
				})
				res.on('end', () => {
					try {
						var parsedData = JSON.parse(rawData),
							phone = parsedData.mobile.toString(),
							phoneArea = phone.substring(0, 3),
							phoneThree = phone.substring(3, 6),
							phoneFour = phone.substring(6, 10),
							parsedPhone = '(' + phoneArea + ') ' + phoneThree + '-' + phoneFour

						post_mobile[0] = parsedData.mobile
						currentLoyalty = parsedData.current_loyalty
						usedLoyalty = parseFloat(parsedData.address) //uses 'address' field for loyalty points used and finds difference between current loyalty

						if (currentLoyalty == 1) {
							// console.log('currentLoyalty: ' + currentLoyalty)
							isFirst = true
							currentLoyalty = parseFloat(currentLoyalty)

							http.get(
								'http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' +
									user +
									'&mobile=' +
									post_mobile[0] +
									'&state=true',
								res => {
									var statusCode = res.statusCode,
										contentType = res.headers['content-type']
									var error
									if (statusCode !== 200) {
										error = new Error(
											'Request Failed.\n' + 'Status Code: ' + statusCode
										)
									}
									if (error) {
										console.log(error.message)
										res.resume()
										return
									}
									res.setEncoding('utf8')
									var rawData = ''
									res.on('data', function(chunk) {
										// console.log((rawData += chunk))
									})
								}
							)
						}

						if (!currentLoyalty) {
							currentLoyalty = 0
						}
						if (!usedLoyalty) {
							usedLoyalty = 0
						}
						var actualLoyalty = currentLoyalty - usedLoyalty

						// console.log(currentLoyalty, usedLoyalty, actualLoyalty)

						if (currentLoyalty === 1) {
							var parsedPoints = currentLoyalty + ' check-in'
						} else {
							var parsedPoints = currentLoyalty + ' check-ins'
						}

						spanGen(
							parsedData.firstname,
							first,
							'firstInput',
							'',
							'firstSpan',
							'firstLabel'
						)
						spanGen(parsedData.lastname, last, 'lastInput', '', 'lastSpan', 'lastLabel')
						spanGen(
							parsedData.birthdate,
							birthdate,
							'birthdateInput',
							'date',
							'birthdateSpan',
							'birthdateLabel'
						)
						spanGen(
							parsedData.city,
							anniversary,
							'anniversaryInput',
							'date',
							'anniversarySpan',
							'anniversaryLabel'
						)
						var dateStyle = 'color: #35bf51; font-weight: bold;'
						var dateInput = document.querySelector('#birthdateInput')
						if (dateInput) {
							if (parsedData.birthdate) {
								if (parsedData.birthdate.slice(-5) === todayString) {
									document.getElementById(
										'birthdateSpan'
									).style.cssText = dateStyle
								} else {
									document.getElementById('birthdateSpan').style.cssText = ''
								}
							}
							dateInput.addEventListener('keyup', e => {
								$('#birthdateInput').addClass('date-changed')
								if (dateInput.validity.valid) {
									$('#birthdateInput').addClass('valid')
								}
							})
						}
						var anniversaryDateInput = document.querySelector('#anniversaryInput')
						if (anniversaryDateInput) {
							if (parsedData.city) {
								if (parsedData.city.slice(-5) === todayString) {
									document.getElementById(
										'anniversarySpan'
									).style.color = dateStyle
								} else {
									document.getElementById('anniversarySpan').style.color = ''
								}
							}
							dateInput.addEventListener('keyup', e => {
								$('#anniversaryInput').addClass('date-changed')
								if (dateInput.validity.valid) {
									$('#anniversaryInput').addClass('valid')
								}
							})
						}
						spanGen(parsedPhone, mobile, '', 'tel', 'mobileSpan', 'mobileLabel')
						spanGen(parsedPoints, points, '', 'number', 'pointsSpan', 'pointsLabel')
						spanGen(
							parsedData.email,
							email,
							'emailInput',
							'email',
							'emailSpan',
							'emailLabel'
						)
						for (var i = 0; i < inputs.length; i++) {
							inputs[i].addEventListener('click', () => {
								pause()
							})
						}
					} catch (e) {
						console.log(e.message)
					}
				})
			}
		)
		.on('error', e => {
			console.log('Got error: ' + e.message)
		})
}
getStuff()
var confirmationPause = false
//add coupon
addCouponButton.addEventListener('click', () => {
	if (confirmationPause) {
		confirmationPause = false
		unPause()
	} else {
		confirmationPause = true
		pause()
	}
	confirmationAdd.classList.toggle('show')
})
addYes.addEventListener('click', () => {
	console.log(post_mobile[0])
	http.get(
		'http://www.repleotech.com/gateway/coupons_manager.asp?action=issue&' +
			`user_guid=${user}` +
			`&mobile=${post_mobile[0]}&coupon_guid=${coupon_guid}`,
		res => {
			var statusCode = res.statusCode, contentType = res.headers['content-type']
			var error
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' + 'Status Code: ' + statusCode)
			}
			if (error) {
				console.log(error.message)
				res.resume()
				return
			}
			res.setEncoding('utf8')
			var rawData = ''
			res.on('data', function(chunk) {
				// console.log((rawData += chunk))
				getStuff()
				unPause()
				confirmationAdd.classList.remove('show')
			})
		}
	)
})
addNo.addEventListener('click', () => {
	confirmationAdd.classList.remove('show')
	unPause()
})
//redeem rewards
useCouponButton.addEventListener('click', () => {
	if (confirmationPause) {
		confirmationPause = false
		unPause()
	} else {
		confirmationPause = true
		pause()
	}
	confirmationRedeem.classList.toggle('show')
})
redeemYes.addEventListener('click', () => {
	// cashOut()
	getStuff()
	unPause()
	confirmationRedeem.classList.remove('show')
})
redeemNo.addEventListener('click', () => {
	confirmationRedeem.classList.remove('show')
	unPause()
})
//bind enter to submit button
$(document).bind('keypress', function(e) {
	if (e.keyCode == 13) {
		$(submitButton).trigger('click')
	}
})
//send contact info update
submitButton.addEventListener('click', () => {
	pushStuff()
	getStuff()
	unPause()
})
//kiosk picker
var kioskPause = false

function kioskClick(button) {
	button.addEventListener('click', () => {
		if (kioskGroup.classList.contains('show')) {
			kioskPause = true
		} else {
			kioskPause = false
		}
		if (kioskPause) {
			kioskPause = false
			unPause()
		} else {
			kioskPause = true
			pause()
		}
		kioskGroup.classList.toggle('show')
	})
}

kioskClick(kioskButton)

function cashOut() {
	if (!currentLoyalty) {
		currentLoyalty = 0
	}
	if (!usedLoyalty) {
		usedLoyalty = 0
	}
	var parsedPoints = '$' + ((currentLoyalty - usedLoyalty) * 0.5).toFixed(2)

	if (document.getElementById('firstInput') != null) {
		var post_first = document.getElementById('firstInput').value
	} else {
		var post_first = ''
	}
	if (document.getElementById('lastInput') != null) {
		var post_last = document.getElementById('lastInput').value
	} else {
		var post_last = ''
	}
	if (document.getElementById('birthdateInput') != null) {
		var post_birthdate = document.getElementById('birthdateInput').value
	} else {
		var post_birthdate = ''
	}
	if (document.getElementById('anniversaryInput') != null) {
		var post_anniversary = document.getElementById('anniversaryInput').value
	} else {
		var post_anniversary = ''
	}
	if (document.getElementById('emailInput') != null) {
		var post_email = document.getElementById('emailInput').value
	} else {
		var post_email = ''
	}
	let time = new Date(),
		month = time.getMonth(),
		date = time.getDate(),
		year = time.getFullYear(),
		hour = time.getHours(),
		min = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes(),
		timeStamp = month + '/' + date + '/' + year + ' ' + hour + ':' + min
	postData = JSON.stringify({
		timestamp: timeStamp,
		kiosk: kioskName,
		points: parsedPoints,
		mobile: post_mobile[0],
		isFirst: isFirst,
		first: post_first,
		last: post_last,
		birthdate: post_birthdate,
		anniversary: post_anniversary,
		email: post_email
	})
	fs.appendFile(path + '/log.txt', postData + '\n', err => {
		if (err) throw err
	})
	http.get(
		'http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' +
			user +
			'&mobile=' +
			post_mobile[0] +
			'&address=' +
			currentLoyalty +
			'&state=false',
		res => {
			var statusCode = res.statusCode, contentType = res.headers['content-type']
			var error
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' + 'Status Code: ' + statusCode)
			}
			if (error) {
				console.log(error.message)
				res.resume()
				return
			}
			res.setEncoding('utf8')
			var rawData = ''
			res.on('data', function(chunk) {
				// console.log((rawData += chunk))
			})
		}
	)
}
window.setInterval(() => {
	if (!isPaused) {
		getStuff()
	} else {
		return
	}
}, 2000)

pauseButton.addEventListener('click', () => {
	unPause()
	getStuff()
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].value = ''
	}
})

function pushStuff() {
	if (!currentLoyalty) {
		currentLoyalty = 0
	}
	if (!usedLoyalty) {
		usedLoyalty = 0
	}
	var parsedPoints = '$' + ((currentLoyalty - usedLoyalty) * 0.5).toFixed(2)

	if (document.getElementById('firstInput') != null) {
		var post_first = document.getElementById('firstInput').value
	} else {
		var post_first = ''
	}
	if (document.getElementById('lastInput') != null) {
		var post_last = document.getElementById('lastInput').value
	} else {
		var post_last = ''
	}
	if (document.getElementById('birthdateInput') != null) {
		var post_birthdate = document.getElementById('birthdateInput').value
	} else {
		var post_birthdate = ''
	}
	if (document.getElementById('anniversaryInput') != null) {
		var post_anniversary = document.getElementById('anniversaryInput').value
	} else {
		var post_anniversary = ''
	}
	if (document.getElementById('emailInput') != null) {
		var post_email = document.getElementById('emailInput').value
	} else {
		var post_email = ''
	}
	let time = new Date(),
		month = time.getMonth() + 1,
		date = time.getDate(),
		year = time.getFullYear(),
		hour = time.getHours(),
		min = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes(),
		timeStamp = month + '/' + date + '/' + year + ' ' + hour + ':' + min

	postData = JSON.stringify({
		timestamp: timeStamp,
		kiosk: kioskName,
		points: parsedPoints,
		mobile: post_mobile[0],
		first: post_first,
		last: post_last,
		birthdate: post_birthdate,
		anniversary: post_anniversary,
		email: post_email
	})
	fs.appendFile(path + '/log.txt', postData + '\n', err => {
		if (err) throw err
	})
	http.get(
		'http://www.repleotech.com/gateway/contactmanager.asp?user_guid=' +
			user +
			'&keyword=' +
			keyword +
			'&firstname=' +
			post_first +
			'&lastname=' +
			post_last +
			'&birthdate=' +
			post_birthdate +
			'&city=' +
			post_anniversary +
			'&email=' +
			post_email +
			'&mobile=' +
			post_mobile[0],
		res => {
			var statusCode = res.statusCode, contentType = res.headers['content-type']
			var error
			if (statusCode !== 200) {
				error = new Error('Request Failed.\n' + 'Status Code: ' + statusCode)
			}
			if (error) {
				console.log(error.message)
				res.resume()
				return
			}
			res.setEncoding('utf8')
			var rawData = ''
			res.on('data', chunk => {
				// console.log((rawData += chunk))
			})
		}
	)
}
/* todo ensure that form cannot be submitted with invalid input */
