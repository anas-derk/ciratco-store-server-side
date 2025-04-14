const { getResponseObject, getSuitableTranslations } = require("../global/functions");

const couponsOPerationsManagmentFunctions = require("../models/coupons.model");

async function getAllCoupons(req, res) {
    try{
        const result = await couponsOPerationsManagmentFunctions.getAllCoupons(req.data._id, req.query.language);
        if (result.error) {
            return res.status(401).json(result);
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getCouponDetails(req, res) {
    try{
        const { code, language } = req.query;
        res.json(await couponsOPerationsManagmentFunctions.getCouponDetails(code, language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postAddNewCoupon(req, res) {
    try{
        const result = await couponsOPerationsManagmentFunctions.addNewCoupon(req.data._id, { code, discountPercentage } = req.body, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Coupon Is Already Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putCouponInfo(req, res) {
    try{
        const result = await couponsOPerationsManagmentFunctions.updateCouponInfo(req.data._id, req.params.couponId, req.body, req.query.language);
        if (result.error) {
            if (
                result.msg !== "Sorry, This Coupon Is Not Exist !!" ||
                result.msg !== "Sorry, This New Code Is Already Exist !!"
            ) {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteCoupon(req, res) {
    try{
        const result = await couponsOPerationsManagmentFunctions.deleteCoupon(req.data._id, req.params.couponId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Coupon Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch(err){
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    getAllCoupons,
    getCouponDetails,
    postAddNewCoupon,
    putCouponInfo,
    deleteCoupon
}