/* Start Import And Create Express App */

const express = require("express");

const app = express();

const path = require("path");

const cors = require("cors");

const bodyParser = require("body-parser");

const mongoose = require("mongoose");

const { rateLimit } = require("express-rate-limit");

require("dotenv").config();

/* End Import And Create Express App */

/* Start Running The Server */

const PORT = process.env.PORT || 5200;

app.listen(PORT, async () => {

    console.log(`The Server Is Running On: http://localhost:${PORT}`);

    try {
        await mongoose.connect(process.env.DB_URL);
    }
    catch (err) {
        console.log(err);
    }

    /* Start Config The Server */

    app.use(cors({
        origin: "*"
    }));

    const { keyGeneratorForRequestsRateLimit } = require("./middlewares/global.middlewares");

    const globalLimiter = rateLimit({
        windowMs: 24 * 60 * 60 * 1000,
        limit: 5000,
        standardHeaders: true,
        legacyHeaders: false,
        message: () => {
            return {
                msg: "Sorry, Too Many Requests, Please Try Again Later !!",
                error: true,
                data: {},
            }
        },
        keyGenerator: keyGeneratorForRequestsRateLimit,
    });

    app.use(globalLimiter);

    app.use(bodyParser.json());

    /* End Config The Server */

    /* Start direct the browser to statics files path */

    app.set("trust proxy", 1);

    app.use("/assets", express.static(path.join(__dirname, "assets")));

    /* End direct the browser to statics files path */

    const { validateLanguage } = require("./middlewares/global.middlewares");

    app.use((req, res, next) => {
        const { language } = req.query;
        if (language) {
            validateLanguage(language, res, next);
            return;
        }
        next();
    });

    /* Start Handle The Routes */

    app.use("/admins", require("./routes/admins.router"));

    app.use("/products", require("./routes/products.router"));

    app.use("/users", require("./routes/users.router"));

    app.use("/categories", require("./routes/categories.router"));

    app.use("/orders", require("./routes/orders.router"));

    app.use("/brands", require("./routes/brands.router"));

    app.use("/appeared-sections", require("./routes/appeared_sections.router"));

    app.use("/global-passwords", require("./routes/global_passwords.router"));

    app.use("/subscriptions", require("./routes/subscriptions.router"));

    app.use("/referals", require("./routes/referals.router"));

    app.use("/stores", require("./routes/stores.router"));

    app.use("/favorite-products", require("./routes/favorite_products.router"));

    app.use("/wallet", require("./routes/products_wallet.router"));

    app.use("/ratings", require("./routes/ratings.router"));

    app.use("/ads", require("./routes/ads.router"));

    app.use("/coupons", require("./routes/coupons.router"));

    app.use("/currency-exchange-rates", require("./routes/currency_exchange_rates.router"));

    /* End Handle The Routes */
});

/* End Running The Server */

/* Start Handling Events */

mongoose.connection.on("connected", () => console.log("connected"));
mongoose.connection.on("disconnected", () => console.log("disconnected"));
mongoose.connection.on("reconnected", () => console.log("reconnected"));
mongoose.connection.on("disconnecting", () => console.log("disconnecting"));
mongoose.connection.on("close", () => console.log("close"));

process.on("SIGINT", async () => {
    await mongoose.connection.close();
});

/* End Handling Events */

module.exports = {
    mongoose,
}