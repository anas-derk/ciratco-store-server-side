const { getResponseObject, getSuitableTranslations } = require("../global/functions");

const globalPasswordsManagmentFunctions = require("../models/global_passwords.model");

async function putChangeBussinessEmailPassword(req, res) {
    try {
        const { email, password, newPassword, language } = req.query;
        res.json(await globalPasswordsManagmentFunctions.changeBussinessEmailPassword(req.data._id, email.toLowerCase(), password, newPassword, language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    putChangeBussinessEmailPassword,
}