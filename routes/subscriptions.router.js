const subscriptionsRouter = require("express").Router();

const subscriptionsController = require("../controllers/subscriptions.controller");

const { validateEmail } = require("../middlewares/global.middlewares");

subscriptionsRouter.post("/add-new-subscription",
    (req, res, next) => validateEmail(req.body.email, res, next),
    subscriptionsController.postAddNewSubscription
);

module.exports = subscriptionsRouter;