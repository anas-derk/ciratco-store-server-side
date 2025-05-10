const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// Create Store Schema

const storeSchema = new mongoose.Schema({
    name: {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        de: {
            type: String,
            required: true,
        },
        tr: {
            type: String,
            required: true,
        },
    },
    imagePath: {
        type: String,
        required: true,
    },
    ownerFirstName: {
        type: String,
        required: true,
    },
    ownerLastName: String,
    ownerEmail: {
        type: String,
        required: true,
    },
    productsType: {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        de: {
            type: String,
            required: true,
        },
        tr: {
            type: String,
            required: true,
        },
    },
    productsDescription: {
        ar: {
            type: String,
            required: true,
        },
        en: {
            type: String,
            required: true,
        },
        de: {
            type: String,
            required: true,
        },
        tr: {
            type: String,
            required: true,
        },
    },
    status: {
        type: String,
        default: "pending",
        enum: [
            "pending",
            "approving",
            "rejecting",
            "blocking",
        ],
    },
    isMainStore: Boolean,
    language: {
        type: String,
        enum: [
            "ar",
            "en",
            "de",
            "tr"
        ],
        default: "en"
    },
    creatingOrderDate: {
        type: Date,
        default: Date.now,
    },
    approveDate: Date,
    blockingDate: Date,
    dateOfCancelBlocking: Date,
    blockingReason: String,
});

// Create Store Model From Store Schema

const storeModel = mongoose.model("store", storeSchema);

const storeInfo = {
    name: {
        ar: process.env.WEBSITE_NAME,
        en: process.env.WEBSITE_NAME,
        de: process.env.WEBSITE_NAME,
        tr: process.env.WEBSITE_NAME
    },
    imagePath: "assets/images/stores/Logo.webp",
    ownerFirstName: process.env.MAIN_ADMIN_FIRST_NAME,
    ownerLastName: process.env.MAIN_ADMIN_LAST_NAME,
    ownerEmail: process.env.MAIN_ADMIN_EMAIL,
    isApproved: true,
    productsType: {
        ar: "Multiple",
        en: "Multiple",
        de: "Multiple",
        tr: "Multiple"
    },
    productsDescription: {
        ar: `Welcome To ${process.env.WEBSITE_NAME} Store`,
        en: `Welcome To ${process.env.WEBSITE_NAME} Store`,
        de: `Welcome To ${process.env.WEBSITE_NAME} Store`,
        tr: `Welcome To ${process.env.WEBSITE_NAME} Store`
    },
    status: "approving",
    isMainStore: true,
    approveDate: Date.now(),
};

async function create_initial_store() {
    try {
        await mongoose.connect(process.env.DB_URL);
        await (new storeModel(storeInfo)).save();
        await mongoose.disconnect();
        return "Ok !!, Create Initial Store Process Has Been Successfuly !!";
    } catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

create_initial_store().then((result) => console.log(result));