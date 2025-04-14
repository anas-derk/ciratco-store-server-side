// Import Referal Model Object

const { referalModel, productModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewReferal(referalDetails, language) {
    try {
        const product = await productModel.findById(referalDetails.productId);
        if (!product) {
            return {
                msg: getSuitableTranslations("Sorry, This Product Is Not Exist !!", language),
                error: true,
                data: {},
            }
        }
        const referal = await referalModel.findOne({ email: referalDetails.email });
        if (referal) {
            return {
                msg: getSuitableTranslations("Sorry, This Referal Is Already Exist !!", language),
                error: true,
                data: {},
            }
        }
        await (new referalModel(referalDetails)).save();
        return {
            msg: getSuitableTranslations("Creating New Referal Process Has Been Successfuly !!", language),
            error: false,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getProductReferalsCount(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Product Referals Count Process Has Been Successfully !!", language),
            error: false,
            data: await referalModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllProductReferalsInsideThePage(pageNumber, pageSize, filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get All Product Referals Inside The Page: {{pageNumber} Process Has Been Successfully !!", language, { pageNumber }),
            error: false,
            data: {
                referals: await referalModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize),
                referalsCount: await referalModel.countDocuments(filters),
            },
        }
    }
    catch (err) {
        throw Error(err);
    }
}

module.exports = {
    addNewReferal,
    getProductReferalsCount,
    getAllProductReferalsInsideThePage,
}