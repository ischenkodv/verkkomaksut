var mocha  = require('mocha');
var expect = require('chai').expect;

describe("Verkkomaksut", function () {

    var verkkomaksut = require('../index');

    var createUrlset = function(){
        return new verkkomaksut.Urlset(
            'http://example.com/success',
            'http://example.com/failure',
            'http://example.com/notify',
            'http://example.com/pending'
        );
    }

    var createContact = function(){
        return new verkkomaksut.Contact(
            "Test",                             // first name
            "Person",                           // surname
            "test.person@democompany.com",      // email address
            "Test street 1",                    // street address
            "12340",                            // postal code
            "Helsinki",                         // post office
            "FI",                               // maa (ISO-3166)
            "040123456",                        // telephone number
            "",                                 // mobile phone number
            "Demo Company Ltd"                  // company name
        )
    }


    /*beforeEach(function(done){
        done();
    });*/

    /*afterEach(function(done){
        done();
    });*/

    it("should be able to create Urlset", function(){

        var urlset = new verkkomaksut.Urlset(
            'http://example.com/success',
            'http://example.com/failure',
            'http://example.com/notify',
            'http://example.com/pending'
        )

        expect(urlset.successUrl).to.equal('http://example.com/success');
        expect(urlset.failureUrl).to.equal('http://example.com/failure');
        expect(urlset.notificationUrl).to.equal('http://example.com/notify');
        expect(urlset.pendingUrl).to.equal('http://example.com/pending');
    });

    it("can make request to gateway", function(done){

        var urlset = createUrlset();
        var contact = createContact();

        // Payment creation
        var orderNumber = "1";                     // Use distinguished order number
        var payment = new verkkomaksut.PaymentE1(orderNumber, urlset, contact);

        // Adding one or more product rows to the payment
        payment.addProduct(
            "Test product",                     // product title
            "01234",                            // product code
            "1.00",                             // product quantity
            "19.90",                            // product price (/apiece)
            "23.00",                            // Tax percentage
            "0.00",                             // Discount percentage
            verkkomaksut.Product.TYPE_NORMAL	// Product type			
        );

        payment.setLocale("en_US");


        // Sending payment to Suomen Verkkomaksut service and handling possible errors
        var module = new verkkomaksut.Rest(13466, "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");
        module.processPayment(payment, function(err, res){
            expect(res.token).to.be.a('string');
            expect(res.url.substring(0, 51)).to.equal('https://payment.verkkomaksut.fi/payment/load/token/');
            done();
        });

    });

    it("request body can have utf8 characters", function(done){

        var urlset = createUrlset();
        var contact = createContact();

        // Payment creation
        var orderNumber = "1";                     // Use distinguished order number
        var payment = new verkkomaksut.PaymentE1(orderNumber, urlset, contact);

        // Adding one or more product rows to the payment
        payment.addProduct(
            "Veriryhmämääritykset",             // product title
            "01234",                            // product code
            "1.00",                             // product quantity
            "19.90",                            // product price (/apiece)
            "23.00",                            // Tax percentage
            "0.00",                             // Discount percentage
            verkkomaksut.Product.TYPE_NORMAL	// Product type			
        );

        payment.setLocale("fi_FI");


        // Sending payment to Suomen Verkkomaksut service and handling possible errors
        var module = new verkkomaksut.Rest(13466, "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");
        module.processPayment(payment, function(err, res){
            expect(err === null).to.equal(true);
            expect(res.token).to.be.a('string');
            expect(res.url.substring(0, 51)).to.equal('https://payment.verkkomaksut.fi/payment/load/token/');
            done();
        });

    });


    it("can handle error response with wrong credentials", function(done){

        // An object is created to model all payment return addresses.
        var urlset = new verkkomaksut.Urlset(
            "https://example.com/sv/success",
            "https://example.com/sv/failure",
            "https://example.com/sv/notify",
            "https://example.com/sv/pending"
        );

        // An object is created to model payer’s data
        var contact = new verkkomaksut.Contact(
            "Test",                             // first name
            "Person",                           // surname
            "test.person@democompany.com",      // email address
            "Test street 1",                    // street address
            "12340",                            // postal code
            "Helsinki",                         // post office
            "FI",                               // maa (ISO-3166)
            "040123456",                        // telephone number
            "",                                 // mobile phone number
            "Demo Company Ltd"                  // company name
        );

        var orderNumber = 1;
        var payment = new verkkomaksut.PaymentE1(orderNumber, urlset, contact);

        var module = new verkkomaksut.Rest(1346613241324143, "asdfasfqrfadf6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");
        module.processPayment(payment, function(err, res){
            expect(err.message).to.equal('You have failed to provide valid integration id and/or secret with basic authentication');
            expect(err.code).to.equal('authentication-failed');
            done();
        });
    });


    it("returns error if contact's last name not defined", function(done){

        var urlset = createUrlset();

        var contact = new verkkomaksut.Contact(
            "Test",                             // first name
            "",                                 // surname
            "test.person@democompany.com",      // email address
            "Test street 1",                    // street address
            "12340",                            // postal code
            "Helsinki",                         // post office
            "FI",                               // maa (ISO-3166)
            "040123456",                        // telephone number
            "",                                 // mobile phone number
            "Demo Company Ltd"                  // company name
        );

        var orderNumber = 1;
        var payment = new verkkomaksut.PaymentE1(orderNumber, urlset, contact);

        var module = new verkkomaksut.Rest(13466, "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");
        module.processPayment(payment, function(err, res){
            expect(res).to.equal(undefined);
            expect(err.message).to.equal('Missing or invalid contact last name');
            expect(err.code).to.equal('invalid-contact-last-name');
            done();
        });
    });


    it("returns error if contact's first name not defined", function(done){

        var urlset = createUrlset();

        var contact = new verkkomaksut.Contact(
            "",                                 // first name
            "Last",                             // surname
            "test.person@democompany.com",      // email address
            "Test street 1",                    // street address
            "12340",                            // postal code
            "Helsinki",                         // post office
            "FI",                               // maa (ISO-3166)
            "040123456",                        // telephone number
            "",                                 // mobile phone number
            "Demo Company Ltd"                  // company name
        );

        var orderNumber = 1;
        var payment = new verkkomaksut.PaymentE1(orderNumber, urlset, contact);

        var module = new verkkomaksut.Rest(13466, "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");
        module.processPayment(payment, function(err, res){
            expect(res).to.equal(undefined);
            expect(err.message).to.equal('Missing or invalid contact first name');
            expect(err.code).to.equal('invalid-contact-first-name');
            done();
        });
    });

    it("confirm payment using hash", function(done){
        var module = new verkkomaksut.Rest(13466, "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");

        var resp = {
            ORDER_NUMBER: '4fbab82c744f026a14000001',
            TIMESTAMP: '1337636938',
            PAID: '8fc0572381',
            METHOD: '1',
            RETURN_AUTHCODE: '5C9A6694A323ADB71EABCDC0DE066DAC'
        }

        expect(module.confirmPayment(resp.ORDER_NUMBER, resp.TIMESTAMP, resp.PAID, resp.METHOD, resp.RETURN_AUTHCODE)).to.equal(true);
        done();
    });

    it("rejects payment with wrong hash", function(done){
        var module = new verkkomaksut.Rest(13466, "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ");

        var resp = {
            ORDER_NUMBER: '4fbab82c744f026a14000001',
            TIMESTAMP: '1337636938',
            PAID: '8fc0572381',
            METHOD: '1',
            RETURN_AUTHCODE: 'WRONG_HASH_3ADB71EABCDC0DE066DAC'
        }

        expect(module.confirmPayment(resp.ORDER_NUMBER, resp.TIMESTAMP, resp.PAID, resp.METHOD, resp.RETURN_AUTHCODE)).to.equal(false);
        done();
    });


});
