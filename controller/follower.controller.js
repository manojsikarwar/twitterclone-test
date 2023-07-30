"use strict";
const connection = require("../models");
const sequelize = connection.sequelize;
const { user, follower } = sequelize.models;
const statusCode = require("../lib/statusCodes");
const { getMessage } = require('../lib/common');
const { Op } = connection.Sequelize

module.exports.followUser = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let { follow_id } = req.params
        // Follower User Information
        let followerUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }],
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })
        // Follow User Information
        let followUser = await user.findOne({
            where: {
                public_id: follow_id,
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })
        if (!followerUser || !followUser) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        if (follow_id == followerUser.public_id)
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'ERROR_FOLLOW_YOURSELF'))
        let checkFollow = await follower.findOne({
            where: {
                follow_id: followUser.id,
                follower_id: followerUser.id,
            }
        })
        if (checkFollow) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'ALREADY_FOLLOW'))
        await follower.create({
            follow_id: followUser.id,
            follower_id: followerUser.id,
        })
        return res.status(statusCode.OK).json(getMessage(req, false, 'FOLLOW_REQUEST'))
    } catch (err) {
        next(err)
    }
}

//Follow Request Send
module.exports.followRequest = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let limit = parseInt(req.query.limit) || 10
        let offset = parseInt(req.query.offset) || 0
        let checkUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }],
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })
        if (!checkUser) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))

        let checkRequest = await follower.findAndCountAll({
            where: {
                follow_id: checkUser.id,
                status: 'pending'
            },
            include: [{
                model: user,
                as: 'followerInfo',
                attributes: ['name', "user_name"]
            }],
            attributes: [['public_id', 'id'], 'follower_id', 'status'],
            limit,
            offset,
            // order: [['id', 'desc']]
        })
        if (checkRequest.length == 0) return res.status(statusCode.NOT_FOUND).json(getMessage(req, false, 'REQUEST_NOT_FOUND'));

        return res.status(statusCode.OK).json({
            success: true,
            counts: checkRequest.count,
            results: checkRequest.rows,
            message: getMessage(req, false, "SUCCESS")
        })
    } catch (err) { next(err) }
}

//My follower
module.exports.follower = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let limit = parseInt(req.query.limit) || 10
        let offset = parseInt(req.query.offset) || 0
        let user_id = req.query.user_id

        let checkUser = await user.findOne({
            where: {
                public_id: user_id,
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })
        if (!checkUser) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))

        let checkFollower = await follower.findAndCountAll({
            where: {
                follow_id: checkUser.id,
                status: 'accept'
            },
            include: [{
                model: user,
                as: 'followerInfo',
                attributes: ['name', "user_name"]
            }],
            attributes: [['public_id', 'id'], 'follower_id', 'follow_id', 'status'],
            limit,
            offset,
        })
        if (checkFollower.length == 0) return res.status(statusCode.NOT_FOUND).json(getMessage(req, false, 'RECORD_NOT_FOUND'));

        return res.status(statusCode.OK).json({
            success: true,
            counts: checkFollower.count,
            results: checkFollower.rows,
            message: getMessage(req, false, "SUCCESS")
        })
    } catch (err) { next(err) }
}

//My following
module.exports.following = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let limit = parseInt(req.query.limit) || 10
        let offset = parseInt(req.query.offset) || 0
        let user_id = req.query.user_id
        let checkUser = await user.findOne({
            where: {
                public_id: user_id,
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })
        if (!checkUser) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))

        let checkFollower = await follower.findAndCountAll({
            where: {
                follower_id: checkUser.id,
                status: 'accept'
            },
            include: [{
                model: user,
                as: 'followingInfo',
                attributes: ['name', "user_name"]
            }],
            attributes: [['public_id', 'id'], 'follower_id', 'follow_id', 'status'],
            limit,
            offset,
        })
        if (checkFollower.length == 0) return res.status(statusCode.NOT_FOUND).json(getMessage(req, false, 'RECORD_NOT_FOUND'));

        return res.status(statusCode.OK).json({
            success: true,
            counts: checkFollower.count,
            results: checkFollower.rows,
            message: getMessage(req, false, "SUCCESS")
        })
    } catch (err) { next(err) }
}

//Request Accept
module.exports.requestAccept = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let { id, status } = req.body
        let message = {}
        let checkUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }],
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })
        if (!checkUser) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))

        let checkRequest = await follower.findOne({
            where: {
                public_id: id,
                follow_id: checkUser.id,
                status: 'pending'
            },
        })
        if (!checkRequest) return res.status(statusCode.NOT_FOUND).json(getMessage(req, false, 'REQUEST_NOT_FOUND'));
        await follower.update({ status: status }, {
            where: {
                public_id: id,
            }
        })
        if (status == 'accept') {
            message = getMessage(req, false, 'REQUEST_ACCEPT')
        } else {
            message = getMessage(req, false, 'REQUEST_REJECT')

        }
        return res.status(statusCode.OK).json(message)
    } catch (err) { next(err) }
}

module.exports.unFollowUser = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let { follow_id } = req.params
        // Follower User Information
        let userInfo = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }],
                deleted_at: null
            },
            attributes: ['id', 'public_id']
        })

        if (!userInfo) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        if (follow_id == userInfo.public_id)
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'ERROR_FOLLOW_YOURSELF'))
        let checkFollow = await follower.findOne({
            where: {
                public_id: follow_id,
                follower_id: userInfo.id,
                status: 'accept'
            }
        })
        if (!checkFollow) return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOLLOWING'))

        await follower.destroy({
            where: {
                public_id: follow_id
            }
        })
        return res.status(statusCode.OK).json(getMessage(req, false, 'UN_FOLLOW'))
    } catch (err) {
        next(err)
    }
}