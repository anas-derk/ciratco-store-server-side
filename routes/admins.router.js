const adminsRouter = require("express").Router();

const adminsController = require("../controllers/admins.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT, validateEmail, validatePassword, validateNumbersIsGreaterThanZero, validateNumbersIsNotFloat, validateName } = require("../middlewares/global.middlewares");

adminsRouter.get("/login",
    (req, res, next) => {
        const { email, password } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Password", fieldValue: password, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validatePassword(req.query.password, res, next),
    adminsController.getAdminLogin
);

adminsRouter.get("/user-info", validateJWT, adminsController.getAdminUserInfo);

adminsRouter.get("/admins-count", validateJWT, adminsController.getAdminsCount);

adminsRouter.get("/all-admins-inside-the-page",
    validateJWT,
    (req, res, next) => {
        const { pageNumber, pageSize, _id, firstName, lastName, email } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "Admin Id", fieldValue: _id, dataTypes: ["ObjectId"], isRequiredValue: false },
            { fieldName: "First Name", fieldValue: firstName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Last Name", fieldValue: lastName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: false },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsGreaterThanZero([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    (req, res, next) => {
        const { firstName } = req.body;
        if (firstName) {
            validateName(firstName, res, next);
            return;
        }
        next();
    },
    (req, res, next) => {
        const { lastName } = req.body;
        if (lastName) {
            validateName(lastName, res, next);
            return;
        }
        next();
    },
    (req, res, next) => {
        const { email } = req.body;
        if (email) {
            validateEmail(email, res, next);
            return;
        }
        next();
    },
    adminsController.getAllAdminsInsideThePage
);

adminsRouter.post("/add-new-admin",
    validateJWT,
    (req, res, next) => {
        const { firstName, lastName, email, password } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "First Name", fieldValue: firstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Last Name", fieldValue: lastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Password", fieldValue: password, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    (req, res, next) => validatePassword(req.body.password, res, next),
    (req, res, next) => validateName(req.body.firstName, res, next),
    (req, res, next) => validateName(req.body.lastName, res, next),
    adminsController.postAddNewAdmin
);

adminsRouter.put("/update-admin-info/:adminId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Admin Id", fieldValue: req.params.adminId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    adminsController.putAdminInfo
);

adminsRouter.delete("/delete-admin/:adminId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Admin Id", fieldValue: req.params.adminId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    adminsController.deleteAdmin
);

module.exports = adminsRouter;