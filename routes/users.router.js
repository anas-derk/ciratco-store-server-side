const usersRouter = require("express").Router();

const usersController = require("../controllers/users.controller");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

const { validateJWT, validateEmail, validatePassword, validateUserType, validateLanguage, validateTypeOfUseForCode, validateName, validateNumbersIsGreaterThanZero, validateNumbersIsNotFloat } = require("../middlewares/global.middlewares");

usersRouter.get("/login",
    (req, res, next) => {
        const { email, password } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Password", fieldValue: password, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validatePassword(req.query.password, res, next),
    usersController.login
);

usersRouter.get("/login-with-google",
    (req, res, next) => {
        const { email, firstName, lastName, previewName } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "First Name", fieldValue: firstName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Last Name", fieldValue: lastName, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Preview Name", fieldValue: previewName, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    usersController.loginWithGoogle
);

usersRouter.get("/user-info",
    validateJWT,
    usersController.getUserInfo
);

usersRouter.get("/users-count", validateJWT, usersController.getUsersCount);

usersRouter.get("/all-users-inside-the-page",
    validateJWT,
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateNumbersIsGreaterThanZero([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Greater Than Zero ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Greater Than Zero ) !!"]),
    (req, res, next) => validateNumbersIsNotFloat([req.query.pageNumber, req.query.pageSize], res, next, ["Sorry, Please Send Valid Page Number ( Number Must Be Not Float ) !!", "Sorry, Please Send Valid Page Size ( Number Must Be Not Float ) !!"]),
    usersController.getAllUsersInsideThePage
);

usersRouter.get("/forget-password",
    (req, res, next) => {
        const { email, userType } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "User Type", fieldValue: userType, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validateUserType(req.query.userType, res, next),
    usersController.getForgetPassword
);

usersRouter.post("/create-new-user",
    (req, res, next) => {
        const { email, password, language } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Password", fieldValue: password, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Language", fieldValue: language, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.body.email, res, next),
    (req, res, next) => validatePassword(req.body.password, res, next),
    (req, res, next) => validateLanguage(req.body.language, res, next),
    usersController.createNewUser
);

usersRouter.post("/send-account-verification-code",
    (req, res, next) => {
        const { email, typeOfUse, userType } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "User Type", fieldValue: userType, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Type Of Use", fieldValue: typeOfUse, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateUserType(req.query.userType, res, next),
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validateTypeOfUseForCode(req.query.typeOfUse, res, next),
    usersController.postAccountVerificationCode
);

usersRouter.put("/update-user-info",
    validateJWT,
    (req, res, next) => {
        const { firstName, lastName, previewName, email, password, newPassword } = req.body;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "First Name", fieldValue: firstName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Last Name", fieldValue: lastName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Preview Name", fieldValue: previewName, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: false },
            { fieldName: "Password", fieldValue: password, dataTypes: ["string"], isRequiredValue: newPassword ? true : false },
            { fieldName: "New Password", fieldValue: newPassword, dataTypes: ["string"], isRequiredValue: password ? true : false },
        ], res, next);
    },
    (req, res, next) => {
        const { firstName } = req.body;
        if (firstName) {
            validateName(firstName, res, next, "Sorry, Please Send Valid First Name !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { lastName } = req.body;
        if (lastName) {
            validateName(lastName, res, next, "Sorry, Please Send Valid Last Name !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { previewName } = req.body;
        if (previewName) {
            validateName(previewName, res, next, "Sorry, Please Send Valid Preview Name !!");
            return;
        }
        next();
    },
    (req, res, next) => {
        const { password } = req.body;
        if (password) {
            validatePassword(password, res, next);
            return;
        }
        next();
    },
    usersController.putUserInfo
);

usersRouter.put("/update-verification-status",
    (req, res, next) => {
        const { email, code } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Code", fieldValue: code, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    usersController.putVerificationStatus
);

usersRouter.put("/reset-password",
    (req, res, next) => {
        const { email, userType, code, newPassword } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Email", fieldValue: email, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "User Type", fieldValue: userType, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "Code", fieldValue: code, dataTypes: ["string"], isRequiredValue: true },
            { fieldName: "New Password", fieldValue: newPassword, dataTypes: ["string"], isRequiredValue: true },
        ], res, next);
    },
    (req, res, next) => validateEmail(req.query.email, res, next),
    (req, res, next) => validateUserType(req.query.userType, res, next),
    (req, res, next) => validatePassword(req.query.newPassword, res, next),
    usersController.putResetPassword
);

usersRouter.delete("/:userId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "User Id", fieldValue: req.params.userId, dataTypes: ["ObjectId"], isRequiredValue: false },
        ], res, next);
    },
    usersController.deleteUser
);

module.exports = usersRouter;