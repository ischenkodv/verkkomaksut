var mocha  = require('mocha');
var expect = require('chai').expect;

describe("Verkkomaksut", function () {

    var verkkomaksut;

    beforeEach(function(done){
        verkkomaksut = require('../index');
        done();
    });

    it("should be able to create Urlset", function(){
        var Urlset = new verkkomaksut.Urlset(
            'http://example.com/success',
            'http://example.com/failure',
            'http://example.com/notify',
            'http://example.com/pending'
        )

        expect(Urlset.successUrl).to.equal('http://example.com/success');
        expect(Urlset.failureUrl).to.equal('http://example.com/failure');
        expect(Urlset.notificationUrl).to.equal('http://example.com/notify');
        expect(Urlset.pendingUrl).to.equal('http://example.com/pending');
    });

    it("can make request to gateway", function(done){

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

    /*it("should know its version", function () {
        var verkkomaksut = require('../index');
        expect(verkkomaksut.version).to.not.equal(undefined);
        expect(verkkomaksut.version).to.equal('0.0.0');
    });*/
});
