const { getResponseObject, getSuitableTranslations } = require("../global/functions");

const subscriptionsManagmentFunctions = require("../models/subscriptions.model");

async function postAddNewSubscription(req, res) {
    try{
        res.json(await subscriptionsManagmentFunctions.addNewSubscription(req.body.email, req.query.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    postAddNewSubscription,
}