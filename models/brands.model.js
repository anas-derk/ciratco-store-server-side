// Import Brand Model Object

const { brandModel, adminModel, storeModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewBrand(authorizationId, brandInfo, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                brandInfo.storeId = admin.storeId;
                await (new brandModel(brandInfo)).save();
                return {
                    msg: getSuitableTranslations("Adding New Brand Process Has Been Successfuly !!", language),
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

async function getLastSevenBrandsByStoreId(filters, language) {
    try {
        if (filters["isMainStore"]) {
            const mainStoreDetails = await storeModel.findOne({ isMainStore: true });
            filters = { storeId: mainStoreDetails._id };
        }
        return {
            msg: getSuitableTranslations("Get Last Seven Brands By Store Id Process Has Been Successfully !!", language),
            error: false,
            data: await brandModel.find(filters).limit(7),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getBrandsCount(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Brands Count Process Has Been Successfully !!", language),
            error: false,
            data: await brandModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllBrandsInsideThePage(pageNumber, pageSize, filters, language) {
    try {
        if (filters["isMainStore"]) {
            const mainStoreDetails = await storeModel.findOne({ isMainStore: true });
            filters = { storeId: mainStoreDetails._id };
        }
        return {
            msg: getSuitableTranslations("Get All Brands Inside The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
            error: false,
            data: {
                brands: await brandModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize),
                brandsCount: await brandModel.countDocuments(filters)
            },
        };
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteBrand(authorizationId, brandId, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const brandInfo = await brandModel.findOne({
                    _id: brandId,
                });
                if (brandInfo) {
                    if (brandInfo.storeId === admin.storeId) {
                        await brandModel.deleteOne({ _id: brandId });
                        return {
                            error: false,
                            msg: getSuitableTranslations("Deleting Brand Process Has Been Successfuly !!", language),
                            data: {
                                deletedBrandPath: brandInfo.imagePath,
                            },
                        };
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Brand Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Brand Is Not Exist !!", language),
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

async function updateBrandInfo(authorizationId, brandId, newBrandTitle, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const brandInfo = await brandModel.findOne({ _id: brandId });
                if (brandInfo) {
                    if (brandInfo.storeId === admin.storeId) {
                        await brandModel.updateOne({ _id: brandId }, { title: newBrandTitle });
                        return {
                            msg: getSuitableTranslations("Updating Brand Info Process Has Been Successfuly !!", language),
                            error: false,
                            data: {},
                        };
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Brand Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Brand Is Not Exist !!", language),
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

async function changeBrandImage(authorizationId, brandId, newBrandImagePath, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const brand = await brandModel.findOne({ _id: brandId });
                if (brand) {
                    if (brand.storeId === admin.storeId) {
                        await brandModel.updateOne({ _id: brandId }, {
                            imagePath: newBrandImagePath,
                        });
                        return {
                            msg: getSuitableTranslations("Updating Brand Image Process Has Been Successfully !!", language),
                            error: false,
                            data: { deletedBrandImagePath: brand.imagePath }
                        };
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Brand Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Brand Is Not Exist !!", language),
                    error: true,
                    data: {}
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
    addNewBrand,
    getLastSevenBrandsByStoreId,
    getBrandsCount,
    getAllBrandsInsideThePage,
    deleteBrand,
    updateBrandInfo,
    changeBrandImage,
}