// Import Subscription Model Object

const { subscriptionModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewSubscription(email, language) {
    try {
        const subscription = await subscriptionModel.findOne({ email });
        if (subscription) {
            return {
                msg: getSuitableTranslations("Sorry, This Subscription Is Already Exist !!", language),
                error: true,
                data: {},
            }
        }
        await (new subscriptionModel({
            email,
        })).save();
        return {
            msg: getSuitableTranslations("Creating New Subscription Process Has Been Successfuly !!", language),
            error: false,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

module.exports = {
    addNewSubscription,
}