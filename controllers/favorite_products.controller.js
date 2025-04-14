const { getResponseObject, getSuitableTranslations } = require("../global/functions");

const favoriteProductsOPerationsManagmentFunctions = require("../models/favorite_products.model");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "userId") filtersObject[objectKey] = filters[objectKey];
    }
    return filtersObject;
}

async function postNewFavoriteProducts(req, res) {
    try {
        res.json(await favoriteProductsOPerationsManagmentFunctions.addNewFavoriteProduct(req.data._id, req.params.productId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getFavoriteProductsByProductsIdsAndUserId(req, res) {
    try {
        res.json(await favoriteProductsOPerationsManagmentFunctions.getFavoriteProductsByProductsIdsAndUserId(req.data._id, req.body.productsIds, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getFavoriteProductsCount(req, res) {
    try {
        const filters = req.query;
        filters.userId = req.data._id;
        res.json(await favoriteProductsOPerationsManagmentFunctions.getFavoriteProductsCount(getFiltersObject(filters), filters.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllFavoriteProductsInsideThePage(req, res) {
    try {
        const filters = req.query;
        filters.userId = req.data._id;
        res.json(await favoriteProductsOPerationsManagmentFunctions.getAllFavoriteProductsInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject(filters), filters.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteAllFavoriteProducts(req, res) {
    try {
        res.json(await favoriteProductsOPerationsManagmentFunctions.deleteAllFavoriteProducts(req.data._id, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteFavoriteProduct(req, res) {
    try {
        res.json(await favoriteProductsOPerationsManagmentFunctions.deleteFavoriteProduct(req.data._id, req.params.productId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    postNewFavoriteProducts,
    getFavoriteProductsCount,
    getAllFavoriteProductsInsideThePage,
    getFavoriteProductsByProductsIdsAndUserId,
    deleteAllFavoriteProducts,
    deleteFavoriteProduct
}