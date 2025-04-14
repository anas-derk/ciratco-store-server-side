// Import User, Product Model And Products Rating Model  Object

const { userModel, productModel, productsRatingModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function selectProductRating(userId, ratingInfo, language) {
    try{
        const user = await userModel.findById(userId);
        if (user) {
            const product = await productModel.findById(ratingInfo.productId);
            if (product) {
                const ratingDetails = await productsRatingModel.findOne({ userId, productId: ratingInfo.productId });
                if (ratingDetails) {
                    await productsRatingModel.updateOne({ userId, productId: ratingInfo.productId }, { rating: ratingInfo.rating });
                    product.ratings[ratingDetails.rating] = product.ratings[ratingDetails.rating] - 1;
                    product.ratings[ratingInfo.rating] = product.ratings[ratingInfo.rating] + 1;
                    await productModel.updateOne({ _id: ratingInfo.productId }, { ratings: product.ratings });
                    return {
                        msg: getSuitableTranslations("Updating Product Rating By This User Process Has Been Successfully !!", language),
                        error: false,
                        data: {},
                    }
                }
                const newRating = new productsRatingModel({
                    userId,
                    productId: ratingInfo.productId,
                    rating: ratingInfo.rating
                });
                await newRating.save();
                product.ratings[ratingInfo.rating] = product.ratings[ratingInfo.rating] + 1;
                await productModel.updateOne({ _id: ratingInfo.productId }, { ratings: product.ratings });
                return {
                    msg: getSuitableTranslations("Adding New Product Rating By This User Process Has Been Successfully !!", language),
                    error: false,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Product Is Not Found !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, The User Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch(err) {
        throw Error(err);
    }
}

async function getProductRatingByUserId(userId, productId, language) {
    try{
        const user = await userModel.findById(userId);
        if (user) {
            const product = await productModel.findById(productId);
            if (product) {
                const ratingInfo = await productsRatingModel.findOne({ userId, productId });
                if (ratingInfo) {
                    return {
                        msg: getSuitableTranslations("Get Product Rating By User Process Has Been Successfully !!", language),
                        error: false,
                        data: ratingInfo.rating,
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Product Is Not Exist Any Rating By This User !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Product Is Not Found !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, The User Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch(err) {
        throw Error(err);
    }
}

module.exports = {
    selectProductRating,
    getProductRatingByUserId
}