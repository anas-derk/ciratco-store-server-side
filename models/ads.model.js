// Import Product Model Object

const { adsModel, adminModel, productModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewAd(authorizationId, adsInfo, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                if (await adsModel.countDocuments({ type: adsInfo.type }) >= 10) {
                    return {
                        msg: getSuitableTranslations("Sorry, Can't Add New Text Ad Because Arrive To Max Limits For Text Ads Count ( Limits: 10 ) !!", language),
                        error: true,
                        data: {},
                    }
                }
                if (adsInfo.type === "image") {
                    const product = await productModel.findById(adsInfo.product);
                    if (!product) {
                        return {
                            msg: getSuitableTranslations("Sorry, This Product Is Not Exist !!", language),
                            error: false,
                            data: {},
                        }
                    }
                }
                adsInfo.storeId = admin.storeId;
                await (new adsModel(adsInfo)).save();
                return {
                    msg: getSuitableTranslations(`Adding New ${adsInfo.type.replace(adsInfo.type[0], adsInfo.type[0].toUpperCase())} Ad Process Has Been Successfully !!`, language),
                    error: false,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllAds(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get All Ads Process Has Been Successfully !!", language),
            error: false,
            data: await adsModel.find(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteAd(authorizationId, adId, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const adInfo = await adsModel.findById(adId);
                if (adInfo) {
                    if (adInfo.storeId === admin.storeId) {
                        await adInfo.deleteOne({
                            _id: adId,
                        });
                        return {
                            msg: getSuitableTranslations("Deleting Ad Process Has Been Successfuly !!", language),
                            error: false,
                            data: adInfo.type === "image" ? {
                                deletedAdImagePath: adInfo.imagePath,
                            } : {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Ad Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Ad Is Not Exist !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function updateAdImage(authorizationId, adId, newAdImagePath, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const adInfo = await adsModel.findById(adId);
                if (adInfo) {
                    if (adInfo.storeId === admin.storeId) {
                        if (adInfo.type === "image") {
                            await adsModel.updateOne({ _id: adId }, {
                                imagePath: newAdImagePath,
                            });
                            return {
                                msg: getSuitableTranslations("Change Ad Image Process Has Been Successfully !!", language),
                                error: false,
                                data: {
                                    oldAdImagePath: adInfo.imagePath,
                                    newAdImagePath
                                },
                            }
                        }
                        return {
                            msg: getSuitableTranslations("Sorry, Type Of Ad Is Not Image !!", language),
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Ad Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                        status: 401
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Ad Is Not Exist !!", language),
                    error: true,
                    data: {},
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function updateTextAdContent(authorizationId, adId, newTextAdContent, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const adInfo = await adsModel.findById(adId);
                if (adInfo) {
                    if (adInfo.storeId === admin.storeId) {
                        if (adInfo.type === "text") {
                            await adsModel.updateOne({ _id: adId }, { content: newTextAdContent });
                            return {
                                msg: getSuitableTranslations("Updating Text Ad Content Process Has Been Successfuly !!", language),
                                error: false,
                                data: {},
                            }
                        }
                        return {
                            msg: getSuitableTranslations("Sorry, Type Of Ad Is Not Text !!", language),
                            error: true,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Ad Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Ad Is Not Exist !!", language),
                    error: true,
                    data: {},
                };
            }
            return {
                msg: getSuitableTranslations("Sorry, This Admin Has Been Blocked !!", language),
                error: true,
                data: {
                    blockingDate: admin.blockingDate,
                    blockingReason: admin.blockingReason,
                },
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

module.exports = {
    addNewAd,
    getAllAds,
    deleteAd,
    updateAdImage,
    updateTextAdContent
}