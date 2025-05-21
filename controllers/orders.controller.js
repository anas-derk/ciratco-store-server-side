const { getResponseObject, sendReceiveOrderEmail, sendUpdateOrderEmail, getSuitableTranslations } = require("../global/functions");

const ordersManagmentFunctions = require("../models/orders.model");

const { post } = require("axios");

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

async function createPaypalToken() {
    try {
        return (await post(`${process.env.PAYPAL_BASE_API_URL}/v1/oauth2/token`, {
            "grant_type": "client_credentials"
        }, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Basic ${Buffer.from(`${process.env.PAYPAL_API_USER_NAME}:${process.env.PAYPAL_API_PASSWORD}`).toString("base64")}`
            }
        })).data;
    }
    catch (err) {
        throw err;
    }
}

async function createInvoiceUsingEasyBill(order) {
    try {
        return (await post(`${process.env.INVOICES_SERVICE_BASE_API_URL}/documents`,
            {
                "external_id": order._id,
                "discount_type": "AMOUNT",
                "order_number": order.orderNumber,
                "title": `Invoice for Order #${order.orderNumber}`,
                "shipping_country": "DE",
                "items": order.products.map((product) => ({
                    "quantity": product.quantity,
                    "discount_type": "QUANTITY",
                    "discount": product.discount * 100,
                    "single_price_net": product.unitPrice * 100,
                    "itemType": "PRODUCT"
                }))
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.INVOICES_SERVICE_API_KEY}`
                }
            })).data;
    }
    catch (err) {
        throw err;
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
            const success_url = `${process.env.NODE_ENV === "test" ? `http://localhost:3000/confirmation/${result.data._id}?country=${req.query.country}` : process.env.WEBSITE_URL}/confirmation/${result.data._id}?country=${req.query.country}`,
                cancel_url = `${process.env.NODE_ENV === "test" ? `http://localhost:3000/checkout/${result.data._id}?country=${req.query.country}` : process.env.WEBSITE_URL}/checkout/${result.data._id}?country=${req.query.country}`;
            if (orderData.paymentGateway === "paypal") {
                let result1 = await createPaypalToken();
                result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v2/checkout/orders`, {
                    "intent": "CAPTURE",
                    "purchase_units": [
                        {
                            "amount": {
                                "currency_code": "EUR",
                                "value": result.data.orderAmount
                            },
                            "custom_id": result.data._id
                        }
                    ],
                    "application_context": {
                        "return_url": success_url,
                        "cancel_url": cancel_url
                    }
                }, {
                    headers: {
                        Authorization: `Bearer ${result1.access_token}`
                    }
                })).data;
                return res.json(getResponseObject(getSuitableTranslations("Creating New Payment Order By Paypal Process Has Been Successfully !!", language), false, {
                    paymentURL: result1.links[1].href
                }));
            } else {
                const params = new URLSearchParams({
                    mode: "payment",
                    success_url,
                    cancel_url,
                });
                result.data.products.forEach((item, index) => {
                    params.append(`line_items[${index}][price_data][currency]`, "eur");
                    params.append(`line_items[${index}][price_data][unit_amount]`, (item.unitPrice * 100).toString());
                    params.append(`line_items[${index}][price_data][product_data][name]`, item.name[language ? language : "en"]);
                    params.append(`line_items[${index}][quantity]`, item.quantity.toString());
                });
                let result1 = (await post(
                    `${process.env.STRIPE_BASE_API_URL}/v1/checkout/sessions`,
                    params,
                    {
                        headers: {
                            Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                )).data;
                return res.json(getResponseObject(getSuitableTranslations("Creating New Payment Order By Stripe Process Has Been Successfully !!", language), false, {
                    paymentURL: result1.url
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
            try {
                await sendReceiveOrderEmail(result.data.billingAddress.email, result.data, "ar");
            }
            catch (err) {
                console.log(err);
            }
        }
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postPaypalCheckoutComplete(req, res) {
    try {
        const result = req.body;
        if (result?.event_type === "CHECKOUT.ORDER.APPROVED") {
            let result1 = await createPaypalToken();
            result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v2/checkout/orders/${result.resource.id}/capture`, {}, {
                headers: {
                    Authorization: `Bearer ${result1.access_token}`
                }
            })).data;
            if (result1.status === "COMPLETED") {
                result1 = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(result.resource.purchase_units[0].custom_id, "en");
                res.json(result1);
                if (!result1.error) {
                    try {
                        await sendReceiveOrderEmail(result1.data.billingAddress.email, result1.data, "ar");
                        return;
                    }
                    catch (err) {
                        console.log(err);
                        return;
                    }
                }
            }
        }
        res.json({
            msg: "Sorry, This Event Type Is Not Valid !!",
            error: true,
            data: {}
        });
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postStripeCheckoutComplete(req, res) {
    try {
        const result = req.body;
        console.log(result);

        // if (result?.event_type === "CHECKOUT.ORDER.APPROVED") {
        //     let result1 = await createPaypalToken();
        //     result1 = (await post(`${process.env.PAYPAL_BASE_API_URL}/v2/checkout/orders/${result.resource.id}/capture`, {}, {
        //         headers: {
        //             Authorization: `Bearer ${result1.access_token}`
        //         }
        //     })).data;
        //     if (result1.status === "COMPLETED") {
        //         result1 = await ordersManagmentFunctions.changeCheckoutStatusToSuccessfull(result.resource.purchase_units[0].custom_id, "en");
        //         res.json(result1);
        //         if (!result1.error) {
        //             try {
        //                 await sendReceiveOrderEmail(result1.data.billingAddress.email, result1.data, "ar");
        //                 return;
        //             }
        //             catch (err) {
        //                 console.log(err);
        //                 return;
        //             }
        //         }
        //     }
        // }
        res.json({
            msg: "Sorry, This Event Type Is Not Valid !!",
            error: true,
            data: {}
        });
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
    postStripeCheckoutComplete,
    putOrder,
    putOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}