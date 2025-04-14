// Import Wallet Product Object

const { productsWalletModel, userModel } = require("./all.models");

const { getSuitableTranslations } = require("../global/functions");

async function getWalletProductsCount(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Products Count Inside The Wallet For This User Process Has Been Successfully !!", language),
            error: false,
            data: await productsWalletModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllWalletProductsInsideThePage(pageNumber, pageSize, filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get All Products Inside The Wallet For This User The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
            error: false,
            data: {
                walletProducts: await productsWalletModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize),
                walletProductsCount: await productsWalletModel.countDocuments(filters),
            },
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteAllProductsFromWallet(userId, language) {
    try {
        const user = await userModel.findById(userId);
        if (user) {
            const result = await productsWalletModel.deleteMany({ userId }, { returnOriginal: true });
            if (result.deletedCount > 0) {
                return {
                    msg: getSuitableTranslations("Deleting All Products From Wallet For This User Process Has Been Successfully !!", language),
                    error: false,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Can't Find Any Product Inside Wallet Products List For This User !!", language),
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

async function deleteWalletProduct(userId, productId, language) {
    try {
        const user = await userModel.findById(userId);
        if (user) {
            const walletProduct = await productsWalletModel.findOneAndDelete({ productId, userId });
            if (walletProduct) {
                return {
                    msg: getSuitableTranslations("Deleting Product From Wallet For This User Process Has Been Successfully !!", language),
                    error: false,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Product Inside The Wallet For This User Is Not Exist !!", language),
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
    getWalletProductsCount,
    getAllWalletProductsInsideThePage,
    deleteAllProductsFromWallet,
    deleteWalletProduct
}