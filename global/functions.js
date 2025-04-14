const { Types } = require("mongoose");

const { getPasswordForBussinessEmail } = require("../models/global_passwords.model");

const { createTransport } = require("nodemailer");

const CodeGenerator = require("node-code-generator");

const { join } = require("path");

const { readFileSync } = require("fs");

const { compile } = require("ejs");

const sharp = require("sharp");

const arTranslations = require("./translations/ar.json");

const trTranslations = require("./translations/tr.json");

const deTranslations = require("./translations/de.json");

const { post } = require("axios");

function isEmail(email) {
    return email.match(/[^\s@]+@[^\s@]+\.[^\s@]+/);
}

function isValidPassword(password) {
    return password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/);
}

function isValidName(name) {
    return name.match(/^([\u0600-\u06FF\s]+|[a-zA-Z\s]+)$/);
}

function isValidLanguage(language) {
    return ["ar", "en", "de", "tr"].includes(language);
}

function calcOrderTotalPrices(products) {
    const totalPrices = {
        totalPriceBeforeDiscount: 0,
        totalDiscount: 0,
        totalPriceAfterDiscount: 0
    }
    for (let product of products) {
        totalPrices.totalPriceBeforeDiscount += product.unitPrice * product.quantity;
        totalPrices.totalDiscount += product.unitDiscount * product.quantity;
    }
    totalPrices.totalPriceAfterDiscount = totalPrices.totalPriceBeforeDiscount - totalPrices.totalDiscount;
    return totalPrices;
}

function transporterObj(bussinessEmailPassword) {
    // إنشاء ناقل بيانات لسيرفر SMTP مع إعداده 
    const transporter = createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        requireTLS: true,
        auth: {
            user: process.env.BUSSINESS_EMAIL,
            pass: bussinessEmailPassword,
        },
        tls: {
            ciphers: "SSLv3",
        },
    });
    return transporter;
}

async function sendVerificationCodeToUserEmail(email) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const generator = new CodeGenerator();
        const generatedCode = generator.generateCodes("####")[0];
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "email_template.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ generatedCode });
        const mailConfigurations = {
            from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
            to: email,
            subject: `Account Verification Code On ${process.env.WEBSITE_NAME} Store`,
            html: htmlContentAfterCompilingEjsTemplateFile,
        };
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail(mailConfigurations, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Confirmation Code Process Has Been Successfully !!",
                    error: false,
                    data: generatedCode,
                });
            });
        });
    }
    return result;
}

