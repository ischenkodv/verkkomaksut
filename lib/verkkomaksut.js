exports.version = require('../package').version;

function VerkkomaksutError(message, code, file, line){
    this.message = message;
    this.code = code;
    this.file = file;
    this.line = line;
}
VerkkomaksutError.prototype = new Error();
VerkkomaksutError.prototype.constructor = VerkkomaksutError;


/**
 * Urlset object describes all return urls used with the service
 */
function Urlset(successUrl, failureUrl, notificationUrl, pendingUrl) {
    this.successUrl      = successUrl;
    this.failureUrl      = failureUrl;
    this.notificationUrl = notificationUrl;
    this.pendingUrl      = pendingUrl;
}

/**
 * Verkkomaksut contact data structure holds information about payment
 * actor. This information is saved with the payment and is available
 * with the payment in merchant's panel.
 * 
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} email
 * @param {string} addrStreet
 * @param {string} addrZip
 * @param {string} addrCity
 * @param {string} addrCountry
 * @param {string} telNo
 * @param {string} cellNo
 * @param {string} company
 */
function Contact(firstName, lastName, email, addrStreet, addrPostalCode, addrPostalOffice, addrCountry, telNo, cellNo, company) {
    this.firstName        = firstName;
    this.lastName         = lastName;
    this.email            = email;
    this.addrStreet       = addrStreet;
    this.addrPostalCode   = addrPostalCode;
    this.addrPostalOffice = addrPostalOffice;
    this.addrCountry      = addrCountry;
    this.telNo            = telNo || '';
    this.cellNo           = cellNo || '';
    this.company          = company || '';
}


/**
 * Product object acts as a payment products. There is one product object
 * for each product row. Product objects are automatically generated when
 * payment function addProduct is called. You never need to directly work
 * with product objects.
 *
 * @param {string} title
 * @param {string} code
 * @param {float} amount
 * @param {float} price
 * @param {flaot} vat
 * @param {float} discount
 * @param {int} type
 */
function Product(title, code, amount, price, vat, discount, type) {
    this.title    = title;
    this.code     = code;
    this.amount   = amount;
    this.price    = price;
    this.vat      = vat;
    this.discount = discount;
    this.type     = type;
}

Product.TYPE_NORMAL   = 1;
Product.TYPE_POSTAL   = 2;
Product.TYPE_HANDLING = 3;



/**
 * This object is returned when a payment is processed to Suomen Verkkomaksut
 * It allows you to query for token or url
 */
function Result(token, url) {
    this.token = token;
    this.url   = url;
}

Result.prototype.getToken = function() {
    return this.token;
}

Result.prototype.getUrl = function() {
    return this.url;
}


function Payment(orderNumber, urlset) {
    this.orderNumber;
    this.urlset;
    this.referenceNumber = "";
    this.description     = "";
    this.currency        = "EUR";
    this.locale          = "fi_FI";

    this.orderNumber     = orderNumber;
    this.urlset          = urlset;
}

/**
 * @return {string} Order number for this payment
 */
Payment.prototype.getOrderNumber = function() {
    return this.orderNumber;
};

/**
 * @return {Urlset} Payment return url object for this payment
 */
Payment.prototype.getUrlset = function() {
    return this.urlset;
};

/**
 * You can set a reference number for a payment but it is *not* recommended.
 * 
 * Reference number set using this function will only be used for interface payments.
 * Interface payment means a payment done with such a payment method that is used
 * with own contract (using Verkkomaksut only as a technical API). If payment is made
 * with payment method that is used directly with Verkkomaksut contract, this value
 * is not used - instead Verkkomaksut uses auto generated reference number.
 * 
 * Using custom reference number may be useful if you need to automatically confirm
 * payments paid directly to your own account with your own contract. With custom
 * reference number you can match payments with it.
 * 
 * @param {referenceNumber} Customer reference number
 */
Payment.prototype.setCustomReferenceNumber = function(referenceNumber) {
    this.referenceNumber = referenceNumber;
}

/**
 * @return {string} Custom reference number attached to this payment
 */
Payment.prototype.getCustomReferenceNumber = function() {
    return this.referenceNumber;
}
    
    
/**
 * Change used locale. Locale affects language and number and date presentation formats.
 * 
 * Verkkomaksut supports currently three locales: Finnish (fi_FI), English (en_US)
 * and Swedish (sv_SE). Default locale is fi_FI.
 * 
 * @param {string} locale
 */
Payment.prototype.setLocale = function(locale) {
    if (["fi_FI", "en_US", "sv_SE"].indexOf(locale) === -1) {
        throw new Error("Given locale is unsupported.");
    }
    
    this.locale = locale;
}

/**
 * @return {string} Locale attached to this payment
 */
Payment.prototype.getLocale = function() {
    return this.locale;
}

/**
 * Set non-default currency. Currently the default currency (EUR) is only supported
 * value.
 * 
 * @param {currency} Currency in which product prices are given
 */
