"use strict";
const connection = require("../models");
const sequelize = connection.sequelize;
const { user } = sequelize.models;
const bcrypt = require("bcrypt");
const { tokenGenerate } = require("../middleware/authorization");
const statusCode = require("../lib/statusCodes");
const { getMessage } = require('../lib/common')
const { Op } = connection.Sequelize

// User Signup
module.exports.create = async (req, res, next) => {
  let body = req.body;
  let userObj = {};
  let checkUser = await user.findOne({
    where: {
      email: body.email,
      status: "active",
    },
  });
  if (checkUser) {
    return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'USER_EXISTS'));
  }
  let hashPassword = await bcrypt.hash(body.password, 10);
  body.password = hashPassword;
  let userInfo = await user.create(body);
  let token = await tokenGenerate({
    id: userInfo.id,
    email: userInfo.email,
  });
  if (userInfo) {
    userObj = Object.assign({}, userInfo.dataValues);
  }
  userObj.token = token;
  return res.json({
    success: true,
    message: getMessage(req, false, 'CREATE'),
    result: userObj,
  });
};

// User Login
module.exports.login = async (req, res, next) => {
  let body = req.body;
  //sUser Information Check
  let userCheck = await user.findOne({
    where: {
      email: body.email,
      status: "active",
    },
    attributes: [['public_id', 'id'], 'name', 'email', 'user_name', 'is_login', 'password']
  });
  //User not found
  if (!userCheck) {
    return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'));
  }
  let userObj = Object.assign({}, userCheck.dataValues);
  //Match Password
  let match = await bcrypt.compare(body.password, userObj.password);
  if (match == false) {
    return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'WRONG_PASSWORD'));
  }

  //Login Status Update
  await user.update({ is_login: "yes" }, { where: { public_id: userObj.id } });

  //User Token Generate
  let token = await tokenGenerate({
    id: userObj.id,
    email: userObj.email,
  });

  userObj.token = token;
  delete userObj.password;
  return res.status(statusCode.OK).json({ result: userObj, message: getMessage(req, false, 'SUCCESSS') });
};

// User Profile
module.exports.profile = async (req, res, next) => {
  let userMeta = req.userInfo;
  let userData = await user.findOne({
    where: {
      [Op.or]: [
        { id: userMeta.id },
        { public_id: userMeta.id }
      ]
    },
    attributes: [['public_id', 'id'], 'name', 'email', 'user_name', 'is_login', 'status']
  });
  if (!userData) {
    return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
  }
  return res.send({ success: true, result: userData, message: getMessage(req, false, 'SUCCESS') });
};

// Logout User
module.exports.logout = async (req, res, next) => {
  let userMeta = req.userInfo;
  let userData = await user.findOne({
    where: {
      [Op.or]: [{ id: userMeta.id }, { public_id: userMeta.id }],
    },
    attributes: { exclude: ["password"] },
  });
  if (!userData) {
    return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'));
  }
  await user.update(
    { is_login: "no" },
    {
      where: {
        [Op.or]: [{ id: userMeta.id }, { public_id: userMeta.id }],
      },
    }
  );
  return res.status(statusCode.OK).json(getMessage(req, false, 'LOGOUT'));
};

// Users List
module.exports.userList = async (req, res, next) => {
  let limit = parseInt(req.query.limit) || 10
  let offset = parseInt(req.query.offset) || 0
  let metaData = req.userInfo
  let userData = await user.findAndCountAll({
    where: {
      email: { [Op.notIn]: [metaData.email] },
      status: 'active',
      deleted_at: null
    },
    attributes: [['public_id', 'id'], 'name', 'email', 'user_name', 'is_login', 'status', 'created_at'],
    limit,
    offset,
    order: [['created_at', 'desc']]
  });
  if (!userData) {
    return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
  }
  return res.send({ success: true, counts: userData.count, results: userData.rows, message: getMessage(req, false, 'SUCCESS') });
};