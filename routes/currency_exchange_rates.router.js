const currenctExchangeRatesRouter = require("express").Router();

const currenctExchangeRatesController = require("../controllers/currency_exchange_rates.controller");

currenctExchangeRatesRouter.get("/currency-rate-agaist-usd", currenctExchangeRatesController.getCurrencyRateAgaistUSD);

module.exports = currenctExchangeRatesRouter;