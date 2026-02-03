const adsRouter = require("express").Router();

const adsController = require("../controllers/ads.controller");

const multer = require("multer");

const { validateJWT, validateIsExistErrorInFiles } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

adsRouter.post("/add-new-text-ad",
    validateJWT,
    (req, res, next) => {
        const { content } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Content", fieldValue: content, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    adsController.postNewTextAd
);

adsRouter.post("/add-new-image-ad",
    validateJWT,
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
    }).single("adImage"),
    validateIsExistErrorInFiles,
    (req, res, next) => {
        const { product } = Object.assign({}, req.body);
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product", fieldValue: product, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    adsController.postNewImageAd,
);

adsRouter.get("/all-ads",
    (req, res, next) => {
        const queryData = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Store Id", fieldValue: queryData?.storeId, dataTypes: ["ObjectId"], isRequiredValue: false },
            { fieldName: "Product", fieldValue: queryData?.product, dataTypes: ["ObjectId"], isRequiredValue: false },
        ], res, next);
    },
    adsController.getAllAds
);

adsRouter.delete("/:adId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Id", fieldValue: req.params.adId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    adsController.deleteAd
);

adsRouter.put("/update-ad-image/:adId",
    validateJWT,
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
                req.uploadError = "Sorry, Invalid File Mimetype, Only JPEG and PNG Or WEBP files are allowed !!";
                return cb(null, false);
            }
            cb(null, true);
        }
    }).single("adImage"),
    validateIsExistErrorInFiles,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Id", fieldValue: req.params.adId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    adsController.putAdImage
);

adsRouter.put("/update-ad-content/:adId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Ad Id", fieldValue: req.params.adId, dataTypes: ["ObjectId"], isRequiredValue: true },
            { fieldName: "New Ad Content", fieldValue: req.body.content, dataTypes: ["object"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => {
        const { content } = req.body;
        validateIsExistValueForFieldsAndDataTypes(["ar", "en", "de", "tr"].map((language) => (
            { fieldName: `New Ad Content In ${language.toUpperCase()}`, fieldValue: content[language], dataTypes: ["string"], isRequiredValue: true }
        )), res, next);
    },
    adsController.putTextAdContent
);

module.exports = adsRouter;