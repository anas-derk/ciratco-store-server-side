const { getResponseObject, handleResizeImagesAndConvertFormatToWebp, getSuitableTranslations, handleSaveImages, translateSentensesByAPI } = require("../global/functions");

const productsManagmentFunctions = require("../models/products.model");

const { unlinkSync } = require("fs");

async function postNewProduct(req, res) {
    try {
        const productImages = Object.assign({}, req.files);
        let files = [productImages.productImage[0].buffer], outputImageFilePaths = [`assets/images/products/${Math.random()}_${Date.now()}__${productImages.productImage[0].originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`];
        productImages.galleryImages.forEach((file) => {
            files.push(file.buffer);
            outputImageFilePaths.push(`assets/images/products/${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`)
        });
        await handleResizeImagesAndConvertFormatToWebp(files, outputImageFilePaths);
        let threeDImagePath = "";
        if (productImages?.threeDImage) {
            threeDImagePath = `assets/images/products/${Math.random()}_${Date.now()}__${productImages.threeDImage[0].originalname.replaceAll(" ", "_")}`;
            await handleSaveImages([productImages.threeDImage[0].buffer], [threeDImagePath]);
        }
        const productInfo = Object.assign({}, req.body);
        const translations = {
            ar: await translateSentensesByAPI([productInfo.name, productInfo.description], "AR"),
            en: await translateSentensesByAPI([productInfo.name, productInfo.description], "EN"),
            de: await translateSentensesByAPI([productInfo.name, productInfo.description], "DE"),
            tr: await translateSentensesByAPI([productInfo.name, productInfo.description], "TR"),
        };
        productInfo.name = {
            ar: translations.ar[0].text,
            en: translations.en[0].text,
            de: translations.de[0].text,
            tr: translations.tr[0].text,
        };
        productInfo.description = {
            ar: translations.ar[1].text,
            en: translations.en[1].text,
            de: translations.de[1].text,
            tr: translations.tr[1].text,
        };
        const result = await productsManagmentFunctions.addNewProduct(req.data._id, {
            ...{
                name,
                price,
                description,
                categories,
                discount,
                quantity,
                countries
            } = productInfo,
            imagePath: outputImageFilePaths[0],
            threeDImagePath,
            galleryImagesPaths: outputImageFilePaths.slice(1),
        }, req.query.language);
        if (result.error) {
            if (result.msg === "Sorry, This Admin Has Been Blocked !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        console.log(err);
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function postNewImagesToProductGallery(req, res) {
    try {
        let files = [], outputImageFilePaths = [];
        req.files.forEach((file) => {
            files.push(file.buffer);
            outputImageFilePaths.push(`assets/images/products/${Math.random()}_${Date.now()}__${file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`)
        });
        await handleResizeImagesAndConvertFormatToWebp(files, outputImageFilePaths);
        const result = await productsManagmentFunctions.addNewImagesToProductGallery(req.data._id, req.params.productId, outputImageFilePaths, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Product Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getProductsByIds(req, res) {
    try {
        res.json(await productsManagmentFunctions.getProductsByIds(req.body.productsIds, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getProductsByIdsAndStoreId(req, res) {
    try {
        res.json(await productsManagmentFunctions.getProductsByIdsAndStoreId(req.query.storeId, req.body.productsIds, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

function getFiltersAndSortDetailsObject(queryObject) {
    let filtersObject = {}, sortDetailsObject = {};
    for (let objectKey in queryObject) {
        if (objectKey === "categoryId") filtersObject["categories"] = queryObject[objectKey];
        if (objectKey === "category") filtersObject[objectKey] = queryObject[objectKey];
        if (objectKey === "storeId") filtersObject[objectKey] = queryObject[objectKey];
        if (objectKey === "name") filtersObject["$or"] = [
            { "name.ar": { $regex: new RegExp(`^${queryObject[objectKey]}`, 'i') } },
            { "name.en": { $regex: new RegExp(`^${queryObject[objectKey]}`, 'i') } },
            { "name.de": { $regex: new RegExp(`^${queryObject[objectKey]}`, 'i') } },
            { "name.tr": { $regex: new RegExp(`^${queryObject[objectKey]}`, 'i') } },
        ];
        if (objectKey === "sortBy") sortDetailsObject[objectKey] = queryObject[objectKey];
        if (objectKey === "sortType") sortDetailsObject[objectKey] = queryObject[objectKey];
    }
    return { filtersObject, sortDetailsObject };
}

async function getProductInfo(req, res) {
    try {
        res.json(await productsManagmentFunctions.getProductInfo(req.params.productId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getFlashProductsCount(req, res) {
    try {
        res.json(await productsManagmentFunctions.getFlashProductsCount(getFiltersAndSortDetailsObject(req.query).filtersObject, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getProductsCount(req, res) {
    try {
        res.json(await productsManagmentFunctions.getProductsCount(getFiltersAndSortDetailsObject(req.query).filtersObject, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllProductsInsideThePage(req, res) {
    try {
        const queryObject = req.query;
        const filtersAndSortDetailsObject = getFiltersAndSortDetailsObject(queryObject);
        let sortDetailsObject = {};
        if (Object.keys(filtersAndSortDetailsObject.sortDetailsObject).length > 0) {
            sortDetailsObject[filtersAndSortDetailsObject.sortDetailsObject.sortBy] = Number(filtersAndSortDetailsObject.sortDetailsObject.sortType);
        }
        res.json(await productsManagmentFunctions.getAllProductsInsideThePage(Number(queryObject.pageNumber), Number(queryObject.pageSize), filtersAndSortDetailsObject.filtersObject, sortDetailsObject, queryObject.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllFlashProductsInsideThePage(req, res) {
    try {
        const queryObject = req.query;
        const filtersAndSortDetailsObject = getFiltersAndSortDetailsObject(queryObject);
        let sortDetailsObject = {};
        if (filtersAndSortDetailsObject.sortDetailsObject) {
            sortDetailsObject[filtersAndSortDetailsObject.sortDetailsObject.sortBy] = Number(filtersAndSortDetailsObject.sortDetailsObject.sortType);
        }
        res.json(await productsManagmentFunctions.getAllFlashProductsInsideThePage(queryObject.pageNumber, queryObject.pageSize, filtersAndSortDetailsObject.filtersObject, sortDetailsObject, queryObject.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getRelatedProductsInTheProduct(req, res) {
    try {
        res.json(await productsManagmentFunctions.getRelatedProductsInTheProduct(req?.data?._id, req.params.productId, req.query.language));
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function getAllGalleryImages(req, res) {
    try {
        const result = await productsManagmentFunctions.getAllGalleryImages(req.data._id, req.params.productId, req.query.language);
        if (result.error) {
            if (result.msg === "Sorry, Permission Denied !!" || result.msg === "Sorry, This Admin Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteProduct(req, res) {
    try {
        const result = await productsManagmentFunctions.deleteProduct(req.data._id, req.params.productId, req.query.language);
        if (!result.error) {
            unlinkSync(result.data.deletedProductImagePath);
            for (let productImagePath of result.data.galleryImagePathsForDeletedProduct) {
                unlinkSync(productImagePath);
            }
        }
        else {
            if (result.msg !== "Sorry, This Product Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function deleteImageFromProductGallery(req, res) {
    try {
        const galleryImagePath = req.query.galleryImagePath;
        const result = await productsManagmentFunctions.deleteImageFromProductGallery(req.data._id, req.params.productId, galleryImagePath, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Product Is Not Exist !!") {
                return res.status(401).json(result);
            }
            return res.json(result);
        }
        unlinkSync(galleryImagePath);
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putProduct(req, res) {
    try {
        let newProductInfo = req.body;
        if (newProductInfo.offerDescriptionBase) {
            const offerDescriptionBaseTranslations = {
                ar: await translateSentensesByAPI([newProductInfo.offerDescriptionBase], "AR"),
                en: await translateSentensesByAPI([newProductInfo.offerDescriptionBase], "EN"),
                de: await translateSentensesByAPI([newProductInfo.offerDescriptionBase], "DE"),
                tr: await translateSentensesByAPI([newProductInfo.offerDescriptionBase], "TR"),
            };
            newProductInfo.offerDescriptionBaseTranslations = {
                ar: offerDescriptionBaseTranslations.ar[0].text,
                en: offerDescriptionBaseTranslations.en[0].text,
                de: offerDescriptionBaseTranslations.de[0].text,
                tr: offerDescriptionBaseTranslations.tr[0].text,
            };
        }
        const result = await productsManagmentFunctions.updateProduct(req.data._id, req.params.productId, newProductInfo, req.query.language);
        if (result.error) {
            if (result.msg !== "Sorry, This Product Is Not Exist !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putProductGalleryImage(req, res) {
    try {
        const outputImageFilePath = `assets/images/products/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        const oldGalleryImagePath = req.query.oldGalleryImagePath;
        const result = await productsManagmentFunctions.updateProductGalleryImage(req.data._id, req.params.productId, oldGalleryImagePath, outputImageFilePath, req.query.language);
        if (!result.error) {
            unlinkSync(oldGalleryImagePath);
        }
        else {
            unlinkSync(outputImageFilePath);
            if (result.msg !== "Sorry, This Product Is Not Exist !!" || result.msg !== "Sorry, This Path Is Not Found !!") {
                return res.status(401).json(result);
            }
        }
        res.json(result);
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putProductImage(req, res) {
    try {
        const { type, language } = req.query;
        let outputImageFilePath = "";
        if (type === "primary") {
            outputImageFilePath = `assets/images/products/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_").replace(/\.[^/.]+$/, ".webp")}`;
        } else {
        }
        if (type === "primary") {
            await handleResizeImagesAndConvertFormatToWebp([req.file.buffer], [outputImageFilePath]);
        } else {
            outputImageFilePath = `assets/images/products/${Math.random()}_${Date.now()}__${req.file.originalname.replaceAll(" ", "_")}`;
            await handleSaveImages([req.file.buffer], [outputImageFilePath]);
        }
        const result = await productsManagmentFunctions.updateProductImage(req.data._id, req.params.productId, type, outputImageFilePath, language);
        console.log(result);

        if (!result.error) {
            if (result.data.deletedProductImagePath) {
                unlinkSync(result.data.deletedProductImagePath);
            }
        }
        else {
            unlinkSync(outputImageFilePath);
            if (result.msg !== "Sorry, This Product Is Not Exist !!") {
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
    postNewProduct,
    postNewImagesToProductGallery,
    getProductsCount,
    getFlashProductsCount,
    getAllFlashProductsInsideThePage,
    getAllProductsInsideThePage,
    getProductInfo,
    getRelatedProductsInTheProduct,
    getProductsByIds,
    getProductsByIdsAndStoreId,
    getAllGalleryImages,
    deleteProduct,
    deleteImageFromProductGallery,
    putProduct,
    putProductGalleryImage,
    putProductImage,
}