Payment.prototype.setCurrency = function(currency) {
    if (currency != "EUR") {
        throw new Error("Currently EUR is the only supported currency.");
    }
    
    this.currency = currency;
}

/**
 * @return {string} Currency attached to this payment
 */
Payment.prototype.getCurrency = function() {
    return this.currency;
}

/**
 * You may optionally set description for the payment. This message
 * will only be visible in merchant's panel with the payment - nowhere else.
 * It allows you to save additional data with payment when necessary.
 * 
 * @param {string} description Private payment description
 */
Payment.prototype.setDescription = function(description) {
    this.description = description;
}
    
/**
 * @return {string} Description attached to this payment
 */
Payment.prototype.getDescription = function() {
    return this.description;
}

/**
 * Get payment data as array
 * 
 * @return {array} REST API compatible payment data
 * @throws VerkkomaksutError
 */
Payment.prototype.getJsonData = function() {
    throw new VerkkomaksutError("Payment class is not meant to be used directly. Use E1 or S1 module instead.");
}



function PaymentS1(orderNumber, urlset, price) {
    Payment.apply(this, [orderNumber, urlset]);
    this.price;
}

PaymentS1.prototype = new Payment;

PaymentS1.prototype.getPrice = function() {
    return this.price;
}

/**
 * Get payment data as array
 * 
 * @return {array} REST API compatible payment data
 * @throws Verkkomaksut_Exception
 */
PaymentS1.prototype.getJsonData = function() {
    var data = {
        orderNumber      : this.getOrderNumber(),
        referenceNumber  : this.getCustomReferenceNumber(),
        description      : this.getDescription(),
        currency         : this.getCurrency(),
        locale           : this.getLocale(),
        urlSet           : {
            success      : this.getUrlset().successUrl,
            failure      : this.getUrlset().failureUrl,
            pending      : this.getUrlset().pendingUrl,
            notification : this.getUrlset().notificationUrl
        },
        price: this.getPrice()
    };
    
    return data;
}


/**
 * Payment object represents the actual payment to be transmitted
 * to Suomen Verkkomaksut interface
 * 
 * E1 references to Suomen Verkkomaksut interface version E1, which
 * is extended and recommended version.
 *
 * @param {string} orderNumber
 * @param {Urlset} urlset
 * @param {Contact} contact
 */
function PaymentE1(orderNumber, urlset, contact) {
    if (!(urlset instanceof Urlset)) {
        throw new VerkkomaksutError('Wrong urlset parameter');
    }

    if (!(contact instanceof Contact)) {
        throw new VerkkomaksutError('Wrong contact parameter');
    }

    this.contact;
    this.products = [];
    this.includeVat = 1;

    Payment.apply(this, [orderNumber, urlset]);

    this.orderNumber = orderNumber;
    this.contact     = contact;
    this.urlset      = urlset;
}

PaymentE1.prototype = new Payment;

/**
 * Use this function to add each order product to payment.
 * 
 * Please group same products using $amount. Verkkomaksut
 * supports up to 500 product rows in a single payment.
 * 
 * @param {string} title
 * @param {string} no
 * @param {float} amount
 * @param {float} price
 * @param {float} tax
 * @param {flaot} discount
 * @param {int} type
 */
PaymentE1.prototype.addProduct = function(title, no, amount, price, tax, discount, type) {
    if (type === null || type === undefined) {
        type = 1;
    }

    if (this.products.length >= 500) {
        throw new VerkkomaksutError("Verkkomaksut can only handle up to 500 different product rows. Please group products using product amount.");
    }

    this.products.push(new Product(title, no, amount, price, tax, discount, type));
}
    

/**
 * @return Verkkomaksut_Module_E1_Contact contact data for this payment
 */
PaymentE1.prototype.getContact = function() {
    return this.contact;
}


/**
 * @return {array} List of Verkkomaksut_Module_E1_Product objects for this payment
 */
PaymentE1.prototype.getProducts = function() {
    return this.products;
}

/**
 * You can decide whether you wish to use taxless prices (mode=0) or
 * prices which include taxes. Default mode is 1 (taxes are in prices).
 * 
 * You should always use the same mode that your web shop uses - otherwise
 * you will get problems with rounding since SV supports prices with only
 * 2 decimals.
 * 
 * @param {int} $mode
 */
PaymentE1.prototype.setVatMode = function(mode) {
    this.includeVat = mode;
}

/**
 * @return {int} Vat mode attached to this payment
 */
PaymentE1.prototype.getVatMode = function() {
    return this.includeVat;
}

/**
 * Get payment data as array
 * 
 * @return {array} REST API compatible payment data
 * @throws Verkkomaksut_Exception
 */
