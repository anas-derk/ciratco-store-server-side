const storesRouter = require("express").Router();

const storesController = require("../controllers/stores.controller");

const { validateJWT, validatePassword, validateEmail, validateLanguage, validateName, validateIsExistErrorInFiles, validateNumbersIsGreaterThanZero, validateNumbersIsNotFloat } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const multer = require("multer");

storesRouter.get("/stores-count", storesController.getStoresCount);

storesRouter.get("/all-stores-inside-the-page",
    (req, res, next) => {
        const { pageNumber, pageSize, _id } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "Store Id", fieldValue: _id, dataTypes: ["ObjectId"], isRequiredValue: false },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsGreaterThanZero([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    storesController.getAllStoresInsideThePage
);

storesRouter.get("/store-details/:storeId",
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    storesController.getStoreDetails
);

storesRouter.get("/main-store-details", storesController.getMainStoreDetails);

storesRouter.post("/create-new-store",
    multer({
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!file) {
                req.uploadError = "Sorry, No File Uploaded, Please Upload The File";
                return cb(null, false);
            }
            if (
                file.mimetype !== "image/jpeg" &&
                file.mimetype !== "image/png" &&
                file.mimetype !== "image/webp"
            ) {
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG, PNG And Webp files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single("storeImg"),
    validateIsExistErrorInFiles,
    (req, res, next) => {
        const { name, ownerFirstName, ownerLastName, ownerEmail, productsType, productsDescription, language } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Name", fieldValue: name, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Owner First Name", fieldValue: ownerFirstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Owner Last Name", fieldValue: ownerLastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Owner Email", fieldValue: ownerEmail, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Products Type", fieldValue: productsType, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Products Description", fieldValue: productsDescription, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Language", fieldValue: language, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateName(req.body.ownerFirstName, res, next),
    (req, res, next) => validateName(req.body.ownerLastName, res, next),
    (req, res, next) => validateEmail(req.body.ownerEmail, res, next),
    (req, res, next) => validateLanguage(req.body.language, res, next),
    storesController.postNewStore
);

storesRouter.post("/approve-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Password", fieldValue: req.query.password, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validatePassword(req.query.password, res, next),
    storesController.postApproveStore
);

storesRouter.put("/update-store-info/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: false },
        ], res, next);
    },
    storesController.putStoreInfo
);

storesRouter.put("/blocking-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "Blocking Reason", fieldValue: req.query.blockingReason, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    storesController.putBlockingStore
);

storesRouter.put("/cancel-blocking/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    storesController.putCancelBlockingStore
);

storesRouter.put("/change-store-image/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    multer({
        storage: multer.memoryStorage(),
        fileFilter: (req, file, cb) => {
            if (!file) {
                req.uploadError = "Sorry, No Files Uploaded, Please Upload The Files";
                return cb(null, false);
            }
            if (
                file.mimetype !== "image/jpeg" &&
                file.mimetype !== "image/png" &&
                file.mimetype !== "image/webp"
            ) {
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG, PNG And Webp files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single("storeImage"),
    validateIsExistErrorInFiles,
    storesController.putStoreImage
);

storesRouter.delete("/delete-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: false },
        ], res, next);
    },
    storesController.deleteStore
);

storesRouter.delete("/reject-store/:storeId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: req.params.storeId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    storesController.deleteRejectStore
);

module.exports = storesRouter;