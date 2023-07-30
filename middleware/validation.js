"use strict";
const Joi = require("joi");

module.exports.signupValid = async (req, res, next) => {
  let body = req.body;
  let schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required(),
    gender: Joi.string().valid("male", "female").required(),
    user_name: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};

module.exports.loginValid = async (req, res, next) => {
  let body = req.body;
  let schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};

module.exports.twitterValid = async (req, res, next) => {
  let body = req.body;
  let schema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};

module.exports.twitterFeedUpdateValid = async (req, res, next) => {
  let body = req.body;
  let schema = Joi.object({
    public_id: Joi.string().required(),
    title: Joi.string().optional(),
    description: Joi.string().optional(),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};

module.exports.followValid = async (req, res, next) => {
  let body = req.query;
  let schema = Joi.object({
    user_id: Joi.string().required(),
  });
  try {
    await schema.validateAsync({ user_id: body.user_id });
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};

module.exports.reqAcceptValid = async (req, res, next) => {
  let body = req.body;
  let schema = Joi.object({
    id: Joi.string().required(),
    status: Joi.string().valid('accept', 'reject').required(),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};

module.exports.unFollowValid = async (req, res, next) => {
  let body = req.params;
  let schema = Joi.object({
    follow_id: Joi.string().required(),
  });
  try {
    await schema.validateAsync(body);
    next();
  } catch (err) {
    res.status(409).json({ result: err.details });
  }
};