const ordersRouter = require("express").Router();

const ordersController = require("../controllers/orders.controller");

const { validateJWT, validateNumbersIsGreaterThanZero, validateNumbersIsNotFloat, validateCountry, validateName, validateEmail, validateIsNotExistDublicateProductId, validateCheckoutStatus, validateShippingMethod, validateOrderDestination, validateOrderCreator, validatePaymentGateway, validateOrderStatus, validateLanguage } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

ordersRouter.get("/orders-count",
    validateJWT,
    (req, res, next) => {
        const { pageNumber, pageSize, destination } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "Order Destination", fieldValue: destination, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => {
        const { pageNumber } = req.query;
        if (pageNumber) {
            return validateNumbersIsGreaterThanZero([req.query.pageNumber], res, next, [], "Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!");
        }
        next();
    },
    (req, res, next) => {
        const { pageSize } = req.query;
        if (pageSize) {
            return validateNumbersIsGreaterThanZero([req.query.pageSize], res, next, [], "Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!");
        }
        next();
    },
    (req, res, next) => {
        const { pageNumber } = req.query;
        if (pageNumber) {
            return validateNumbersIsNotFloat([req.query.pageNumber], res, next, [], "Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!");
        }
        next();
    },
    (req, res, next) => {
        const { pageSize } = req.query;
        if (pageSize) {
            return validateNumbersIsNotFloat([req.query.pageSize], res, next, [], "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!");
        }
        next();
    },
    (req, res, next) => validateOrderDestination(req.query.destination, res, next),
    ordersController.getOrdersCount
);

ordersRouter.get("/all-orders-inside-the-page",
    validateJWT,
    (req, res, next) => {
        const { pageNumber, pageSize, destination } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "Order Destination", fieldValue: destination, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsGreaterThanZero([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    (req, res, next) => validateOrderDestination(req.query.destination, res, next),
    ordersController.getAllOrdersInsideThePage
);

ordersRouter.get("/order-details/:orderId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    ordersController.getOrderDetails
);

ordersRouter.post("/create-new-order",
    (req, res, next) => {
        const { creator, language, checkoutStatus, billingAddress, shippingAddress, requestNotes, products, shippingMethod, couponCode } = req.body;
        const { country } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Country", fieldValue: country, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Order Creator", fieldValue: creator, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Coupon Code", fieldValue: couponCode, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Language", fieldValue: language, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Checkout Status", fieldValue: checkoutStatus, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "First Name In Billing Address", fieldValue: billingAddress?.firstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Last Name In Billing Address", fieldValue: billingAddress?.lastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Company Name In Billing Address", fieldValue: billingAddress?.companyName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Country In Billing Address", fieldValue: billingAddress?.country, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Street Address In Billing Address", fieldValue: billingAddress?.streetAddress, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Apartment Number In Billing Address", fieldValue: billingAddress?.apartmentNumber, dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "City In Billing Address", fieldValue: billingAddress?.city, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Postal Code In Billing Address", fieldValue: billingAddress?.postalCode, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Phone In Billing Address", fieldValue: billingAddress?.phone, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Email In Billing Address", fieldValue: billingAddress?.email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "First Name In Shipping Address", fieldValue: shippingAddress?.firstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Last Name In Shipping Address", fieldValue: shippingAddress?.lastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Company Name In Shipping Address", fieldValue: shippingAddress?.companyName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Country In Shipping Address", fieldValue: shippingAddress?.country, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Street Address In Shipping Address", fieldValue: shippingAddress?.streetAddress, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Apartment Number In Shipping Address", fieldValue: shippingAddress?.apartmentNumber, dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "City In Shipping Address", fieldValue: shippingAddress?.city, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Postal Code In Shipping Address", fieldValue: shippingAddress?.postalCode, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Phone In Shipping Address", fieldValue: shippingAddress?.phone, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Email In Shipping Address", fieldValue: shippingAddress?.email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Request Notes", fieldValue: requestNotes, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Order Products", fieldValue: products, dataTypes: ["array"], isRequiredValue: true },
            { fieldName: "Shipping Method", fieldValue: shippingMethod, dataTypes: ["object"], isRequiredValue: true },
            { fieldName: "Shipping Method For Local Products", fieldValue: shippingMethod?.forLocalProducts, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Shipping Method For Internationl Products", fieldValue: shippingMethod?.forInternationalProducts, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => {
        const { products } = req.body;
        validateIsExistValueForFieldsAndDataTypes(
            products.flatMap((product, index) => ([
                { fieldName: `Id In Product ${index + 1}`, fieldValue: product?.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
                { fieldName: `Quantity In Product ${index + 1}`, fieldValue: product?.quantity, dataTypes: ["number"], isRequiredValue: true },
            ]))
            , res, next);
    },
    (req, res, next) => validateName(req.query.country, res, next, "Sorry, Please Send Valid Country Name !!"),
    (req, res, next) => validateCountry(req.query.country, res, next),
    (req, res, next) => validateOrderCreator(req.body.creator, res, next),
    (req, res, next) => validateLanguage(req.body.language, res, next),
    (req, res, next) => {
        const { creator } = req.body;
        if (creator === "user") {
            validateJWT(req, res, next);
            return;
        }
        next();
    },
    (req, res, next) => {
        const { checkoutStatus } = req.body;
        if (checkoutStatus) {
            validateCheckoutStatus(checkoutStatus, res, next);
            return;
        }
        next();
    },
    (req, res, next) => validateName(req.body.billingAddress.firstName, res, next, "Sorry, Please Send Valid First Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.lastName, res, next, "Sorry, Please Send Valid Last Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.country, res, next, "Sorry, Please Send Valid Country Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.city, res, next, "Sorry, Please Send Valid City Name In Billing Address !!"),
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumbersIsGreaterThanZero([req.body.billingAddress.apartmentNumber], res, next, [], "Sorry, Please Send Valid Apartment Number In Billing Address ( Number Must Be Greater Than Zero ) !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumbersIsNotFloat([req.body.billingAddress.apartmentNumber], res, next, "Sorry, Please Send Valid Apartment Number In Billing Address ( Number Must Be Not Float ) !!");
            return;
        }
        next();
    },
    (req, res, next) => validateEmail(req.body.billingAddress.email, res, next, "Sorry, Please Send Valid Email In Billing Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.firstName, res, next, "Sorry, Please Send Valid First Name In Shipping Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.lastName, res, next, "Sorry, Please Send Valid Last Name In Shipping Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.country, res, next, "Sorry, Please Send Valid Country Name In Shipping Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.city, res, next, "Sorry, Please Send Valid City Name In Shipping Address !!"),
    (req, res, next) => {
        const { shippingAddress } = req.body;
        if (shippingAddress?.apartmentNumber) {
            validateNumbersIsGreaterThanZero([req.body.shippingAddress.apartmentNumber], res, next, [], "Sorry, Please Send Valid Apartment Number In Shipping Address ( Number Must Be Greater Than Zero ) !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { shippingAddress } = req.body;
        if (shippingAddress?.apartmentNumber) {
            validateNumbersIsNotFloat([req.body.shippingAddress.apartmentNumber], res, next, "Sorry, Please Send Valid Apartment Number In Shipping Address ( Number Must Be Not Float ) !!");
            return;
        }
        next();
    },
    (req, res, next) => validateEmail(req.body.shippingAddress.email, res, next, "Sorry, Please Send Valid Email In Shipping Address !!"),
    (req, res, next) => validateIsNotExistDublicateProductId(req.body.products, res, next),
    (req, res, next) => {
        const { products } = req.body;
        let productsQuantity = [], errorMsgs = [];
        for (let i = 0; i < products.length; i++) {
            productsQuantity.push(products[i].quantity);
            errorMsgs.push(`Sorry, Please Send Valid Quantity For Product ${i + 1} ( Number Must Be Greater Than Zero ) !!`);
        }
        validateNumbersIsGreaterThanZero(productsQuantity, res, next, errorMsgs);
    },
    validateShippingMethod,
    ordersController.postNewOrder
);

ordersRouter.post("/create-payment-order",
    (req, res, next) => {
        const { checkoutStatus, billingAddress, shippingAddress, requestNotes, products, shippingMethod, creator, paymentGateway, couponCode } = req.body;
        const { country } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Country", fieldValue: country, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Order Creator", fieldValue: creator, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Coupon Code", fieldValue: couponCode, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Payment Gate", fieldValue: paymentGateway, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Checkout Status", fieldValue: checkoutStatus, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "First Name In Billing Address", fieldValue: billingAddress?.firstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Last Name In Billing Address", fieldValue: billingAddress?.lastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Company Name In Billing Address", fieldValue: billingAddress?.companyName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Country In Billing Address", fieldValue: billingAddress?.country, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Street Address In Billing Address", fieldValue: billingAddress?.streetAddress, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Apartment Number In Billing Address", fieldValue: billingAddress?.apartmentNumber, dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "City In Billing Address", fieldValue: billingAddress?.city, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Postal Code In Billing Address", fieldValue: billingAddress?.postalCode, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Phone In Billing Address", fieldValue: billingAddress?.phone, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Email In Billing Address", fieldValue: billingAddress?.email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "First Name In Shipping Address", fieldValue: shippingAddress?.firstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Last Name In Shipping Address", fieldValue: shippingAddress?.lastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Company Name In Shipping Address", fieldValue: shippingAddress?.companyName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Country In Shipping Address", fieldValue: shippingAddress?.country, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Street Address In Shipping Address", fieldValue: shippingAddress?.streetAddress, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Apartment Number In Shipping Address", fieldValue: shippingAddress?.apartmentNumber, dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "City In Shipping Address", fieldValue: shippingAddress?.city, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Postal Code In Shipping Address", fieldValue: shippingAddress?.postalCode, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Phone In Shipping Address", fieldValue: shippingAddress?.phone, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Email In Shipping Address", fieldValue: shippingAddress?.email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Request Notes", fieldValue: requestNotes, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Order Products", fieldValue: products, dataTypes: ["array"], isRequiredValue: true },
            { fieldName: "Shipping Method", fieldValue: shippingMethod, dataTypes: ["object"], isRequiredValue: true },
            { fieldName: "Shipping Method For Local Products", fieldValue: shippingMethod?.forLocalProducts, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Shipping Method For Internationl Products", fieldValue: shippingMethod?.forInternationalProducts, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => {
        const { products } = req.body;
        validateIsExistValueForFieldsAndDataTypes(
            products.flatMap((product, index) => ([
                { fieldName: `Id In Product ${index + 1}`, fieldValue: product?.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
                { fieldName: `Quantity In Product ${index + 1}`, fieldValue: product?.quantity, dataTypes: ["number"], isRequiredValue: true },
            ]))
            , res, next);
    },
    (req, res, next) => validateName(req.query.country, res, next, "Sorry, Please Send Valid Country Name !!"),
    (req, res, next) => validateCountry(req.query.country, res, next),
    (req, res, next) => validateOrderCreator(req.body.creator, res, next),
    (req, res, next) => validatePaymentGateway(req.body.paymentGateway, res, next),
    (req, res, next) => {
        const { creator } = req.body;
        if (creator === "user") {
            validateJWT(req, res, next);
            return;
        }
        next();
    },
    (req, res, next) => {
        const { checkoutStatus } = req.body;
        if (checkoutStatus) {
            validateCheckoutStatus(checkoutStatus, res, next);
            return;
        }
        next();
    },
    (req, res, next) => validateName(req.body.billingAddress.firstName, res, next, "Sorry, Please Send Valid First Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.lastName, res, next, "Sorry, Please Send Valid Last Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.country, res, next, "Sorry, Please Send Valid Country Name In Billing Address !!"),
    (req, res, next) => validateName(req.body.billingAddress.city, res, next, "Sorry, Please Send Valid City Name In Billing Address !!"),
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumbersIsGreaterThanZero([billingAddress.apartmentNumber], res, next, [], "Sorry, Please Send Valid Apartment Number In Billing Address ( Number Must Be Greater Than Zero ) !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumbersIsNotFloat([billingAddress.apartmentNumber], res, next, [], "Sorry, Please Send Valid Apartment Number In Billing Address ( Number Must Be Not Float ) !!");
            return;
        }
        next();
    },
    (req, res, next) => validateEmail(req.body.billingAddress.email, res, next, "Sorry, Please Send Valid Email In Billing Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.firstName, res, next, "Sorry, Please Send Valid First Name In Shipping Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.lastName, res, next, "Sorry, Please Send Valid Last Name In Shipping Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.country, res, next, "Sorry, Please Send Valid Country Name In Shipping Address !!"),
    (req, res, next) => validateName(req.body.shippingAddress.city, res, next, "Sorry, Please Send Valid City Name In Shipping Address !!"),
    (req, res, next) => {
        const { billingAddress } = req.body;
        if (billingAddress?.apartmentNumber) {
            validateNumbersIsGreaterThanZero([billingAddress.apartmentNumber], res, next, [], "Sorry, Please Send Valid Apartment Number In Shipping Address ( Number Must Be Greater Than Zero ) !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { shippingAddress } = req.body;
        if (shippingAddress?.apartmentNumber) {
            validateNumbersIsNotFloat([shippingAddress.apartmentNumber], res, next, [], "Sorry, Please Send Valid Apartment Number In Shipping Address ( Number Must Be Not Float ) !!");
            return;
        }
        next();
    },
    (req, res, next) => validateEmail(req.body.shippingAddress.email, res, next, "Sorry, Please Send Valid Email In Shipping Address !!"),
    (req, res, next) => validateIsNotExistDublicateProductId(req.body.products, res, next),
    (req, res, next) => {
        const { products } = req.body;
        let productsQuantity = [], errorMsgs = [];
        for (let i = 0; i < products.length; i++) {
            productsQuantity.push(products[i].quantity);
            errorMsgs.push(`Sorry, Please Send Valid Quantity For Product ${i + 1} ( Number Must Be Greater Than Zero ) !!`);
        }
        validateNumbersIsGreaterThanZero(productsQuantity, res, next, errorMsgs);
    },
    validateShippingMethod,
    ordersController.postNewPaymentOrder
);

ordersRouter.post("/handle-checkout-complete/:orderId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    ordersController.postCheckoutComplete
);

ordersRouter.post("/handle-paypal-checkout-complete", ordersController.postPaypalCheckoutComplete);

ordersRouter.post("/update-order/:orderId",
    validateJWT,
    (req, res, next) => {
        const { status } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Is Send Email To The Customer", fieldValue: Boolean(req.query.isSendEmailToTheCustomer), dataTypes: ["boolean"], isRequiredValue: false },
            { fieldName: "Status", fieldValue: status, dataTypes: ["string"], isRequiredValue: req.query.isSendEmailToTheCustomer ? true : false },
        ], res, next);
    },
    (req, res, next) => {
        const { status } = req.body;
        if (status) {
            return validateOrderStatus(status, res, next);
        }
        next();
    },
    ordersController.putOrder
);

ordersRouter.put("/products/update-product/:orderId/:productId",
    validateJWT,
    (req, res, next) => {
        const { quantity, name, unitPrice } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Quantity", fieldValue: quantity, dataTypes: ["number"], isRequiredValue: false },
            { fieldName: "Name", fieldValue: name, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Unit Price", fieldValue: unitPrice, dataTypes: ["number"], isRequiredValue: false },
        ], res, next);
    },
    (req, res, next) => {
        const { quantity } = req.body;
        if (quantity) {
            return validateNumbersIsGreaterThanZero([quantity], res, next, [], "Sorry, Please Send Valid Quantity ( Number Must Be Greater Than Zero ) !!");
        }
        next();
    },
    (req, res, next) => {
        const { quantity } = req.body;
        if (quantity) {
            return validateNumbersIsNotFloat([quantity], res, next, [], "Sorry, Please Send Valid Quantity ( Number Must Be Greater Than Float ) !!");
        }
        next();
    },
    (req, res, next) => {
        const { unitPrice } = req.body;
        if (unitPrice) {
            return validateNumbersIsGreaterThanZero([unitPrice], res, next, [], "Sorry, Please Send Valid Unit Price ( Number Must Be Greater Than Zero ) !!");
        }
        next();
    },
    ordersController.putOrderProduct
);

ordersRouter.delete("/delete-order/:orderId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    ordersController.deleteOrder
);

ordersRouter.delete("/products/delete-product/:orderId/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Order Id", fieldValue: req.params.orderId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    ordersController.deleteProductFromOrder
);

module.exports = ordersRouter;