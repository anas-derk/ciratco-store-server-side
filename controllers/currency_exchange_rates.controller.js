const { getResponseObject, getSuitableTranslations } = require("../global/functions");

async function getCurrencyRateAgaistUSD(req, res) {
    try {
        const currencySymbol = req.query.currencySymbol;
        const response = await fetch(`${process.env.CURRENCY_EXCHANGE_RATES_BASE_API_URL}/fetch-one?api_key=${process.env.CURRENCY_EXCHANGE_RATES_API_KEY}&to=${currencySymbol}`, { method: "GET", headers: { accept: "application/json" } });
        res.json({
            msg: "Get Currency Rate Process Has Been Successfully !!",
            error: false,
            data: (await response.json()).result[currencySymbol],
        });
    }
    catch (err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    getCurrencyRateAgaistUSD,
}