"use strict";
const connection = require("../models");
const sequelize = connection.sequelize;
const { twitter_feed, user, follower } = sequelize.models;
const statusCode = require("../lib/statusCodes");
const { getMessage } = require('../lib/common');
const { Op } = connection.Sequelize

//twitter Create
module.exports.twitterFeedCreate = async (req, res, next) => {
    try {
        let userMeta = req.userInfo
        let body = req.body
        let getUser = await user.findOne({
            where: {
                [Op.or]: [{ id: userMeta.id }, { public_id: userMeta.id }]
            },
            attributes: ['id']
        })
        if (!getUser) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        }
        //Make twitter
        let createTwitter = await twitter_feed.create({
            title: body.title,
            description: body.description,
            user_id: getUser.id
        })
        if (!createTwitter) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'FAILED'))
        }
        return res.json({
            success: true,
            result: createTwitter,
            message: getMessage(req, false, "CREATE")
        })
    } catch (err) {
        next(err)
    }

}

//My All twitter
module.exports.myTwitterFeed = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let limit = parseInt(req.query.limit) || 10
        let offset = parseInt(req.query.offset) || 0
        let getUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }]
            },
            attributes: ['id']
        })
        if (!getUser) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        }

        // Get my twitter
        let twitterList = await twitter_feed.findAndCountAll({
            where: {
                user_id: getUser.id,
                status: 'active',
                deleted_at: null
            },
            attributes: [['public_id', 'id'], 'title', 'description', 'user_id', 'created_at'],
            limit,
            offset,
            order: [['id', 'DESC']]
        })
        return res.status(statusCode.OK).json({
            success: true,
            counts: twitterList.count,
            results: twitterList.rows,
            message: getMessage(req, false, "SUCCESS")
        })
    } catch (err) {
        next(err)
    }
}

//twitter Details
module.exports.twitterFeedDetails = async (req, res, next) => {
    try {
        let { public_id } = req.params
        // My twitter details
        let twitterList = await twitter_feed.findOne({
            where: {
                public_id: public_id,
                status: 'active',
                deleted_at: null
            },
            attributes: [['public_id', 'id'], 'title', 'description', 'user_id', 'created_at'],
        })
        if (!twitterList) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'RECORD_NOT_FOUND'))
        }
        return res.status(statusCode.OK).json({
            success: true,
            result: twitterList,
            message: getMessage(req, false, "SUCCESS")
        })
    } catch (err) {
        next(err)
    }
}

//My twitter Delete
module.exports.twitterFeedDelete = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let { public_id } = req.params
        console.log(metaData)

        //User Information
        let getUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }]
            }
        })
        if (!getUser) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        }
        // My twitter details
        let twitterList = await twitter_feed.findOne({
            where: {
                public_id: public_id,
                user_id: getUser.id,
                status: 'active',
                deleted_at: null
            },
            attributes: ['id'],
        })
        if (!twitterList) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'FAILED'))
        }
        await twitter_feed.update({ deleted_at: new Date() }, { where: { public_id: public_id } })
        return res.status(statusCode.OK).json(
            getMessage(req, false, "RECORD_DELETE")
        )
    } catch (err) {
        next(err)
    }
}

//My twitter Update
module.exports.twitterFeedUpdate = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let { public_id, title, description } = req.body

        //User Information
        let getUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }]
            }
        })
        if (!getUser) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        }
        // My twitter details
        let twitterList = await twitter_feed.findOne({
            where: {
                public_id: public_id,
                user_id: getUser.id,
                status: 'active',
                deleted_at: null
            },
            attributes: ['id'],
        })
        if (!twitterList) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'FAILED'))
        }
        let updateParams = {}
        if (title) {
            updateParams.title = title
        }
        if (description) {
            updateParams.description = description
        }
        await twitter_feed.update(updateParams, { where: { public_id: public_id } })

        return res.status(statusCode.OK).json(
            getMessage(req, false, "RECORD_UPDATE")
        )
    } catch (err) {
        next(err)
    }
}

//All twitter
module.exports.allTwitterFeed = async (req, res, next) => {
    try {
        let metaData = req.userInfo
        let limit = parseInt(req.query.limit) || 10
        let offset = parseInt(req.query.offset) || 0
        let userIds = []
        let getUser = await user.findOne({
            where: {
                [Op.or]: [{ id: metaData.id }, { public_id: metaData.id }]
            },
            attributes: ['id']
        })
        if (!getUser) {
            return res.status(statusCode.BAD_REQUEST).json(getMessage(req, false, 'NOT_FOUND'))
        }
        let getMyFollower = await follower.findAll({
            where: {
                follower_id: getUser.id,
                status: 'accept'
            },
            attributes: ['follow_id'],
            limit,
            offset

        })
        userIds.push(getUser.id)
        if (getMyFollower.length > 0) {
            for (let key of getMyFollower) {
                userIds.push(key.follow_id)
            }
        }
        // Get my twitter
        let twitterList = await twitter_feed.findAndCountAll({
            where: {
                user_id: { [Op.in]: userIds },
                status: 'active',
                deleted_at: null
            },
            include: [{
                model: user,
                as: 'userInfo',
                attributes: ['public_id', 'name', 'user_name']
            }],
            attributes: [['public_id', 'id'], 'title', 'description', 'user_id', 'created_at'],
            limit,
            offset,
        })
        return res.status(statusCode.OK).json({
            success: true,
            counts: twitterList.count,
            results: twitterList.rows,
            message: getMessage(req, false, "SUCCESS")
        })
    } catch (err) {
        next(err)
    }
}