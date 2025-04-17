const { getResponseObject, getSuitableTranslations, translateSentensesByAPI } = require("../global/functions");

const categoriesManagmentFunctions = require("../models/categories.model");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "storeId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "name") filtersObject["$or"] = [
            { "name.ar": { $regex: new RegExp(filters[objectKey], 'i') } },
            { "name.en": { $regex: new RegExp(filters[objectKey], 'i') } },
            { "name.de": { $regex: new RegExp(filters[objectKey], 'i') } },
            { "name.tr": { $regex: new RegExp(filters[objectKey], 'i') } },
        ];
        if (objectKey === "categoryId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "parent") {
            if (filters[objectKey] === "null") {
                filtersObject[objectKey] = null;
            } else filtersObject[objectKey] = filters[objectKey];
        }
    }
    return filtersObject;
}

async function postNewCategory(req, res) {
    try {
        const { name, parent } = req.body;
        const categoryInfo = {
            name: {
                ar: (await translateSentensesByAPI([name], "AR"))[0].text,
                en: (await translateSentensesByAPI([name], "EN"))[0].text,
                de: (await translateSentensesByAPI([name], "DE"))[0].text,
                tr: (await translateSentensesByAPI([name], "TR"))[0].text
            },
            parent,
        };
        const result = await categoriesManagmentFunctions.addNewCategory(req.data._id, categoryInfo, req.query.language);
        if (result.error) {
            if (result.msg === "Sorry, This Admin Has Been Blocked !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllCategories(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getAllCategories(getFiltersObject(req.query), req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllCategoriesWithHierarechy(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getAllCategoriesWithHierarechy(getFiltersObject(req.query), req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getCategoryInfo(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getCategoryInfo(req.params.categoryId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getCategoriesCount(req, res) {
    try {
        res.json(await categoriesManagmentFunctions.getCategoriesCount(getFiltersObject(req.query), req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllCategoriesInsideThePage(req, res) {
    try {
        const filters = req.query;
        res.json(await categoriesManagmentFunctions.getAllCategoriesInsideThePage(filters.pageNumber, filters.pageSize, getFiltersObject(filters), filters.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteCategory(req, res) {
    try {
        const result = await categoriesManagmentFunctions.deleteCategory(req.data._id, req.params.categoryId, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Category Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putCategory(req, res) {
    try {
        const result = await categoriesManagmentFunctions.updateCategory(req.data._id, req.params.categoryId, { name, parent } = req.body, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Category Is Not Exist !!" && result.msg !== "Sorry, This Parent Cateogry Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    postNewCategory,
    getAllCategories,
    getAllCategoriesWithHierarechy,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getCategoryInfo,
    deleteCategory,
    putCategory,
}