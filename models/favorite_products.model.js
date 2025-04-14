// Import Favorite Product Object

const { favoriteProductModel, productModel, userModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewFavoriteProduct(userId, productId, language) {
    try {
        const user = await userModel.findById(userId);
        if (user) {
            const product = await productModel.findById(productId);
            if (product) {
                const favoriteProduct = await favoriteProductModel.findOne({ userId, productId });
                if (!favoriteProduct) {
                    return {
                        msg: getSuitableTranslations("Adding New Product To Favorite Products List For This User Process Has Been Successfully !!", language),
                        error: false,
                        data: await (new favoriteProductModel({
                            name: product.name,
                            price: product.price,
                            imagePath: product.imagePath,
                            productId,
                            userId
                        })).save(),
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Product For This User Is Already Exist In Specific Favorite Products List !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Product Is Not Exist !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getFavoriteProductsCount(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Favorite Products Count Process Has Been Successfully !!", language),
            error: false,
            data: await favoriteProductModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllFavoriteProductsInsideThePage(pageNumber, pageSize, filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get All Favorite Products For This User Inside The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
            error: false,
            data: {
                favoriteProducts: await favoriteProductModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize),
                favoriteProductsCount: await favoriteProductModel.countDocuments(filters),
            }
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getFavoriteProductsByProductsIdsAndUserId(userId, productsIds, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Favorite Products By Products Ids And User Id Process Has Been Successfully !!", language),
            error: false,
            data: await favoriteProductModel.find({ productId: { $in: productsIds }, userId }),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteAllFavoriteProducts(userId, language) {
    try {
        const user = await userModel.findById(userId);
        if (user) {
            const result = await favoriteProductModel.deleteMany({ userId }, { returnOriginal: true });
            if (result.deletedCount > 0) {
                return {
                    msg: getSuitableTranslations("Deleting All Favorite Products For This User Process Has Been Successfully !!", language),
                    error: false,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Can't Find Any Product Inside Favorite Products List For This User !!", language),
                error: false,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteFavoriteProduct(userId, productId, language) {
    try {
        const user = await userModel.findById(userId);
        if (user) {
            const favoriteProduct = await favoriteProductModel.findOneAndDelete({ productId, userId });
            if (favoriteProduct) {
                return {
                    msg: getSuitableTranslations("Deleting Product From Favorite Products List For This User Process Has Been Successfully !!", language),
                    error: false,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Product Is Not Exist In Favorite Products List For This User !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This User Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

module.exports = {
    addNewFavoriteProduct,
    getFavoriteProductsCount,
    getAllFavoriteProductsInsideThePage,
    getFavoriteProductsByProductsIdsAndUserId,
    deleteAllFavoriteProducts,
    deleteFavoriteProduct
}