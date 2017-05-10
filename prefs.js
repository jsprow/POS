const Dexie = require('dexie'),
    prefsButton = document.getElementById('prefsButton'),
    prefsBox = document.getElementById('prefsBox'),
    clientPicker = document.getElementById('clientPicker'),
    kioskPicker = document.getElementById('kioskPicker'),
    prefsSubmit = document.getElementById('prefsSubmit')

var db = new Dexie('storage'),
    clientPicked

Dexie.debug = true

prefsButton.addEventListener('click', () => {
    prefsBox.classList.toggle('show')
})

db.version(1).stores({
    clients: 'abv, name, url, user_guid, picked',
    kiosks: 'kiosk_name, abv, keyword, kiosk_guid'
})

// db.clients.put({ abv: 'rp', name: 'Rice Pot', url: 'http://client.texnrewards.net/gateway/', user_guid: '{1A49EF01-218D-46B0-8880-502573888970}', picked: 'false' })
db.clients.put({ abv: 'pr', name: 'Pizza Ranch', url: 'http://www.repleotech.com/gateway/', user_guid: '{132643DA-4EFF-439C-847E-4AD7554D3D7A}', picked: 'true' })


// db.kiosks.put({ kiosk_name: 'Station 2', abv: 'pr', keyword: 'prkentwood', kiosk_guid: '{4B910699-82E9-4B0F-8E37-7195C48FF3FC}' })
// db.kiosks.put({ kiosk_name: 'Station 5', abv: 'pr', keyword: 'prkentwood', kiosk_guid: '{46076CD3-BA4F-48EE-A2B2-51D9D52B468E}' })
// db.kiosks.put({ kiosk_name: 'Station 6', abv: 'pr', keyword: 'prkentwood', kiosk_guid: '{0DCD53A6-FEBF-4AD3-B412-D26119D5FC06}' })

// db.kiosks.put({ kiosk_name: 'Kiosk 1', abv: 'rp', keyword: 'RicePotLebanon', kiosk_guid: '{60DEC35D-0EDA-4821-9796-AE528757D82F}' })
// db.kiosks.put({ kiosk_name: 'Kiosk 2', abv: 'rp', keyword: 'RicePotLebanon', kiosk_guid: '{ECD61094-3F26-4602-9871-54E9454F7FA1}' })
function clientFiller() {
    db.clients
        .each((client) => {
            let option = document.createElement('option')
            option.setAttribute('name', client.name)
            if (client.picked) {
                option.setAttribute('selected', 'selected')
            }
            option.innerText = client.name
            clientPicker.append(option)
        })
}
function kioskFiller() {
    db.clients
        .where('picked')
        .equals('true')
        .each((client) => {
            clientPicked = client.abv
        })
        .then(() => {
            kioskPicker.innerHTML = ''
            db.kiosks
                .where('abv').equals(clientPicked)
                .each((kiosk) => {
                    let option = document.createElement('option')
                    option.setAttribute('name', kiosk.kiosk_name)
                    option.innerText = kiosk.kiosk_name
                    kioskPicker.append(option)
                })
        })
}

function picker() {
    let value = clientPicker.value
    db.clients
        .toCollection()
        .modify((client) => {
            client.picked = 'false'
        })
        .then(() => {
            db.clients
                .where('name')
                .equals(value)
                .modify((client) => {
                    client.picked = 'true'
                })
            kioskFiller()
        })
}

new Promise((res, rej) => { clientFiller() })
    .then(kioskFiller())
    .then(picker())
    .catch((e) => { console.log(e) })


clientPicker.addEventListener('change', () => {
    picker()
})
