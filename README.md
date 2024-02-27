<p align="center">

<img src="https://github.com/homebridge/branding/raw/latest/logos/homebridge-wordmark-logo-vertical.png" width="150">

</p>

<span align="center">

# Homebridge Firebase Nodes Plugin

</span>

This is a module for Homebridge that connects to Firebase through the provided configuration. The operation of this simple version entails establishing a real-time connection to a Firebase database, which must be configured beforehand.

Suppose we develop an application for this database on a NodeMCU, or alternatively, on a Raspberry Pi Zero or a MicroBit, capable of reading the data in this database. Subsequently, based on the value of the node, we can trigger a digital pin connected to an array of relays or, alternatively, to a LED strip. This enables us to effectuate direct changes from the Firebase database, greatly simplifying the task of DIY home automation.

The concept is straightforward: the module itself doesn't connect to any devices; rather, the device continuously listens to Firebase, while the module directly modifies the database.

## Configuration

We need to access https://console.firebase.google.com/. Once there, we create a new project, prompting us to give it a name such as 'Example-HomeBridge-Firebase' feel free to choose your preferred name. Next, it asks if we wish to enable Google Analytics; I recommend deactivating this option. After clicking 'Continue,' we'll have our Firebase project ready for use.

For security measures, we create an Auth by navigating to the left-hand options bar and selecting 'Auth.' From there, we choose 'Sign-in method,' creating an Email/Password method. Here, we input our email of choice and a password, making sure to remember it. Upon completion, we'll see a table displaying our email, the provider, two dates, and a UID. It's crucial to copy this UID and save it separately.

Next, we proceed to the Realtime Database section and create a new database structured like this:
```
{
  "board1": {
    "outputs": {
      "digital": {
        "2": 1,
        "12": 1,
        "13": 1,
        "14": 1
      }
    }
  }
}
```

It's essential to note that this is an example JSON; you can tailor the structure to your specific needs. Once the structure is created, we need to separately save the nodes and the URL, resembling something like this:

https://example-homebridge-firebase-771ac-default-rtdb.firebaseio.com/board1/outputs/digital/2

With this in place, we navigate to our project's settings, then to 'Service accounts,' where we'll find a page with a large button saying 'Generate new private key.' Clicking it downloads a JSON file containing the necessary data to populate our module's configuration JSON.

Add this to your '~/.homebridge/config.json' as an accessory:
```
{
    "projectId": "",
    "privateKeyId": "",
    "privateKey": "-----BEGIN PRIVATE KEY-----\-----END PRIVATE KEY-----\n",
    "clientEmail": "firebase-adminsdk-{}@{}.iam.gserviceaccount.com",
    "clientId": "",
    "client509CertUrl": "https://www.googleapis.com/robot/v1/metadata/x509/{}",
    "uid": "",
    "databaseURL": "https://{}.firebaseio.com/",
    "nodo": "board1/outputs/digital/2",
    "accessory": "FireNode",
    "name": "NodeMCU Led"
}
```