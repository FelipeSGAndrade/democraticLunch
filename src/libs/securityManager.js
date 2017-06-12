'use strict';

const Crypto = require('crypto');
const Config = require('../config/config');
const Jwt = require('jsonwebtoken');

const encrypt = (object) => {

    const stringifiedMessage = JSON.stringify(object);

    const cipher = Crypto.createCipher(
        Config.security.cipher_algorithm,
        Config.security.cipher_key);

    let encrypted = cipher.update(stringifiedMessage, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
};

const decrypt = (encryptedData) => {

    const decipher = Crypto.createDecipher(
        Config.security.cipher_algorithm,
        Config.security.cipher_key);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
};

const sha256 = (value) => {

    const hash = Crypto.createHash('sha256');
    hash.update(value, 'utf8');

    return hash.digest('hex');
};

const createJwt = (userId) => {

    const encryptedUserId = encrypt(userId);

    const options = {
        algorithm: Config.security.algorithm,
        issuer: Config.security.issuer,
        expiresIn: Config.security.tokenMaxAge
    };

    const token = Jwt.sign({ encryptedUserId: encryptedUserId }, Config.security.key, options);
    return token;
};

const verifyJwt = (token) => {

    const options = {
        algorithm: Config.security.algorithm,
        issuer: Config.security.issuer
    };

    const data = Jwt.verify(token, Config.security.key, options);
    return data.encryptedUserId;
};

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    sha256: sha256,
    createJwt: createJwt,
    verifyJwt: verifyJwt
};
