const globalPasswordRouter = require("express").Router();

const globalPasswordController = require("../controllers/global_passwords.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT, validateEmail, validatePassword } = require("../middlewares/global.middlewares");

globalPasswordRouter.put("/change-bussiness-email-password",
    validateJWT,
    (req, res, next) => {
        const { email, password, newPassword } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Bussiness Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Bussiness Password", fieldValue: password, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "New Bussiness Password", fieldValue: newPassword, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validatePassword(req.query.password, res, next),
    (req, res, next) => validatePassword(req.query.newPassword, res, next),
    globalPasswordController.putChangeBussinessEmailPassword
);

module.exports = globalPasswordRouter;