const currenctExchangeRatesRouter = require("express").Router();

const currenctExchangeRatesController = require("../controllers/currency_exchange_rates.controller");

currenctExchangeRatesRouter.get("/currency-rate-agaist-base-currency", currenctExchangeRatesController.getCurrencyRateAgaistBaseCurrency);

module.exports = currenctExchangeRatesRouter;