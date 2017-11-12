const express = require('express');
const router = express.Router();
const admin = require("firebase-admin");
const uuidv4 = require('uuid/v4');

const serviceAccount = require("../quotes-e487678696e1.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://quotes-60ae9.firebaseio.com/"
});

const db = admin.database();
const ref = db.ref("quotes");
const notificationsRef = db.ref("notifications");

/* GET users listing. */
router.post('/', function(req, res, next) {
    const id = uuidv4()
    const quoteRequest = req.body
    ref.child(id).set(quoteRequest);
    return res.json(quoteRequest);
});

router.get('/', function(req, res, next) {
    new Promise((resolve, reject) => {
        ref.on("value", function(snapshot) {
            var quotes = []
            snapshot.forEach((item) => {
                const quote = item.val()
                quotes.push({
                    id: item.key,
                    author: quote.author,
                    quote: quote.quote
                })
            });
            resolve(quotes)

        }, function(errorObject) {
            reject(errorObject)
        });
    }).then((success) => {
        res.json(success)
    }).catch((err) => {
        res.status(401).json(err)
    })
});

router.get('/random', function(req, res, next) {
    generateRandomQuote()
    .then((success) => {
        res.json(success)
    }).catch((err) => {
        res.status(401).json(err)
    })
});

router.post('/notification/token', function(req, res, next) {
    notificationsRef.child(req.body.token).set(req.body.token);
    return res.json(req.body.token);
});

router.get('/notification', function(req, res, next) {

    notificationsRef.on("value", function(snapshot) {
        var registrationTokens = []
        snapshot.forEach((item) => {
            const token = item.val()
            registrationTokens.push(token);
        });
        // See the "Defining the message payload" section below for details
        // on how to define a message payload.

        generateRandomQuote()
        .then((success) => {
            var payload = {
              data: success
            }
              // Send a message to the devices corresponding to the provided
            // registration tokens.
            admin.messaging().sendToDevice(registrationTokens, payload)
              .then(function(response) {
                // See the MessagingDevicesResponse reference documentation for
                // the contents of response.
                console.log("Successfully sent message:", response)
                res.json(response)
              })
              .catch(function(error) {
                console.log("Error sending message:", error)
              })
            
        }).catch((err) => {
            res.status(401).json(err)
        })
    }, function(errorObject) {
        res.status(401).json(errorObject)
    });
    
});

var generateRandomQuote = () => new Promise((resolve, reject) => {
    ref.on("value", function(snapshot) {
        var quotes = []
        snapshot.forEach((item) => {
            const quote = item.val()
            quotes.push({
                id: item.key,
                author: quote.author,
                quote: quote.quote
            })
        });
        const randomPosition = Math.floor(Math.random() * quotes.length)
        resolve(quotes[randomPosition])
    }, function(errorObject) {
        reject(errorObject)
    });
})


module.exports = router;