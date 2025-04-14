const { getResponseObject, isEmail, isValidPassword, isValidLanguage } = require("../global/functions");
const { verify } = require("jsonwebtoken");
const { countries } = require("countries-list");

const countryList = Object.keys(countries);

function validateJWT(req, res, next) {
    const token = req.headers.authorization;
    verify(token, process.env.secretKey, async (err, decode) => {
        if (err) {
            return res.status(401).json(getResponseObject("Unauthorized Error", true, {}));
        }
        req.data = decode;
        next();
    });
}

function validateEmail(email, res, nextFunc, errorMsg = "Sorry, Please Send Valid Email !!") {
    if (!isEmail(email)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateUserType(userType, res, nextFunc, errorMsg = "Sorry, Please Send Valid User Type !!") {
    if (userType !== "user" && userType !== "admin") {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validatePassword(password, res, nextFunc, errorMsg = "Sorry, Please Send Valid Password !!") {
    if (!isValidPassword(password)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateCode(code, res, nextFunc, errorMsg = "Please Send Valid Code !!") {
    if (code.length !== 4) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateLanguage(language, res, nextFunc, errorMsg = "Sorry, Please Send Valid Language !!") {
    if (!isValidLanguage(language)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateNumbersIsGreaterThanZero(numbers, res, nextFunc, errorMsgs, defaultMsg = "Sorry, Please Send Valid Number ( Number Must Be Greater Than Zero ) !!") {
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] <= 0) {
            res.status(400).json(getResponseObject(errorMsgs[i] ? errorMsgs[i] : defaultMsg, true, {}));
            return;
        }
    }
    nextFunc();
}

function validateNumbersIsNotFloat(numbers, res, nextFunc, errorMsgs, defaultMsg = "Sorry, Please Send Valid Number ( Number Must Be Not Float ) !!") {
    for (let i = 0; i < numbers.length; i++) {
        if (numbers[i] % 1 !== 0) {
            res.status(400).json(getResponseObject(errorMsgs[i] ? errorMsgs[i] : defaultMsg, true, {}));
            return;
        }
    }
    nextFunc();
}

function validateCountry(country, res, nextFunc, errorMsg = "Sorry, Please Send Valid Country ( kuwait Or Germany Or Turkey ) !!") {
    if (!["kuwait", "germany", "turkey"].includes(country)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateCountries(countries, res, nextFunc, errorMsgs, defaultMsg = "Sorry, Please Send Valid Country !!") {
    for (let i = 0; i < countries.length; i++) {
        if (!countryList.includes(countries[i])) {
            res.status(400).json(getResponseObject(errorMsgs[i] ? errorMsgs[i] : defaultMsg, true, {}));
            return;
        }
    }
    nextFunc();
}

function validateName(name, res, nextFunc, errorMsg = "Sorry, Please Send Valid Name !!") {
    if (!name.match(/^([\u0600-\u06FF\s]+|[a-zA-Z\s]+)$/)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateIsNotExistDublicateProductId(products, res, nextFunc) {
    let seenProductIds = {};
    for (let product of products) {
        if (seenProductIds[product.productId]) {
            res.status(400).json(getResponseObject(`Sorry, Dublicate Product Id: ${product.productId} !!`, true, {}));
            return;
        }
        seenProductIds[product.productId] = true;
    }
    nextFunc();
}

function validateCheckoutStatus(checkoutStatus, res, nextFunc, errorMsg = "Sorry, Please Send Valid Checkout Status ( 'Checkout Incomplete' Or 'Checkout Successfull' ) !!") {
    if (!["Checkout Incomplete", "Checkout Successfull"].includes(checkoutStatus)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateSortMethod(sortBy, res, nextFunc, errorMsg = "Sorry, Please Send Valid Sort Method ( 'postOfDate' Or 'price' or 'numberOfOrders' ) !!") {
    if (!["postOfDate", "price", "numberOfOrders"].includes(sortBy)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateSortType(sortType, res, nextFunc, errorMsg = "Sorry, Please Send Valid Sort Type ( '-1' For Descending Sort Or '1' For Ascending Sort ) !!") {
    if (!["1", "-1"].includes(sortType)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateIsExistErrorInFiles(req, res, next) {
    const uploadError = req.uploadError;
    if (uploadError) {
        res.status(400).json(getResponseObject(uploadError, true, {}));
        return;
    }
    next();
}

function validateShippingMethod(req, res, next) {
    const shippingMethod = req.body.shippingMethod;
    if (!["normal", "ubuyblues"].includes(shippingMethod.forLocalProducts)) {
        res.status(400).json(getResponseObject("Sorry Shipping Method For Local Products Is Not Valid ( Please Send 'normal' or 'ubuyblues' Value )", true, {}));
        return;
    }
    if (!["normal", "fast"].includes(shippingMethod.forInternationalProducts)) {
        res.status(400).json(getResponseObject("Sorry Shipping Method For International Products Is Not Valid ( Please Send 'normal' or 'fast' Value )", true, {}));
        return;
    }
    next();
}

function validateTypeOfUseForCode(typeOfUse, res, nextFunc) {
    if (!["to activate account", "to reset password"].includes(typeOfUse)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

function validateOrderDestination(orderDestination, res, nextFunc) {
    if (!["admin", "user"].includes(orderDestination)) {
        res.status(400).json(getResponseObject("Please Send Valid Order Destination !!", true, {}));
        return;
    }
    nextFunc();
}

function validateOrderCreator(orderCreator, res, nextFunc) {
    if (!["user", "guest"].includes(orderCreator)) {
        res.status(400).json(getResponseObject("Please Send Valid Order Creator !!", true, {}));
        return;
    }
    nextFunc();
}

function validatePaymentGateway(paymentGate, res, nextFunc) {
    if (!["tap", "tabby", "binance"].includes(paymentGate)) {
        res.status(400).json(getResponseObject("Please Send Valid Payment Gateway !!", true, {}));
        return;
    }
    nextFunc();
}

function validateOrderStatus(status, res, nextFunc) {
    if (!["pending", "shipping", "completed"].includes(status)) {
        res.status(400).json(getResponseObject("Please Send Valid Order Status !!", true, {}));
        return;
    }
    nextFunc();
}

function validateIsPriceGreaterThanDiscount(price, discount, res, next) {
    if (Number(discount) > Number(price)) {
        return res.status(400).json(getResponseObject("Sorry, Please Send Valid Price And / Or Discount Value ( Must Be Price Greater Than Discount ) !!", true, {}));
    }
    next();
}

function validateProductImageType(type, res, nextFunc) {
    if (!["primary", "three-degree"].includes(type)) {
        res.status(400).json(getResponseObject("Please Send Valid Product Image Type ('primary' or 'three-degree') !!", true, {}));
        return;
    }
    nextFunc();
}

function keyGeneratorForRequestsRateLimit(req) {
    const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const ipWithoutPort = ipAddress.split(',')[0];
    return ipWithoutPort;
}

module.exports = {
    validateJWT,
    validateEmail,
    validateUserType,
    validatePassword,
    validateCode,
    validateLanguage,
    validateNumbersIsGreaterThanZero,
    validateNumbersIsNotFloat,
    validateCountry,
    validateCountries,
    validateName,
    validateIsNotExistDublicateProductId,
    validateCheckoutStatus,
    validateSortMethod,
    validateSortType,
    validateIsExistErrorInFiles,
    validateShippingMethod,
    validateTypeOfUseForCode,
    validateOrderDestination,
    validateOrderCreator,
    validatePaymentGateway,
    validateOrderStatus,
    validateIsPriceGreaterThanDiscount,
    validateProductImageType,
    keyGeneratorForRequestsRateLimit,
}