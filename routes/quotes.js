var express = require('express');
var router = express.Router();
var admin = require("firebase-admin");
const uuidv4 = require('uuid/v4');

var serviceAccount = require("../quotes-60ae9-firebase-adminsdk-advrp-5868a29c5f.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://quotes-60ae9.firebaseio.com/"
});

var db = admin.database();
var ref = db.ref("quotes");

/* GET users listing. */
router.post('/', function(req, res, next) {
  var id = uuidv4()
  var quoteRequest = req.body
  ref.child(id).set(quoteRequest);
  return res.json(quoteRequest);
});

router.get('/', function(req, res, next) {
  new Promise((resolve, reject) => {
    ref.on("value", function(snapshot) {
      var quotes = []
      snapshot.forEach((item) => {
        var quote = item.val()
        quotes.push({
          id: item.key,
          author: quote.author,
          quote: quote.quote
        })
      });
      resolve(quotes)

    }, function (errorObject) {
      reject(errorObject)
    });
  }).then((success) => {
    res.json(success)
  }).catch((err)=>{
    res.status(401).json(err)
  })
});

module.exports = router;
