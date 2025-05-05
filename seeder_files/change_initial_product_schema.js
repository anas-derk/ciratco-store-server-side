const mongoose = require("mongoose");

require("dotenv").config({
    path: "../.env",
});

// Create Product Schema

const productSchema = new mongoose.Schema({
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
    price: {
        type: Number,
        required: true,
    },
    description: {
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
    categories: {
        type: [{
            type: mongoose.Types.ObjectId,
            ref: "categorie",
            required: true
        }],
    },
    discount: {
        type: Number,
        default: 0,
    },
    discountInOfferPeriod: {
        type: Number,
        default: 0,
    },
    offerDescriptionBase: {
        type: String,
        default: "",
    },
    offerDescription: {
        ar: {
            type: String,
            default: "",
        },
        en: {
            type: String,
            default: "",
        },
        de: {
            type: String,
            default: "",
        },
        tr: {
            type: String,
            default: "",
        },
    },
    numberOfOrders: {
        type: Number,
        default: 0,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    countries: {
        type: Array,
        default: ["KW"],
    },
    ratings: {
        type: Object,
        default: {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0
        }
    },
    postOfDate: {
        type: Date,
        default: Date.now,
    },
    imagePath: {
        type: String,
        required: true,
    },
    threeDImagePath: String,
    galleryImagesPaths: Array,
    startDiscountPeriod: Date,
    endDiscountPeriod: Date,
    storeId: {
        type: String,
        required: true,
    }
});

// Create Product Model From Product Schema

const productModel = mongoose.model("product", productSchema);

async function change_initial_product_schema() {
    try {
        await mongoose.connect(process.env.DB_URL);
        const allProducts = await productModel.find();
        for (let product of allProducts) {
            const originalDescription = product.offerDescription;
            product.offerDescriptionBase = originalDescription;
            product.offerDescription = {
                ar: originalDescription,
                en: originalDescription,
                tr: originalDescription,
                de: originalDescription
            };
            await product.save();
        }
        await mongoose.disconnect();
        return "Ok !!, Change Initial Product Schema Process Has Been Successfuly !!";
    } catch (err) {
        await mongoose.disconnect();
        throw Error(err);
    }
}

change_initial_product_schema().then((result) => console.log(result));