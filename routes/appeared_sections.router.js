const appearedSectionsRouter = require("express").Router();

const appearedSectionsController = require("../controllers/appeared_sections.controller");

const { validateJWT } = require("../middlewares/global.middlewares");

appearedSectionsRouter.get("/all-sections", appearedSectionsController.getAllSections);

appearedSectionsRouter.put("/update-sections-status", validateJWT, appearedSectionsController.putSectionsStatus);

module.exports = appearedSectionsRouter;