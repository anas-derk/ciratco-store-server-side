const { getResponseObject, getSuitableTranslations } = require("../global/functions");

const appearedSectionsOPerationsManagmentFunctions = require("../models/appeared_sections.model");

async function getAllSections(req, res) {
    try{
        res.json(await appearedSectionsOPerationsManagmentFunctions.getAllSections(req.query.language));
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

async function putSectionsStatus(req, res) {
    try{
        const result = await appearedSectionsOPerationsManagmentFunctions.updateSectionsStatus(req.data._id, req.body.sectionsStatus, req.query.language);
        if (result.error) {
            return res.status(401).json(result);
        }
        res.json(result);
    }
    catch(err) {
        res.status(500).json(getResponseObject(getSuitableTranslations("Internal Server Error !!", req.query.language), true, {}));
    }
}

module.exports = {
    putSectionsStatus,
    getAllSections,
}