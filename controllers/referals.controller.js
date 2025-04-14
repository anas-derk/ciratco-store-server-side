const { getResponseObject, getSuitableTranslations } = require("../global/functions");

const referalsManagmentFunctions = require("../models/referals.model");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "productId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "customerName") filtersObject[objectKey] = filters[objectKey];
    }
    return filtersObject;
}

async function postAddNewReferal(req, res) {
    try{
        res.json(await referalsManagmentFunctions.addNewReferal(req.body, req.query.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getProductReferalsCount(req, res) {
    try {
        const productId = req.params.productId;
        res.json(await referalsManagmentFunctions.getProductReferalsCount(getFiltersObject({ ...req.query, productId}), req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllProductReferalsInsideThePage(req, res) {
    try {
        const filters = req.query;
        res.json(await referalsManagmentFunctions.getAllProductReferalsInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject({...filters, productId: req.params.productId}), filters.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    postAddNewReferal,
    getProductReferalsCount,
    getAllProductReferalsInsideThePage,
}