# Suomen Verkkomaksut payment interface.

This is NodeJS version of interface (not official).

Suomen Verkkomaksut payment interface allows for creating payment with a server request. With the REST interface, the payment is created in advance by sending payment data as a JSON message using HTTP over SSL (HTTPS) protocol. Service returns the response message in a corresponding format.

More information can be found here: [Suomen Verkkomaksut - Integration guide](http://docs.verkkomaksut.fi/en/index-all.html)

## Install
```
npm install verkkomaksut
```

## Example
```javascript
var service = require('verkkomaksut');

// Payment return addresses.
var urlset = new verkkomaksut.Urlset(
  "https://www.example.com/fi/payment/success",
  "https://www.example.com/fi/payment/failure",
  "https://www.example.com/fi/payment/notify",
  "https://www.example.com/fi/payment/pending"
);

// Payers data.
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

var orderNumber = "1"; // Use distinguished order number
var payment = new verkkomaksut.PaymentE1(orderNumber, urlset, contact);

// Adding one or more product rows to the payment
payment.addProduct(
    "Test product",                     // product title
    "01234",                            // product code
    "1.00",                             // product quantity
    "19.90",                            // product price (/apiece)
    "23.00",                            // Tax percentage
    "0.00",                             // Discount percentage
    verkkomaksut.Product.TYPE_NORMAL    // Product type
);


payment.setLocale("en_US");

// Sending payment to Suomen Verkkomaksut service and handling possible errors
// Following is test account.
var merchantId = "13466",
    merchantSecret = "6pKF4jkv97zmqBJ3ZL8gUw5DfT2NMQ";

var module = new verkkomaksut.Rest(merchantId, merchantSecret);
module.processPayment(payment, function(err, data) {
    // data should contain token and url to redirect user to.
});
```
