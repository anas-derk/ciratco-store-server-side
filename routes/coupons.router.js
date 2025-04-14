const couponsRouter = require("express").Router();

const couponsController = require("../controllers/coupons.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT } = require("../middlewares/global.middlewares");

couponsRouter.get("/all-coupons",
    validateJWT,
    couponsController.getAllCoupons
);

couponsRouter.get("/coupon-details", couponsController.getCouponDetails);

couponsRouter.post("/add-new-coupon",
    validateJWT,
    (req, res, next) => {
        const { code, discountPercentage } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Code", fieldValue: code, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Discount Percentage", fieldValue: discountPercentage, dataTypes: ["number"], isRequiredValue: true },
        ], res, next);
    },
    couponsController.postAddNewCoupon
);

couponsRouter.put("/update-coupon-info/:couponId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Coupon Id", fieldValue: req.params.couponId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Discount Percentage", fieldValue: req.body.discountPercentage, dataTypes: ["number"], isRequiredValue: true },
        ], res, next);
    },
    couponsController.putCouponInfo
);

couponsRouter.delete("/:couponId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Coupon Id", fieldValue: req.params.couponId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    couponsController.deleteCoupon
);

module.exports = couponsRouter;