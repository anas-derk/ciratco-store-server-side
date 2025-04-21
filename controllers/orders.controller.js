const { getResponseObject, sendReceiveOrderEmail, sendUpdateOrderEmail, getSuitableTranslations } = require("../global/functions");

const ordersManagmentFunctions = require("../models/orders.model");

const { post } = require("axios");

const { createHmac } = require("crypto");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "destination") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "orderNumber") filtersObject[objectKey] = Number(filters[objectKey]);
        if (objectKey === "checkoutStatus") {
            if (filters["destination"] === "admin") {
                filtersObject[objectKey] = filters[objectKey];
            }
        }
        if (objectKey === "_id") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "status") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "customerName") filtersObject[`billingAddress.given_name`] = filters[objectKey];
        if (objectKey === "email") filtersObject[`billingAddress.email`] = filters[objectKey];
        if (objectKey === "customerId") {
            if (filters["destination"] === "admin") {
                filtersObject[objectKey] = filters[objectKey];
            }
        }
        if (objectKey === "isDeleted") {
            if (filters[objectKey] === "yes") {
                filtersObject[objectKey] = true;
            }
            else filtersObject[objectKey] = false;
        }
    }
    return filtersObject;
}

function getFiltersObjectForUpdateOrder(acceptableData) {
    let filterdData = {};
    if (acceptableData.status) filterdData.status = acceptableData.status;
    if (acceptableData.orderAmount) filterdData.orderAmount = acceptableData.orderAmount;
    return filterdData;

}

async function getOrdersCount(req, res) {
    try {
        res.json(await ordersManagmentFunctions.getOrdersCount(req.data._id, getFiltersObject(req.query), req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllOrdersInsideThePage(req, res) {
    try {
        const filters = req.query;
        res.json(await ordersManagmentFunctions.getAllOrdersInsideThePage(req.data._id, filters.pageNumber, filters.pageSize, getFiltersObject(filters), filters.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getOrderDetails(req, res) {
    try {
        res.json(await ordersManagmentFunctions.getOrderDetails(req.params.orderId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postNewOrder(req, res) {
    try {
        const orderData = req.body;
        if (req?.data?._id) {
            orderData.userId = req.data._id;
        }
        const result = await ordersManagmentFunctions.createNewOrder(req.body, req.query.language);
        if (!result.error) {
            if (req.body.checkoutStatus === "Checkout Successfull") {
                try {
                    await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, result.data.language);
                }
                catch (err) {
                    console.log(err);
                }
            }
            return res.json({
                ...result,
                data: {
                    orderId: result.data.orderId,
                    orderNumber: result.data.orderNumber
                }
            });
        }
        res.json(result);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postNewPaymentOrder(req, res) {
    try {
        const orderData = req.body;
        if (req?.data?._id) {
            orderData.userId = req.data._id;
        }
        const { language } = req.query;
        let result = await ordersManagmentFunctions.createNewOrder(orderData, language);
        if (result.error) {
            if (result.msg === "Sorry, This User Is Not Exist !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        else {
            if (orderData.paymentGateway === "paypal") {
                let result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v1/oauth2/token`, {
                    "grant_type": "client_credentials"
                }, {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        "Authorization": `Basic ${Buffer.from(`${process.env.PAYPAL_API_USER_NAME}:${process.env.PAYPAL_API_PASSWORD}`).toString("base64")}`
                    }
                })).data;
                result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v2/checkout/orders`, {
                    "intent": "CAPTURE",
                    "purchase_units": [
                        {
                            "amount": {
                                "currency_code": "USD",
                                "value": result.data.orderAmount
                            }
                        }
                    ],
                    "application_context": {
                        "return_url": `${process.env.NODE_ENV === "test" ? `http://localhost:3000/confirmation/${result.data._id}?country=${req.query.country}` : process.env.WEBSITE_URL}/confirmation/${result.data._id}?country=${req.query.country}`,
                        "cancel_url": `${process.env.NODE_ENV === "test" ? `http://localhost:3000/checkout/${result.data._id}?country=${req.query.country}` : process.env.WEBSITE_URL}/checkout/${result.data._id}?country=${req.query.country}`
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${result1.access_token}`
                    }
                })).data;
                return res.json(getResponseObject(getSuitableTranslations("Creating New Payment Order By Tap Process Has Been Successfully !!", language), false, {
                    paymentURL: result1.links[1].href
                }));
            }
        }
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postCheckoutComplete(req, res) {
    try {
        const result = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(req.params.orderId, req.query.language);
        res.json(result);
        if (!result.error) {
            await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
        }
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postPaypalCheckoutComplete(req, res) {
    try {
        const result = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(req.params.orderId, req.query.language);
        res.json(result);
        if (!result.error) {
            await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
        }
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putOrder(req, res) {
    try {
        const { status } = req.body;
        const result = await ordersManagmentFunctions.updateOrder(req.data._id, req.params.orderId, getFiltersObjectForUpdateOrder({ status }), req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        if (req.query.isSendEmailToTheCustomer) {
            if (status === "shipping" || status === "completed") {
                result.data.status = status;
                await sendUpdateOrderEmail(result.data.billingAddress.email, result.data, result.data.language);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putOrderProduct(req, res) {
    try {
        const result = await ordersManagmentFunctions.updateOrderProduct(req.data._id, req.params.orderId, req.params.productId, { quantity, name, unitPrice } = req.body, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!" || result.msg !== "Sorry, This Product For This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        console.log(err)
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteOrder(req, res) {
    try {
        const result = await ordersManagmentFunctions.deleteOrder(req.data._id, req.params.orderId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteProductFromOrder(req, res) {
    try {
        const { orderId, productId } = req.params;
        const result = await ordersManagmentFunctions.deleteProductFromOrder(req.data._id, orderId, productId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Order Is Not Found !!" || result.msg !== "Sorry, This Product For This Order Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    getAllOrdersInsideThePage,
    getFiltersObject,
    getOrdersCount,
    getOrderDetails,
    postNewOrder,
    postNewPaymentOrder,
    postCheckoutComplete,
    postPaypalCheckoutComplete,
    putOrder,
    putOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}