"use strict";
const language = require('../language')

module.exports.getMessage = (req, status, key) => {
    try {
        let languageCode = req.headers && req.headers.language;
        languageCode = languageCode || 'en';
        const condition = language[languageCode] && language.en[`${key}`];
        return condition
    } catch (error) {
        throw new Error(error);
    }
};