const ratingsRouter = require("express").Router();

const ratingsController = require("../controllers/ratings.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT } = require("../middlewares/global.middlewares");

const { validateRating } = require("../middlewares/users.midddlewares");

ratingsRouter.post("/select-product-rating",
    validateJWT,
    (req, res, next) => {
        const { productId, rating } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: productId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Rating", fieldValue: rating, dataTypes: ["number"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateRating(req.body.rating, res, next),
    ratingsController.postSelectProductRating
);

ratingsRouter.get("/product-rating-by-user-id/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    ratingsController.getProductRatingByUserId
);

module.exports = ratingsRouter;