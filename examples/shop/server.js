var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var config = require('./config/payment');
var verkkomaksut = require('verkkomaksut');

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type         : "file",
            absolute     : true,
            filename     : __dirname + "/logs/messages.log",
            maxLogSize   : 20480,
            backups      : 10,
            category     : "debug"
        }
    ]
});
var logger = log4js.getLogger('debug');

app.use(bodyParser());

var port = process.env.PORT || 3001;

var router = express.Router();

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


    var urlset = new verkkomaksut.Urlset(
        config.host + "/checkout/success",
        config.host + "/checkout/failure",
        config.host + "/checkout/notify",
        config.host + "/checkout/pending"
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

function confirmPayment(query) {
    var rest = new verkkomaksut.Rest(config.merchantId, config.merchantSecret);

    return rest.confirmPayment(
        query.ORDER_NUMBER,
        query.TIMESTAMP,
        query.PAID,
        query.METHOD,
        query.RETURN_AUTHCODE
    );
}

router.get('/checkout/success', function(req, res) {
    if (confirmPayment(req.query)) {
        res.render('checkout_result.jade', {
            result: 'success'
        });
    } else {
        res.render('checkout_result.jade', {
            result: 'error'
        });
    }
});

router.get('/checkout/notify', function(req, res) {
    if (confirmPayment(req.query)) {
        logger.info('Payment completed successfully');
    } else {
        logger.error('Payment failed');
    }
});

router.get('/checkout/failure', function(req, res) {
    console.log(req.query, req.body);
    res.render('checkout_result.jade', {
        result: 'cancel'
    });
});


app.use('/', router);

app.listen(port);
console.log("Listen port " + port);
