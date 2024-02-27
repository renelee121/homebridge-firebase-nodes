const path_RE = /\{\$[^${]+\}/g;
var Service, Characteristic;
const admin = require('firebase-admin');
module.exports = function (homebridge) {
    Service = homebridge.hap.Service;
    Characteristic = homebridge.hap.Characteristic;

    homebridge.registerAccessory("homebridge-firebase-nodes", "FireNode", fireNode);
};

class fireNode {
    constructor(log, config) {
        var self = this;
        this.log = log;
        this.name = config.name;
        this.projectId = config.projectId;
        this.privateKeyId = config.privateKeyId;
        this.privateKey = config.privateKey;
        this.clientEmail = config.clientEmail;
        this.clientId = config.clientId;
        this.client509CertUrl = config.client509CertUrl;
        this.uid = config.uid;
        this.databaseURL = config.databaseURL;
        this.nodo = config.nodo;
        this.accessory = config.accessory;
        this._state = false;
        this.serviceAccountKey = {
            'type': 'service_account',
            'project_id': this.projectId,
            'private_key_id': this.privateKeyId,
            'private_key': this.privateKey,
            'client_email': this.clientEmail,
            'client_id': this.clientId,
            'auth_uri': 'https://accounts.google.com/o/oauth2/auth',
            'token_uri': 'https://oauth2.googleapis.com/token',
            'auth_provider_x509_cert_url': 'https://www.googleapis.com/oauth2/v1/certs',
            'client_x509_cert_url': this.client509CertUrl,
            'universe_domain': 'googleapis.com',
        };
        this.currentTime = performance.timing.navigationStart + performance.now();
        admin.initializeApp({
            credential: admin.credential.cert(this.serviceAccountKey),
            databaseURL: this.databaseURL,
        },this.currentTime.toString());
        
    }

    async getState(callback) {
        try {
            const db = admin.database();
            const ref = db.ref(this.nodo);
    
            ref.once('value', (snapshot) => {
                const value = snapshot.val();
                this._state = value == 1 ? false : true;
                callback(null, this._state); // Devolver el estado al callback una vez obtenido
            }, (errorObject) => {
                console.log('The read failed: ' + errorObject.name);
                callback(errorObject); // Devolver cualquier error al callback
            });
        } catch (error) {
            console.error('Error al obtener el estado:', error);
            callback(error); // Devolver cualquier error al callback
        }
    }
    

    async setState(val, callback) {
        try {
            const customToken = await admin.auth().createCustomToken(this.uid);
            const db = admin.database();
            const ref = db.ref(this.nodo);
            ref.once('value', (snapshot) => {
                let value = snapshot.val();
                ref.set(value == 1 ? 0 : 1)
                    .then(() => {
                        console.log('Nodo modificado exitosamente');
                        this._state = value == 1 ? false : true;
                        callback(null, this._state);
                    })
                    .catch(error => {
                        console.error('Error al modificar el nodo:', error);
                        callback(error);
                    });
            });
        } catch (error) {
            console.error('Error de autenticación:', error);
            callback(error)
        } 
    }


    identify(callback) {
        this.log("Identify requested");
        callback();
    }

    getServices() {
        var switchService = new Service.Switch(this.name);

        switchService
            .getCharacteristic(Characteristic.On)
            .on('get', this.getState.bind(this))
            .on('set', this.setState.bind(this));

        return [switchService];
    }
}
