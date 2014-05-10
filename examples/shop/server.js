var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config/payment');
//var mongoose = require('mongoose');
//var Bear = require('./app/models/bear');

//mongoose.connect('mongodb://root:password@novus.modulusmongo.net:27017/Poniw5iw');

app.use(bodyParser());

var port = process.env.PORT || 3001;

var router = express.Router();

// Middleware to use for all requests.
/*router.use(function(req, res, next) {
    next(); // go to the next route.
});*/

router.get('/', function(req, res) {
    res.json({ message: 'welcome' });
});

router.route('/checkout').
get(function(req, res) {
    res.render('checkout.jade');
}).
post(function(req, res, next) {

    var order = {
        _id: "abcde1234", // This could be ID from database.
        vat: 0,
        customer: {
            first_name: "John",
            last_name: "Doe",
            email: "jdoe@example.com",
            address: "Some street, 1",
            postalcode: "12345",
            city: "Helsinki",
            phone: "123456789"
        }
    };

    var verkkomaksut = require('verkkomaksut');

    var urlset = new verkkomaksut.Urlset(
        config.host + "/payment/success",
        config.host + "/payment/failure",
        config.host + "/payment/notify",
        config.host + "/payment/pending"
    );

    var countryCode = "FI";

    var contact = new verkkomaksut.Contact(
        order.customer.first_name,          // first name
        order.customer.last_name,           // surname
        order.customer.email,               // email address
        order.customer.address,             // street address
        order.customer.postalcode,          // postal code
        order.customer.city,                // post office
        "FI",                               // country code (ISO-3166)
        order.customer.phone,               // telephone number
        "",                                 // mobile phone number
        ""                                  // company name
    );

    // Payment creation
    var payment = new verkkomaksut.PaymentE1(order._id, urlset, contact);

    // Adding one or more product rows to the payment
    payment.addProduct(
        req.body.product.name,           // product title
        "",                              // product code
        req.body.product.quantity,       // product quantity
        req.body.product.price,          // product price (/apiece)
        order.vat || 0,                  // Tax percentage
        "0.00",                          // Discount percentage
        verkkomaksut.Product.TYPE_NORMAL // Product type
    );

    payment.addProduct(
        "Shipping",
        "",
        1,
        req.body.shipping_price,
        "0.00",
        "0.00",
        verkkomaksut.Product.TYPE_POSTAL
    );

    payment.setLocale("fi_FI");

    // Sending payment to Suomen Verkkomaksut service and handling possible errors
    var rest = new verkkomaksut.Rest(config.merchantId, config.merchantSecret);
    rest.processPayment(payment, function(err, data) {
        console.log(data, err);

        if (data && data.url) {
            res.writeHead(302, {
                'Location': data.url
            });
            res.end();
        } else if (err) {
            res.status(500);
            res.send(err);
        } else {
            res.status(500);
            res.send('Error happened during payment');
        }

    });

});

router.route('/bears')
    .post(function(req, res) {
        var bear = new Bear();
        bear.name = req.body.name;

        console.log('Got POST');
        bear.save(function(err) {
            if (err) res.send(err);

            console.log(arguments);
            res.json({ message: 'Bear created!' });
        });
    })
    .get(function(req, res) {
        Bear.find(function(err, bears) {
            if (err) res.send(err);

            res.json(bears);
        });
    });

router.route('/bears/:bear_id')
    .get(function(req, res) {
        Bear.findById(req.params.bear_id, function(err, bear) {
            if (err) res.send(err);

            res.json(bear);
        });
    })
    .put(function(req, res) {

        // use our bear model to find the bear we want
        Bear.findById(req.params.bear_id, function(err, bear) {

            if (err)
                res.send(err);

            bear.name = req.body.name;  // update the bears info

            // save the bear
            bear.save(function(err) {
                if (err)
                    res.send(err);

                res.json({ message: 'Bear updated!' });
            });

        });
    })
    .delete(function(req, res) {
        Bear.remove({
            _id: req.params.bear_id
        }, function(err, bear) {
            if (err)
                res.send(err);

            res.json({ message: 'Successfully deleted' });
        });
    });

app.use('/', router);

app.listen(port);
console.log("Listen port " + port);
