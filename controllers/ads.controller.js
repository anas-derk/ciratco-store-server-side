const { getResponseObject, handleResizeImagesAndConvertFormatToWebp, getSuitableTranslations, translateSentensesByAPI } = require("../global/functions");

const adsOPerationsManagmentFunctions = require("../models/ads.model");

const { unlinkSync } = require("fs");

function getFiltersObject(filters) {
    let filtersObject = {};
    for (let objectKey in filters) {
        if (objectKey === "storeId") filtersObject[objectKey] = filters[objectKey];
        if (objectKey === "product") filtersObject[objectKey] = filters[objectKey];
    }
    return filtersObject;
}

async function postNewTextAd(req, res) {
    try {
        const { content } = req.body;
        const adInfo = {
            content: {
                ar: (await translateSentensesByAPI([content], "AR"))[0].text,
                en: (await translateSentensesByAPI([content], "EN"))[0].text,
                de: (await translateSentensesByAPI([content], "DE"))[0].text,
                tr: (await translateSentensesByAPI([content], "TR"))[0].text
            },
            type: "text"
        };
        const result = await adsOPerationsManagmentFunctions.addNewAd(req.data._id, adInfo, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postNewImageAd(req, res) {
    try {
        const outputImageFilePath = `assets/images/ads/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const adInfo = {
            ... { product } = Object.assign({}, req.body),
            imagePath: outputImageFilePath,
            type: "image"
        };
        const result = await adsOPerationsManagmentFunctions.addNewAd(req.data._id, adInfo, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllAds(req, res) {
    try {
        const filters = req.query;
        res.json(await adsOPerationsManagmentFunctions.getAllAds(getFiltersObject(filters), filters.language));

    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteAd(req, res) {
    try {
        const result = await adsOPerationsManagmentFunctions.deleteAd(req.data._id, req.params.adId, req.query.language);
        if (!result.error) {
            if (result.data?.deletedAdImagePath) {
                unlinkSync(result.data.deletedAdImagePath);
            }
        }
        else {
            if (result.msg !== "Sorry, This Ad Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putAdImage(req, res) {
    try {
        const outputImageFilePath = `assets/images/ads/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const result = await adsOPerationsManagmentFunctions.updateAdImage(req.data._id, req.params.adId, outputImageFilePath, req.query.language);
        if (!result.error) {
            unlinkSync(result.data.oldAdImagePath);
        }
        else {
            unlinkSync(outputImageFilePath);
            if (result.msg !== "Sorry, Type Of Ad Is Not Image !!" || result.msg !== "Sorry, This Ad Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putTextAdContent(req, res) {
    try {
        const result = await adsOPerationsManagmentFunctions.updateTextAdContent(req.data._id, req.params.adId, req.body.content, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, Type Of Ad Is Not Text !!" || result.msg !== "Sorry, This Ad Is Not Exist !!") {
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
    postNewTextAd,
    postNewImageAd,
    getAllAds,
    deleteAd,
    putAdImage,
    putTextAdContent
}