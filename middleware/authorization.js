"use strict";
const jwt = require("jsonwebtoken");
const connection = require("../models");
const sequelize = connection.sequelize;
const { Op } = connection.Sequelize
const { user } = sequelize.models;
require("dotenv").config();
const statusCode = require("../lib/statusCodes");
const { getMessage } = require('../lib/common');

module.exports.tokenGenerate = async (body) => {
  let token = await jwt.sign(
    {
      data: body,
    },
    process.env.SECRET_KEY,
    { expiresIn: "12h" }
  );
  return token;
};

module.exports.verifyToken = async (req, res, next) => {
  let auth = req.headers.authorization;
  if (auth && auth.split(" ")[1]) {
    let token = auth.split(" ")[1];
    if (token) {
      jwt.verify(token, process.env.SECRET_KEY, async function (err, decoded) {
        if (err) {
          return res.status(statusCode.UNAUTHORIZED).json(getMessage(req, false, 'INVALID_TOKEN'));

        }
        if (decoded.data) {
          let { id } = decoded.data;
          // Check User Valid or Not
          let userInfo = await user.findOne({
            where: {
              [Op.or]: [{ id: id }, { public_id: id }],
              status: "active",
              is_login: 'yes'
            },
          });

          if (!userInfo) {
            return res.status(statusCode.UNAUTHORIZED).json(getMessage(req, false, 'UNAUTHORIZED'));
          }
          req.userInfo = decoded.data;
          next();
        }
      });
    } else {
      return res.status(statusCode.FORBIDDEN).json(getMessage(req, false, 'FORBIDDEN'));
    }
  } else {
    return res.status(statusCode.UNAUTHORIZED).json(getMessage(req, false, 'UNAUTHORIZED'));
  }
};
