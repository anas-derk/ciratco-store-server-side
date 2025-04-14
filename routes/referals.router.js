const referalsRouter = require("express").Router();

const referalsController = require("../controllers/referals.controller");

const { validateEmail, validateName } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

referalsRouter.post("/add-new-referal",
    (req, res, next) => {
        const { productId, name, email, content } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: productId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "name", fieldValue: name, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Referal Content", fieldValue: content, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    (req, res, next) => validateName(req.body.name, res, next),
    referalsController.postAddNewReferal
);

referalsRouter.get("/product-referals-count/:productId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    referalsController.getProductReferalsCount
);

referalsRouter.get("/all-product-referals-inside-the-page/:productId",
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: true },
        ], res, next);
    },
    referalsController.getAllProductReferalsInsideThePage
);

module.exports = referalsRouter;