// Import  Order Model Object

const { orderModel, userModel, adminModel, productsWalletModel, productModel, mongoose } = require("../models/all.models");

const { getCouponDetails } = require("./coupons.model");

const { getSuitableTranslations } = require("../global/functions");

const isProductLocalOrInternational = (productCountries, shippingCountry) => {
    return productCountries.includes(shippingCountry) ? "local" : "international";
}

const getShippingCost = (localProductsLength, internationalProductsLength, shippingMethod, totalPriceAfterDiscount) => {
    let tempShippingCost = { forLocalProducts: 0, forInternationalProducts: 0 };
    if (localProductsLength !== 0) {
        if (shippingMethod.forLocalProducts === "ubuyblues") {
            tempShippingCost.forLocalProducts = 3.1;
        }
    }
    if (internationalProductsLength !== 0) {
        if (shippingMethod.forInternationalProducts === "normal") {
            tempShippingCost.forInternationalProducts = totalPriceAfterDiscount * 0.15;
        }
        else {
            tempShippingCost.forInternationalProducts = totalPriceAfterDiscount * 0.25;
        }
    }
    return tempShippingCost;
}

async function getOrdersCount(authorizationId, filters, language) {
    try {
        const user = filters.destination === "user" ? await userModel.findById(authorizationId) : await adminModel.findById(authorizationId);
        if (user) {
            if (filters.destination === "user") {
                filters.userId = authorizationId;
                filters.checkoutStatus = "Checkout Successfull";
            } else {
                filters.storeId = user.storeId;
            }
            delete filters.destination;
            return {
                msg: getSuitableTranslations("Get Orders Count Process Has Been Successfully !!", language),
                error: false,
                data: await orderModel.countDocuments(filters),
            }
        }
        return {
            msg: getSuitableTranslations(`Sorry, This ${user.distination.replace(user.distination[0], user.distination[0].toUpperCase())} Is Not Exist !!`, language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function getAllOrdersInsideThePage(authorizationId, pageNumber, pageSize, filters, language) {
    try {
        const user = filters.destination === "user" ? await userModel.findById(authorizationId) : await adminModel.findById(authorizationId);
        if (user) {
            if (filters.destination === "user") {
                filters.userId = authorizationId;
                filters.checkoutStatus = "Checkout Successfull";
            } else {
                filters.storeId = user.storeId;
            }
            delete filters.destination;
            return {
                msg: getSuitableTranslations("Get All Orders Inside The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
                error: false,
                data: {
                    orders: await orderModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize).sort({ orderNumber: -1 }),
                    ordersCount: await orderModel.countDocuments(filters),
                }
            }
        }
        return {
            msg: getSuitableTranslations(`Sorry, This ${user.distination.replace(user.distination[0], user.distination[0].toUpperCase())} Is Not Exist !!`, language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function getOrderDetails(orderId, language) {
    try {
        const order = await orderModel.findById(orderId);
        if (order) {
            return {
                msg: getSuitableTranslations("Get Order Details Process Has Been Successfully !!", language),
                error: false,
                data: order,
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Order Is Not Found !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

const isExistOfferOnProduct = (startDateAsString, endDateAsString) => {
    if (
        startDateAsString &&
        endDateAsString
    ) {
        const currentDate = new Date();
        if (
            currentDate >= new Date(startDateAsString) &&
            currentDate <= new Date(endDateAsString)
        ) {
            return true;
        }
        return false;
    }
    return false;
}

async function createNewOrder(orderDetails, language) {
    try {
        if (orderDetails.userId) {
            const user = await userModel.findById(orderDetails.userId);
            if (!user) {
                return {
                    msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
                    error: true,
                    data: {},
                }
            }
        }
        const existOrderProducts = await productModel.find({ _id: { $in: orderDetails.products.map((product) => product.productId) } });
        if (existOrderProducts.length === 0) {
            return {
                msg: getSuitableTranslations("Sorry, Please Send At Least One Product !!", language),
                error: true,
                data: {},
            }
        }
        if (existOrderProducts.length < orderDetails.products.length) {
            for (let product of orderDetails.products) {
                let isExistProduct = false;
                for (let existProduct of existOrderProducts) {
                    if ((new mongoose.Types.ObjectId(product.productId)).equals(existProduct._id)) {
                        isExistProduct = true;
                        break;
                    }
                }
                if (!isExistProduct) {
                    return {
                        msg: getSuitableTranslations("Sorry, Product Id: {{productId}} Is Not Exist !!", language, { productId: product.productId }),
                        error: true,
                        data: {},
                    }
                }
            }
        }
        let storeIdsAssociatedWithTheirProducts = [existOrderProducts[0].storeId];
        for (let product of existOrderProducts) {
            if (storeIdsAssociatedWithTheirProducts.includes(product.storeId)) {
                continue;
            }
            return {
                msg: getSuitableTranslations("Sorry, All Products Must Be From The Same Store !!", language),
                error: true,
                data: {},
            }
        }
        const orderedProducts = orderDetails.products.map((product) => existOrderProducts.find((existProduct) => (new mongoose.Types.ObjectId(product.productId)).equals(existProduct._id)));
        for (let i = 0; i < orderedProducts.length; i++) {
            if ((new mongoose.Types.ObjectId(orderDetails.products[i].productId)).equals(orderedProducts[i]._id)) {
                if (orderedProducts[i].quantity === 0) {
                    return {
                        msg: getSuitableTranslations("Sorry, The Product With The ID: {{productId}} Is Not Available ( Quantity Is 0 ) !!", language, { productId: orderedProducts[i]._id }),
                        error: true,
                        data: {},
                    }
                }
                if (orderDetails.products[i].quantity > orderedProducts[i].quantity) {
                    return {
                        msg: getSuitableTranslations("Sorry, Quantity For Product Id: {{productId}} Greater Than Specific Quantity ( {{quantity}} ) !!", language, { productId: orderedProducts[i]._id, quantity: orderedProducts[i].quantity }),
                        error: true,
                        data: {},
                    }
                }
            }
        }
        if (orderDetails.couponCode) {
            const result = await getCouponDetails(orderDetails.couponCode);
            if (result.error) {
                return result;
            }
            delete orderDetails.couponCode;
            orderDetails.couponDetails = { code: result.data.code, discountPercentage: result.data.discountPercentage, storeId: result.data.storeId }
        }
        let orderProductsDetails = [];
        for (let i = 0; i < orderedProducts.length; i++) {
            orderProductsDetails.push({
                productId: orderedProducts[i]._id,
                name: orderedProducts[i].name,
                unitPrice: orderedProducts[i].price,
                unitDiscount: isExistOfferOnProduct(orderedProducts[i].startDiscountPeriod, orderedProducts[i].endDiscountPeriod) ? orderedProducts[i].discountInOfferPeriod : orderedProducts[i].discount,
                quantity: orderDetails.products[i].quantity,
                imagePath: orderedProducts[i].imagePath,
                countries: orderedProducts[i].countries,
            });
        }
        const totalPrices = {
            totalPriceBeforeDiscount: 0,
            totalDiscount: 0,
            totalPriceAfterDiscount: 0
        }
        let localProducts = [], internationalProducts = [];
        for (let product of orderProductsDetails) {
            totalPrices.totalPriceBeforeDiscount += product.unitPrice * product.quantity;
            totalPrices.totalDiscount += product.unitDiscount * product.quantity;
            if (isProductLocalOrInternational(product.countries, orderDetails.shippingAddress.country) === "local") {
                localProducts.push(product);
            } else {
                internationalProducts.push(product);
            }
        }
        totalPrices.totalPriceAfterDiscount = totalPrices.totalPriceBeforeDiscount - totalPrices.totalDiscount;
        const shippingMethod = {
            forLocalProducts: orderDetails.shippingMethod.forLocalProducts,
            forInternationalProducts: orderDetails.shippingMethod.forInternationalProducts,
        }
        const shippingCost = getShippingCost(localProducts.length, internationalProducts.length, shippingMethod, totalPrices.totalPriceAfterDiscount);
        const totalAmountBeforeApplyCoupon = totalPrices.totalPriceAfterDiscount + shippingCost.forLocalProducts + shippingCost.forInternationalProducts;
        const newOrder = await (
            new orderModel({
                storeId: existOrderProducts[0].storeId,
                orderNumber: await orderModel.countDocuments() + 1,
                totalPriceBeforeDiscount: totalPrices.totalPriceBeforeDiscount,
                totalDiscount: totalPrices.totalDiscount,
                totalPriceAfterDiscount: totalPrices.totalPriceAfterDiscount,
                totalAmountBeforeApplyCoupon,
                isApplyCoupon: orderDetails.couponDetails ? true : false,
                couponDetails: orderDetails.couponDetails,
                orderAmount: orderDetails.couponDetails ? totalAmountBeforeApplyCoupon - (totalAmountBeforeApplyCoupon * orderDetails.couponDetails.discountPercentage) / 100 : totalAmountBeforeApplyCoupon,
                userId: orderDetails.userId ? orderDetails.userId : "",
                creator: orderDetails.creator,
                paymentGateway: orderDetails.paymentGateway,
                checkoutStatus: orderDetails.checkoutStatus,
                billingAddress: orderDetails.billingAddress,
                shippingAddress: orderDetails.shippingAddress,
                products: orderProductsDetails,
                shippingCost,
                shippingMethod,
                language: orderDetails.language
            })
        ).save();
        if (orderDetails.userId) {
            let newProductsForUserInsideTheWallet = [];
            const orderProducts = await productsWalletModel.find({ productId: { $in: orderProductsDetails.map((product) => product.productId) }, userId: orderDetails.userId });
            for (let i = 0; i < orderProductsDetails.length; i++) {
                const wallet_productIndex = orderProducts.findIndex((wallet_product) => wallet_product.productId == orderProductsDetails[i].productId);
                if (wallet_productIndex == -1) {
                    newProductsForUserInsideTheWallet.push({
                        name: orderProductsDetails[i].name,
                        price: orderProductsDetails[i].unitPrice,
                        imagePath: orderProductsDetails[i].imagePath,
                        productId: orderProductsDetails[i].productId,
                        userId: orderDetails.userId
                    });
                }
            }
            if (newProductsForUserInsideTheWallet.length > 0) {
                await productsWalletModel.insertMany(newProductsForUserInsideTheWallet);
            }
        }
        return {
            msg: getSuitableTranslations("Creating New Order Has Been Successfuly !!", language),
            error: false,
            data: {
                totalPriceBeforeDiscount: totalPrices.totalPriceBeforeDiscount,
                totalDiscount: totalPrices.totalDiscount,
                totalPriceAfterDiscount: totalPrices.totalPriceAfterDiscount,
                orderAmount: newOrder.orderAmount,
                billingAddress: newOrder.billingAddress,
                shippingAddress: newOrder.shippingAddress,
                products: newOrder.products,
                addedDate: newOrder.addedDate,
                orderNumber: newOrder.orderNumber,
                shippingCost: newOrder.shippingCost,
                shippingMethod: newOrder.shippingMethod,
                storeId: newOrder.storeId,
                language: newOrder.language,
                _id: newOrder._id
            },
        }
    } catch (err) {
        throw Error(err);
    }
}

function editOrderPrices(order) {
    const { calcOrderTotalPrices } = require("../global/functions");
    const result = calcOrderTotalPrices(order.products);
    order.totalPriceBeforeDiscount = result.totalPriceBeforeDiscount;
    order.totalDiscount = result.totalDiscount;
    order.totalPriceAfterDiscount = result.totalPriceAfterDiscount;
    order.totalAmountBeforeApplyCoupon = order.totalPriceAfterDiscount + order.shippingCost.forLocalProducts + order.shippingCost.forInternationalProducts;
    order.orderAmount = order?.couponDetails && Object.keys(order?.couponDetails) > 0 ? order.totalAmountBeforeApplyCoupon - (order.totalAmountBeforeApplyCoupon * order.couponDetails.discountPercentage) / 100 : order.totalAmountBeforeApplyCoupon;
    return order;
}

async function updateOrder(authorizationId, orderId, newOrderDetails, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const order = await orderModel.findById(orderId);
                if (order) {
                    if (order.storeId === admin.storeId) {
                        if (order.checkoutStatus === "Checkout Successfull") {
                            await orderModel.updateOne({ _id: orderId }, { ...newOrderDetails });
                            return {
                                msg: getSuitableTranslations("Updating Order Details Process Has Been Successfully !!", language),
                                error: false,
                                data: {
                                    totalPriceBeforeDiscount: order.totalPriceBeforeDiscount,
                                    totalDiscount: order.totalDiscount,
                                    totalPriceAfterDiscount: order.totalPriceAfterDiscount,
                                    orderAmount: order.orderAmount,
                                    billingAddress: order.billingAddress,
                                    shippingAddress: order.shippingAddress,
                                    products: order.products,
                                    addedDate: order.addedDate,
                                    orderNumber: order.orderNumber,
                                    shippingCost: order.shippingCost,
                                    shippingMethod: order.shippingMethod,
                                    storeId: order.storeId,
                                    language: order.language,
                                    _id: order._id
                                },
                            }
                        }
                        return {
                            msg: getSuitableTranslations("Sorry, Permission Denied Because This Order Is Not Completed ( Not Payment ) !!", language),
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Order Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Order Is Not Found !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function changeCheckoutStatusToSuccessfull(orderId, language) {
    try {
        const order = await orderModel.findOneAndUpdate({ _id: orderId }, { checkoutStatus: "Checkout Successfull" });
        if (order) {
            const totalPrices = {
                totalPriceBeforeDiscount: 0,
                totalDiscount: 0,
                totalPriceAfterDiscount: 0
            }
            for (let product of order.products) {
                totalPrices.totalPriceBeforeDiscount += product.totalAmount;
                totalPrices.totalDiscount += product.discount * product.quantity;
                totalPrices.totalPriceAfterDiscount = totalPrices.totalPriceBeforeDiscount - totalPrices.totalDiscount;
            }
            return {
                msg: getSuitableTranslations("Updating Order Checkout Status To Successfull Process Has Been Successfully !!", language),
                error: false,
                data: {
                    orderId: order._id,
                    orderNumber: order.orderNumber,
                    billingAddress: order.billingAddress,
                    shippingAddress: order.shippingAddress,
                    products: order.products,
                    totalPriceBeforeDiscount: totalPrices.totalPriceBeforeDiscount,
                    totalDiscount: totalPrices.totalDiscount,
                    totalPriceAfterDiscount: totalPrices.totalPriceAfterDiscount,
                    shippingCost: order.shippingCost
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Order Is Not Found !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function updateOrderProduct(authorizationId, orderId, productId, newOrderProductDetails, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                let order = await orderModel.findOne({ _id: orderId });
                if (order) {
                    if (order.storeId === admin.storeId) {
                        const productIndex = order.products.findIndex((order_product) => order_product.productId == productId);
                        if (productIndex >= 0) {
                            if (newOrderProductDetails.quantity && newOrderProductDetails.unitPrice) {
                                order.products[productIndex].quantity = newOrderProductDetails.quantity;
                                order.products[productIndex].unitPrice = newOrderProductDetails.unitPrice;
                                order = editOrderPrices(order);
                            } else if (newOrderProductDetails.quantity) {
                                order.products[productIndex].quantity = newOrderProductDetails.quantity;
                            } else if (newOrderProductDetails.unitPrice) {
                                order.products[productIndex].unitPrice = newOrderProductDetails.unitPrice;
                                order = editOrderPrices(order);
                            }
                            if (newOrderProductDetails.name) {
                                order.products[productIndex].name = newOrderProductDetails.name;
                            }
                            await order.save();
                            return {
                                msg: getSuitableTranslations("Updating Order Details Process Has Been Successfuly !!", language),
                                error: false,
                                data: {},
                            }
                        }
                        return {
                            msg: getSuitableTranslations("Sorry, This Product For This Order Is Not Found !!", language),
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Order Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Order Is Not Found !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function deleteOrder(authorizationId, orderId, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const order = await orderModel.findOne({ _id: orderId });
                if (order) {
                    if (order.storeId === admin.storeId) {
                        await orderModel.updateOne({ _id: orderId }, { isDeleted: true });
                        return {
                            msg: getSuitableTranslations("Deleting Order Has Been Successfuly !!", language),
                            error: false,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Order Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Order Is Not Found !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteProductFromOrder(authorizationId, orderId, productId, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                let order = await orderModel.findOne({ _id: orderId });
                if (order) {
                    if (order.storeId === admin.storeId) {
                        const newOrderProducts = order.products.filter((order_product) => order_product.productId !== productId);
                        const newOrderProductsLength = newOrderProducts.length;
                        if (newOrderProductsLength === 0) {
                            return {
                                msg: getSuitableTranslations("Sorry, This Product For This Order Is Not Found !!", language),
                                error: true,
                                data: {},
                            }
                        }
                        if (newOrderProductsLength < order.products.length) {
                            order.products = newOrderProducts;
                            order = editOrderPrices(order);
                            await order.save();
                            return {
                                msg: getSuitableTranslations("Deleting Product From Order Has Been Successfuly !!", language),
                                error: false,
                                data: {
                                    newOrderProducts,
                                },
                            }
                        }
                        return {
                            msg: getSuitableTranslations("Sorry, This Product For This Order Is Not Found !!", language),
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Order Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Order Is Not Found !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

module.exports = {
    getAllOrdersInsideThePage,
    getOrdersCount,
    getOrderDetails,
    createNewOrder,
    updateOrder,
    changeCheckoutStatusToSuccessfull,
    updateOrderProduct,
    deleteOrder,
    deleteProductFromOrder,
}