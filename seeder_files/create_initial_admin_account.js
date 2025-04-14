const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// create Admin User Schema For Admin User Model

const adminSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    isWebsiteOwner: {
        type: Boolean,
        default: false,
    },
    isMerchant: {
        type: Boolean,
        default: false,
    },
    storeId: {
        type: String,
        required: true,
    },
    permissions: {
        type: [
            {
            name: {
                type: String,
                required: true,
                enum: [
                    "Add New Brand",
                    "Update Brand Info",
                    "Delete Brand",
                    "Update Order Info",
                    "Delete Order",
                    "Update Order Info",
                    "Update Order Product Info",
                    "Delete Order Product",
                    "Add New Category",
                    "Update Category Info",
                    "Delete Category",
                    "Add New Product",
                    "Update Product Info",
                    "Delete Product",
                    "Show And Hide Sections",
                    "Change Bussiness Email Password",
                    "Add New Admin",
                    "Add New Ad",
                    "Update Ad Info",
                    "Delete Ad"
                ],
            },
            value: {
                type: Boolean,
                required: true,
            }
        },
        ],
        required: true,
    },
    isBlocked: {
        type: Boolean,
        default: false,
    },
    blockingReason: String,
    creatingDate: {
        type: Date,
        default: Date.now(),
    },
    blockingDate: Date,
    dateOfCancelBlocking: Date,
});

// create Admin User Model In Database

const adminModel = mongoose.model("admin", adminSchema);

// require bcryptjs module for password encrypting

const { hash } = require("bcryptjs");

const userInfo = {
    firstName: "Soliman",
    lastName: "Asfour",
    email: process.env.MAIN_ADMIN_EMAIL,
    password: process.env.MAIN_ADMIN_PASSWORD,
    isWebsiteOwner: true,
    isMerchant: true,
    storeId: "660b68f8877eb32dd398015c",
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
            value: true,
        },
        {
            name: "Change Bussiness Email Password",
            value: true,
        },
    ],
    
}

async function create_initial_admin_user_account() {
    try {
        await mongoose.connect(process.env.DB_URL);
        let user = await adminModel.findOne({ email: userInfo.email });
        if (user) {
            await mongoose.disconnect();
            return "Sorry, Can't Insert Admin Data To Database Because it is Exist !!!";
        }
        const encrypted_password = await hash(userInfo.password, 10);
        userInfo.password = encrypted_password;
        const new_admin_user = new adminModel(userInfo);
        await new_admin_user.save();
        await mongoose.disconnect();
        return "Ok !!, Create Initial Admin Account Process Has Been Successfuly !!";
    } catch(err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

create_initial_admin_user_account().then((result) => console.log(result));