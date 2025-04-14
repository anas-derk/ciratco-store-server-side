const favoriteProductsRouter = require("express").Router();

const favoriteProductsController = require("../controllers/favorite_products.controller");

const { validateJWT } = require("../middlewares/global.middlewares");

const { validateIsExistValueForFieldsAndDataTypes } = require("../global/functions");

favoriteProductsRouter.post("/add-new-favorite-product/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    favoriteProductsController.postNewFavoriteProducts
);

favoriteProductsRouter.post("/favorite-products-by-products-ids-and-user-id",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Products By Ids", fieldValue: req.body.productsIds, dataTypes: ["array"], isRequiredValue: true }
        ],
            res, next);
    },
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes(
            req.body.productsIds.map((productId, index) => (
                { fieldName: `Id In Product ${index + 1}`, fieldValue: productId, dataTypes: ["ObjectId"], isRequiredValue: true }
            )),
            res, next);
    },
    favoriteProductsController.getFavoriteProductsByProductsIdsAndUserId
);

favoriteProductsRouter.get("/favorite-products-count", validateJWT, favoriteProductsController.getFavoriteProductsCount);

favoriteProductsRouter.get("/all-favorite-products-inside-the-page",
    validateJWT,
    (req, res, next) => {
        const { pageNumber, pageSize } = req.query;
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "page Number", fieldValue: Number(pageNumber), dataTypes: ["number"], isRequiredValue: true },
            { fieldName: "page Size", fieldValue: Number(pageSize), dataTypes: ["number"], isRequiredValue: true },
        ], res, next);
    },
    favoriteProductsController.getAllFavoriteProductsInsideThePage
);

favoriteProductsRouter.delete("/all-favorite-products", validateJWT, favoriteProductsController.deleteAllFavoriteProducts);

favoriteProductsRouter.delete("/:productId",
    validateJWT,
    (req, res, next) => {
        validateIsExistValueForFieldsAndDataTypes([
            { fieldName: "Product Id", fieldValue: req.params.productId, dataTypes: ["ObjectId"], isRequiredValue: true },
        ], res, next);
    },
    favoriteProductsController.deleteFavoriteProduct
);

module.exports = favoriteProductsRouter;