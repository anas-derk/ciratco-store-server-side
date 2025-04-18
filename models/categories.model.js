// Import Category And Admin Model Object

const { categoryModel, adminModel, productModel } = require("../models/all.models");

const { getSuitableTranslations } = require("../global/functions");

async function addNewCategory(authorizationId, categoryData, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const category = await categoryModel.findOne({ name: categoryData.name, storeId: admin.storeId, ...categoryData.parent && { parent: categoryData.parent } });
                if (category) {
                    return {
                        msg: getSuitableTranslations("Sorry, This Cateogry Is Already Exist !!", language),
                        error: true,
                        data: {},
                    }
                }
                if (categoryData.parent) {
                    if (!(await categoryModel.findById(categoryData.parent))) {
                        return {
                            msg: getSuitableTranslations("Sorry, This Parent Cateogry Is Not Exist !!", language),
                            error: true,
                            data: {},
                        }
                    }
                } else {
                    delete categoryData.parent;
                }
                categoryData.storeId = admin.storeId;
                return {
                    msg: getSuitableTranslations("Adding New Category Process Has Been Successfuly !!", language),
                    error: false,
                    data: await (new categoryModel(categoryData)).save(),
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

function buildNestedCategories(categories) {
    const categoryMap = {};
    categories.forEach(category => {
        categoryMap[category._id] = { ...category, subcategories: [] };
    });
    const result = [];
    categories.forEach(category => {
        if (category.parent) {
            categoryMap[category.parent].subcategories.push(categoryMap[category._id]);
        } else {
            result.push(categoryMap[category._id]);
        }
    });
    return result;
}

async function getAllCategories(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get All Categories Process Has Been Successfully !!", language),
            error: false,
            data: await categoryModel.find(filters, { name: 1, storeId: 1, parent: 1 }).populate("parent"),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllCategoriesWithHierarechy(filters, language) {
    try {
        filters.parent = null;
        const mainCategories = await categoryModel.find(filters, { name: 1, storeId: 1, parent: 1 });
        filters.parent = { $ne: null };
        const subcategories = await categoryModel.find(filters, { name: 1, storeId: 1, parent: 1 });
        return {
            msg: getSuitableTranslations("Get All Categories With Hierarechy Process Has Been Successfully !!", language),
            error: false,
            data: buildNestedCategories([...JSON.parse(JSON.stringify(mainCategories, null, 1)), ...JSON.parse(JSON.stringify(subcategories, null, 1))]),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getCategoryInfo(categoryId, language) {
    try {
        const categoryInfo = await categoryModel.findById(categoryId).populate("parent");
        if (categoryInfo) {
            return {
                msg: getSuitableTranslations("Get Category Info Process Has Been Successfuly !!", language),
                error: false,
                data: categoryInfo,
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Category Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getCategoriesCount(filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get Categories Count Process Has Been Successfully !!", language),
            error: false,
            data: await categoryModel.countDocuments(filters),
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAllCategoriesInsideThePage(pageNumber, pageSize, filters, language) {
    try {
        return {
            msg: getSuitableTranslations("Get All Categories Inside The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
            error: false,
            data: {
                categories: await categoryModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize).populate("parent"),
                categoriesCount: await categoryModel.countDocuments(filters),
            }
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function deleteCategory(authorizationId, categoryId, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const category = await categoryModel.findOne({
                    _id: categoryId,
                });
                if (category) {
                    if (category.storeId === admin.storeId) {
                        await categoryModel.deleteOne({
                            _id: categoryId,
                        });
                        await productModel.updateMany({ categoryId }, { category: "uncategorized" });
                        return {
                            msg: getSuitableTranslations("Deleting Category Process Has Been Successfuly !!", language),
                            error: false,
                            data: {},
                        };
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Category Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Category Is Not Exist !!", language),
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

async function updateCategory(authorizationId, categoryId, newCategoryData, language) {
    try {
        const admin = await adminModel.findById(authorizationId);
        if (admin) {
            if (!admin.isBlocked) {
                const category = await categoryModel.findOne({ _id: categoryId });
                if (category) {
                    if (category.storeId === admin.storeId) {
                        if (newCategoryData.parent) {
                            if (!(await categoryModel.findById(newCategoryData.parent))) {
                                return {
                                    msg: getSuitableTranslations("Sorry, This Parent Cateogry Is Not Exist !!", language),
                                    error: true,
                                    data: {},
                                }
                            }
                        }
                        await categoryModel.updateOne({ _id: categoryId }, newCategoryData);
                        return {
                            msg: getSuitableTranslations("Updating Category Info Process Has Been Successfuly !!", language),
                            error: false,
                            data: {},
                        };
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, Permission Denied Because This Category Is Not Exist At Store Managed By This Admin !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Category Is Not Exist !!", language),
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
    addNewCategory,
    getAllCategories,
    getAllCategoriesWithHierarechy,
    getAllCategoriesInsideThePage,
    getCategoriesCount,
    getAllCategoriesInsideThePage,
    getCategoryInfo,
    deleteCategory,
    updateCategory,
}