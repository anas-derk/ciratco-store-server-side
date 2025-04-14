const { rateLimit } = require("express-rate-limit");

const sendingVerificationCodeLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: () => {
        return {
            msg: "Sorry, This Email Has Been Blocked From Receiving Code Messages For 24 Hours Due To Exceeding The Maximum Number Of Resend Attempts !!",
            error: true,
            data: {},
        }
    }
});

function sendingVerificationCodeLimiterMiddleware(req, res, next) {
    sendingVerificationCodeLimiter(req, res, next);
}

function validateRating(rating, res, nextFunc, errorMsg = "Sorry, Please Send Valid Rating ( Any Value Inside Array: [1, 2, 3, 4, 5] ) !!") {
    if (![1, 2, 3, 4, 5].includes(rating)) {
        res.status(400).json(getResponseObject(errorMsg, true, {}));
        return;
    }
    nextFunc();
}

module.exports = {
    sendingVerificationCodeLimiterMiddleware,
    validateRating,
}