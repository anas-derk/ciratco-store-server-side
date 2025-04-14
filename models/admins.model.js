// Import Admin Model Object

const { adminModel } = require("./all.models");

const { compare, hash } = require("bcryptjs");

const { mongoose } = require("../server");

const { getSuitableTranslations } = require("../global/functions");

async function adminLogin(email, password, language) {
    try {
        const admin = await adminModel.findOne({ email });
        if (admin) {
            if (!admin.isBlocked) {
                if ((await compare(password, admin.password)))
                    return {
                        msg: getSuitableTranslations("Admin Logining Process Has Been Successfully !!", language),
                        error: false,
                        data: {
                            _id: admin._id,
                        },
                    };
                return {
                    msg: getSuitableTranslations("Sorry, The Email Or Password Incorrect !!", language),
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
            msg: getSuitableTranslations("Sorry, The Email Or Password Incorrect !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function getAdminUserInfo(userId, language) {
    try {
        const user = await adminModel.findById(userId);
        if (user) {
            return {
                msg: getSuitableTranslations("Get Admin Info Process Has Been Successfully !!", language),
                error: false,
                data: user,
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function getAdminsCount(merchantId, filters, language) {
    try {
        const admin = await adminModel.findById(merchantId);
        if (admin) {
            if (admin.isMerchant) {
                if (!admin.isBlocked) {
                    filters.storeId = admin.storeId;
                    return {
                        msg: getSuitableTranslations("Get Admins Count Process Has Been Successfully !!", language),
                        error: false,
                        data: await adminModel.countDocuments(filters),
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Merchant Has Been Blocked !!", language),
                    error: true,
                    data: {
                        blockingDate: admin.blockingDate,
                        blockingReason: admin.blockingReason,
                    },
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Permission Denied Because This Admin Is Not Merchant !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Merchant Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function getAllAdminsInsideThePage(merchantId, pageNumber, pageSize, filters, language) {
    try {
        const admin = await adminModel.findById(merchantId);
        if (admin) {
            if (admin.isMerchant) {
                if (!admin.isBlocked) {
                    filters.storeId = admin.storeId;
                    return {
                        msg: getSuitableTranslations("Get All Admins Inside The Page: {{pageNumber}} Process Has Been Successfully !!", language, { pageNumber }),
                        error: false,
                        data: {
                            admins: await adminModel.find(filters).skip((pageNumber - 1) * pageSize).limit(pageSize).sort({ creatingDate: -1 }),
                            adminsCount: await adminModel.countDocuments(filters)
                        },
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Merchant Has Been Blocked !!", language),
                    error: true,
                    data: {
                        blockingDate: admin.blockingDate,
                        blockingReason: admin.blockingReason,
                    },
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Permission Denied Because This Admin Is Not Merchant !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Merchant Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function addNewAdmin(merchantId, adminInfo, language) {
    try {
        const admin = await adminModel.findById(merchantId);
        if (admin) {
            if (admin.isMerchant) {
                if (!admin.isBlocked) {
                    const adminDetails = await adminModel.findOne({ email: adminInfo.email });
                    if (!adminDetails) {
                        (new adminModel({
                            firstName: adminInfo.firstName,
                            lastName: adminInfo.lastName,
                            email: adminInfo.email,
                            password: await hash(adminInfo.password, 10),
                            storeId: admin.storeId,
                            permissions: [
                                {
                                    name: "Add New Brand",
                                    value: true,
                                },
                                {
                                    name: "Update Brand Info",
                                    value: true,
                                },
                                {
                                    name: "Delete Brand",
                                    value: true,
                                },
                                {
                                    name: "Update Order Info",
                                    value: true,
                                },
                                {
                                    name: "Delete Order",
                                    value: true,
                                },
                                {
                                    name: "Update Order Info",
                                    value: true,
                                },
                                {
                                    name: "Update Order Product Info",
                                    value: true,
                                },
                                {
                                    name: "Delete Order Product",
                                    value: true,
                                },
                                {
                                    name: "Add New Category",
                                    value: true,
                                },
                                {
                                    name: "Update Category Info",
                                    value: true,
                                },
                                {
                                    name: "Delete Category",
                                    value: true,
                                },
                                {
                                    name: "Add New Product",
                                    value: true,
                                },
                                {
                                    name: "Update Product Info",
                                    value: true,
                                },
                                {
                                    name: "Delete Product",
                                    value: true,
                                },
                                {
                                    name: "Show And Hide Sections",
                                    value: false,
                                },
                                {
                                    name: "Change Bussiness Email Password",
                                    value: false,
                                },
                                {
                                    name: "Add New Admin",
                                    value: false,
                                },
                            ],
                        })).save();
                        return {
                            msg: getSuitableTranslations("Creating New Admin Process Has Been Successfully !!", language),
                            error: false,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, This Admin Is Already Exist !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Merchant Has Been Blocked !!", language),
                    error: true,
                    data: {
                        blockingDate: admin.blockingDate,
                        blockingReason: admin.blockingReason,
                    },
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Permission Denied Because This Admin Is Not Merchant !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Merchant Is Not Exist !!", language),
            error: true,
            data: {},
        }
    }
    catch (err) {
        throw Error(err);
    }
}

async function updateAdminInfo(merchantId, adminId, newAdminDetails, language) {
    try {
        const admin = await adminModel.findById(merchantId);
        if (admin) {
            if (admin.isMerchant) {
                if (!admin.isBlocked) {
                    const adminDetails = await adminModel.findOneAndUpdate({ _id: adminId }, newAdminDetails);
                    if (adminDetails) {
                        return {
                            msg: getSuitableTranslations("Updating Admin Details Process Has Been Successfully !!", language),
                            error: false,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Merchant Has Been Blocked !!", language),
                    error: true,
                    data: {
                        blockingDate: admin.blockingDate,
                        blockingReason: admin.blockingReason,
                    },
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Permission Denied Because This Admin Is Not Merchant !!", language),
                error: true,
                data: {},
            }
        }
        return {
            msg: getSuitableTranslations("Sorry, This Merchant Is Not Exist !!", language),
            error: true,
            data: {},
        }
    } catch (err) {
        throw Error(err);
    }
}

async function deleteAdmin(merchantId, adminId, language) {
    try {
        const admin = await adminModel.findById(merchantId);
        if (admin) {
            if (admin.isMerchant) {
                if (!admin.isBlocked) {
                    if ((new mongoose.Types.ObjectId(adminId)).equals(merchantId)) {
                        return {
                            msg: getSuitableTranslations("Sorry, Permission Denied Because This Admin Is Merchant !!", language),
                            error: true,
                            data: {},
                        }
                    }
                    const adminDetails = await adminModel.findOneAndDelete({ _id: adminId });
                    if (adminDetails) {
                        return {
                            msg: getSuitableTranslations("Deleting Admin Process Has Been Successfully !!", language),
                            error: false,
                            data: {},
                        }
                    }
                    return {
                        msg: getSuitableTranslations("Sorry, This Admin Is Not Exist !!", language),
                        error: true,
                        data: {},
                    }
                }
                return {
                    msg: getSuitableTranslations("Sorry, This Merchant Has Been Blocked !!", language),
                    error: true,
                    data: {
                        blockingDate: admin.blockingDate,
                        blockingReason: admin.blockingReason,
                    },
                }
            }
            return {
                msg: getSuitableTranslations("Sorry, Permission Denied Because This Admin Is Not Merchant !!", language),
                error: true,
                data: {},
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
    adminLogin,
    getAdminUserInfo,
    getAdminsCount,
    getAllAdminsInsideThePage,
    addNewAdmin,
    updateAdminInfo,
    deleteAdmin
}