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
    ownerLastName: {
        type: String,
        required: true,
    },
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
        ar: "Ubuyblues",
        en: "Ubuyblues",
        de: "Ubuyblues",
        tr: "Ubuyblues"
    },
    imagePath: "assets/images/stores/Logo.jpg",
    ownerFirstName: "Soliman",
    ownerLastName: "Asfour",
    ownerEmail: process.env.MAIN_ADMIN_EMAIL,
    isApproved: true,
    productsType: {
        ar: "Multiple",
        en: "Multiple",
        de: "Multiple",
        tr: "Multiple"
    },
    productsDescription: {
        ar: "Welcome To Ubuyblues Store",
        en: "Welcome To Ubuyblues Store",
        de: "Welcome To Ubuyblues Store",
        tr: "Welcome To Ubuyblues Store"
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