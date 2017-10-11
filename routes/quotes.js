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
            const randomPosition = Math.floor(Math.random() * quotes.length)
            resolve(quotes[randomPosition])
        }, function(errorObject) {
            reject(errorObject)
        });
    }).then((success) => {
        res.json(success)
    }).catch((err) => {
        res.status(401).json(err)
    })
});

module.exports = router;