async function sendApproveStoreEmail(email, password, adminId, storeId, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "accept_add_store_request.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ password, adminId, storeId, language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Approve The Store Addition Request At ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Approve Email On Store Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendCongratulationsOnCreatingNewAccountEmail(email, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "congratulations_creating_new_account.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ email, language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Welcome Message From ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Congratulations Email To User Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendRejectStoreEmail(email, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "reject_add_store_request.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Reject The Store Addition Request At ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Reject Email On Store Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendConfirmRequestAddStoreArrivedEmail(email, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "confirm_request_add_store_arrived.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Confirmation Of Store Addition Request At ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: `Sending Confirmation Of Store Addition Request At ${process.env.WEBSITE_NAME} Email Process Has Been Successfully !!`,
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendBlockStoreEmail(email, adminId, storeId, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "block_store.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ adminId, storeId, language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Block Store On ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Block Email The Store Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendDeleteStoreEmail(email, adminId, storeId, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "delete_store.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ adminId, storeId, language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Delete Store On ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Delete Email The Store Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendReceiveOrderEmail(email, orderDetails, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "receive_order.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ orderDetails, language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Receive Order On ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: `Sending Receive Order Email On ${process.env.WEBSITE_NAME} Store Process Has Been Successfully !!`,
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendUpdateOrderEmail(email, newOrderDetails, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", `${newOrderDetails.status === "shipping" ? "order_in_shipping_status" : "order_shipped"}.ejs`), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ newOrderDetails, language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: newOrderDetails.status === "shipping" ? `Order In Shipping Now From ${process.env.WEBSITE_NAME}` : `Order Arrived From ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: `Sending Receive Order Email On ${process.env.WEBSITE_NAME} Store Process Has Been Successfully !!`,
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendReceiveAddStoreRequestEmail(email, storeDetails) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "receive_add_store_request.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate(storeDetails);
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: "Receive Add Store Request",
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Receive Add Store Request Email To Website Owner Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

async function sendChangePasswordEmail(email, language) {
    const result = await getPasswordForBussinessEmail(process.env.BUSSINESS_EMAIL);
    if (!result.error) {
        const templateContent = readFileSync(join(__dirname, "..", "assets", "email_templates", "change_password.ejs"), "utf-8");
        const compiledTemplate = compile(templateContent);
        const htmlContentAfterCompilingEjsTemplateFile = compiledTemplate({ language });
        return new Promise((resolve, reject) => {
            transporterObj(result.data).sendMail({
                from: `${process.env.WEBSITE_NAME} <${process.env.BUSSINESS_EMAIL}>`,
                to: email,
                subject: `Changing The User Password In ${process.env.WEBSITE_NAME}`,
                html: htmlContentAfterCompilingEjsTemplateFile,
            }, function (error, info) {
                if (error) reject(error);
                resolve({
                    msg: "Sending Change The User Password Email Process Has Been Successfully !!",
                    error: false,
                    data: {},
                });
            });
        });
    }
    return result;
}

function getResponseObject(msg, isError, data) {
    return {
        msg,
        error: isError,
        data,
    }
}

function getDataTypesAsText(dataTypes) {
    return dataTypes.map((dataType, index) => dataType + (index !== dataTypes.length - 1 ? " Or " : ""));
}

function checkIsExistValueForFieldsAndDataTypes(fieldNamesAndValuesAndDataTypes) {
    for (let fieldnameAndValueAndDataType of fieldNamesAndValuesAndDataTypes) {
        if (fieldnameAndValueAndDataType.isRequiredValue) {
            if (fieldnameAndValueAndDataType.dataTypes.includes("array")) {
                if (Array.isArray(fieldnameAndValueAndDataType.fieldValue)) {
                    if (fieldnameAndValueAndDataType.fieldValue.length === 0) {
                        return getResponseObject(
                            `Invalid Request, Please Send ${fieldnameAndValueAndDataType.fieldName} Value !!`,
                            true,
                            {}
                        );
                    }
                }
                else return getResponseObject(
                    `Invalid Request, Please Fix Type Of ${fieldnameAndValueAndDataType.fieldName} ( Required: ${getDataTypesAsText(fieldnameAndValueAndDataType.dataTypes)} ) !!`,
                    true,
                    {}
                );
            }
            if (!fieldnameAndValueAndDataType.fieldValue) {
                return getResponseObject(
                    `Invalid Request, Please Send ${fieldnameAndValueAndDataType.fieldName} Value !!`,
                    true,
                    {}
                );
            }
        }
        if (fieldnameAndValueAndDataType.fieldValue) {
            let isExistTruthDataType = false;
            for (let dataType of fieldnameAndValueAndDataType.dataTypes) {
                if (dataType === "number" && !isNaN(fieldnameAndValueAndDataType.fieldValue)) {
                    isExistTruthDataType = true;
                    break;
                }
                if (dataType === "ObjectId" && Types.ObjectId.isValid(fieldnameAndValueAndDataType.fieldValue)) {
                    isExistTruthDataType = true;
                    break;
                }
                if (dataType === "array" && Array.isArray(fieldnameAndValueAndDataType.fieldValue)) {
                    isExistTruthDataType = true;
                    break;
                }
                if (dataType === typeof fieldnameAndValueAndDataType.fieldValue) {
                    isExistTruthDataType = true;
                }
            }
            if (!isExistTruthDataType) {
                return getResponseObject(
                    `Invalid Request, Please Fix Type Of ${fieldnameAndValueAndDataType.fieldName} ( Required: ${getDataTypesAsText(fieldnameAndValueAndDataType.dataTypes)} ) !!`,
                    true,
                    {}
                );
            }
        }
    }
    return getResponseObject("Success In Check Is Exist Value For Fields And Data Types !!", false, {});
}

function validateIsExistValueForFieldsAndDataTypes(fieldsDetails, res, nextFunc) {
    const checkResult = checkIsExistValueForFieldsAndDataTypes(fieldsDetails);
    if (checkResult.error) {
        res.status(400).json(checkResult);
        return;
    }
    nextFunc();
}

async function handleResizeImagesAndConvertFormatToWebp(files, outputImageFilePaths, newFormat = "webp", newWidth = 550, quality = 100) {
    try {
        for (let i = 0; i < files.length; i++) {
            await sharp(files[i], {
                failOn: "none"
            })
                .withMetadata()
                .rotate()
                .resize({
                    width: newWidth,
                })
                .toFormat(newFormat, {
                    quality
                })
                .toFile(outputImageFilePaths[i]);
        }
    }
    catch (err) {
        throw err;
    }
}

async function handleSaveImages(files, outputImageFilePaths, newWidth = 3000) {
    try {
        for (let i = 0; i < files.length; i++) {
            await sharp(files[i], {
                failOn: "none"
            })
                .withMetadata()
                .resize({
                    width: newWidth,
                })
                .toFile(outputImageFilePaths[i]);
        }
    }
    catch (err) {
        throw err;
    }
}

function processingTranslation(variablesObject, translation) {
    const variables = Object.keys(variablesObject);
    if (variables.length > 0) {
        variables.forEach((variable) => {
            translation = translation.replace(`{{${variable}}}`, variablesObject[variable]);
        });
        return translation;
    }
    return translation;
}

function getSuitableTranslations(msg, language, variables = {}) {
    if (language) {
        switch (language) {
            case "ar": return processingTranslation(variables, arTranslations[msg] ? arTranslations[msg] : msg);
            case "tr": return processingTranslation(variables, trTranslations[msg] ? trTranslations[msg] : msg);
            case "de": return processingTranslation(variables, deTranslations[msg] ? deTranslations[msg] : msg);
            default: return processingTranslation(variables, msg);
        }
    }
    return {
        en: processingTranslation(variables, msg),
        ar: processingTranslation(variables, arTranslations[msg] ? arTranslations[msg] : msg),
        tr: processingTranslation(variables, trTranslations[msg] ? trTranslations[msg] : msg),
        de: processingTranslation(variables, deTranslations[msg] ? deTranslations[msg] : msg)
    }
}

async function translateSentensesByAPI(sentenses, targetLanguage) {
    try {
        return (await post(`${process.env.TRANSLATE_BASE_API_URL}/v2/translate`, {
            text: sentenses,
            target_lang: targetLanguage
        }, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `DeepL-Auth-Key ${process.env.TRANSLATE_API_KEY}`
            }
        })).data.translations;
    }
    catch (err) {
        throw err;
    }
}

module.exports = {
    isEmail,
    isValidPassword,
    isValidName,
    isValidLanguage,
    calcOrderTotalPrices,
    sendVerificationCodeToUserEmail,
    sendCongratulationsOnCreatingNewAccountEmail,
    sendApproveStoreEmail,
    sendRejectStoreEmail,
    sendConfirmRequestAddStoreArrivedEmail,
    sendBlockStoreEmail,
    sendDeleteStoreEmail,
    sendReceiveOrderEmail,
    sendUpdateOrderEmail,
    sendReceiveAddStoreRequestEmail,
    sendChangePasswordEmail,
    getResponseObject,
    checkIsExistValueForFieldsAndDataTypes,
    validateIsExistValueForFieldsAndDataTypes,
    handleResizeImagesAndConvertFormatToWebp,
    handleSaveImages,
    getSuitableTranslations,
    translateSentensesByAPI
}