PaymentE1.prototype.getJsonData = function() {
    var products, product;
    var data = {
        orderNumber     : this.getOrderNumber(),
        referenceNumber : this.getCustomReferenceNumber(),
        description     : this.getDescription(),
        currency        : this.getCurrency(),
        locale          : this.getLocale(),
        urlSet          : {
            success      : this.getUrlset().successUrl,
            failure      : this.getUrlset().failureUrl,
            pending      : this.getUrlset().pendingUrl,
            notification : this.getUrlset().notificationUrl
        },
        orderDetails    : {
            includeVat : this.getVatMode(),
            contact    : {
                telephone   : this.getContact().telNo,
                mobile      : this.getContact().cellNo,
                email       : this.getContact().email,
                firstName   : this.getContact().firstName,
                lastName    : this.getContact().lastName,
                companyName : this.getContact().company,
                address     : {
                    street       : this.getContact().addrStreet,
                    postalCode   : this.getContact().addrPostalCode,
                    postalOffice : this.getContact().addrPostalOffice,
                    country      : this.getContact().addrCountry
                }
            },
            products : []
        }
    };

    products = this.getProducts();
    for (var i = 0, len = products.length; i < len; i++) {
        product = products[i];

        data["orderDetails"]["products"].push({
            title    : product.title,
            code     : product.code,
            amount   : product.amount,
            price    : product.price,
            vat      : product.vat,
            discount : product.discount,
            type     : product.type
        });
    }
    
    return data;
}


/**
 * Main module
 *
 * Initialize module with your own merchant id and merchant secret.
 * 
 * While building and testing integration, you can use demo values
 * (merchantId = 13466, merchantSecret = ...)
 * 
 * @param {int} merchantId
 * @param {string} merchantSecret
 */
function Rest(merchantId, merchantSecret) {
    this.merchantId     = merchantId || '';
    this.merchantSecret = merchantSecret || '';
}

Rest.SERVICE_URL = "https://payment.verkkomaksut.fi";

/**
 * @return {string} version as a string
 */
Rest.prototype.getVersion = function() {
    return '1.0';
}

/**
 * Get url for payment
 * 
 * @param {PaymentE1} payment
 * @param {function} cb - Callback function
 * @throws Verkkomaksut_Exception
 */
Rest.prototype.processPayment = function(payment, cb) {
    if (!(payment instanceof Payment)) {
        throw new VerkkomaksutError('Wrong payment parameter');
    }

    var data = payment.getJsonData();
    var request = require('request');
    
    // Create data array
    var url = Rest.SERVICE_URL + "/api-payment/create"; 
    var self = this;

    var callback = function(err, data) {
        if (!data) {
            return;
        }

        if (data.contentType == "application/xml") {
            var xml2js = require('xml2js');
            var parser = new xml2js.Parser();

            parser.parseString(data.response, function (err, result) {
                if (result.errorMessage && result.errorCode) {
                    cb(new VerkkomaksutError(result.errorMessage, result.errorCode));
                } else if (result.token && result.url) {
                    cb(null, new Result(result.token, result.url));
                } else {
                    cb(new VerkkomaksutError('Wrong data received'));
                }
            });

        } else if (data.contentType == "application/json") {
            var json = data.response;

            if (!json) {
                cb(new VerkkomaksutError("Module received non-JSON answer from server", "unknown-error"));
            } else if (json.errorMessage && json.errorCode) {
                cb(new VerkkomaksutError(json.errorMessage, json.errorCode));
            } else {
                cb(null, new Result(json.token, json.url));
            }

        } else {
            cb(new VerkkomaksutError('Wrong response'));
        }
    }


    var auth = 'Basic ' + new Buffer(self.merchantId + ':' + self.merchantSecret).toString('base64'); 
    request.post({
        url: url,
        json: data,
        strictSSL: true,
        encoding: 'utf8',
        headers: {
            'Authorization'              : auth,
            'Content-Type'               : 'application/json',
            'Accept'                     : 'application/json',
            'X-Verkkomaksut-Api-Version' : 1,
        }
    }, function (error, response, body) {
        if (error) {
            callback(error);
        } else {
            // Read result, including http code
            var result = {};
            result.response = body;
            result.httpCode = response.statusCode;
            result.contentType = response.headers['content-type'];

            callback(null, result);
        }
    });
}

/**
 * This function can be used to validate parameters returned by return and notify requests.
 * Parameters must be validated in order to avoid hacking of payment confirmation.
 * This function is usually used like:
 * 
 * @param {string} orderNumber
 * @param {int} timeStamp
 * @param {string} paid
 * @param {int} method
 * @param {string} authCode
 */
Rest.prototype.confirmPayment = function(orderNumber, timeStamp, paid, method, authCode) {
    var base = [orderNumber, timeStamp, paid, method, this.merchantSecret].join('|');
    var crypto = require('crypto');
    var hash = crypto.createHash('md5').update(base).digest("hex");

    return authCode === hash.toUpperCase();
}




exports.Urlset = Urlset;
exports.Contact = Contact;
exports.Product = Product;
exports.Result = Result;
exports.PaymentS1 = PaymentS1;
exports.PaymentE1 = PaymentE1;
exports.Rest = Rest;

