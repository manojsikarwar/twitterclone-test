module.exports = {
    LOGOUT: {
        success: true,
        message: 'Logout successful.',
    },
    SUCCESS: "Fetch record successfully.",
    CREATE: "Create successfully.",
    USER_EXISTS: { status: false, message: "User already exists." },
    FAILED: { success: false, message: 'Something went wrong, Please try again!' },
    NOT_FOUND: {
        success: false,
        message: "User not exist.",
    },
    WRONG_PASSWORD: {
        success: false,
        message: "Please check your password.",
    },
    UNAUTHORIZED: {
        success: false,
        message: "Unauthorized.",
    },
    INVALID_TOKEN: {
        success: false,
        message: "Invalid Token .",
    },
    FORBIDDEN: {
        success: false,
        message: "Forbidden",
    },
    RECORD_NOT_FOUND: {
        success: false,
        message: "Record not found.",
    },
    RECORD_DELETE: {
        success: true,
        message: "twitter feed deleted.",
    },
    RECORD_UPDATE: {
        success: true,
        message: "twitter updated.",
    },
    ERROR_FOLLOW_YOURSELF: {
        success: false,
        message: "You cannot follow your self.",
    },
    FOLLOW_REQUEST: {
        success: true,
        message: "Your follow request has been send.",
    },
    ALREADY_FOLLOW: {
        success: true,
        message: "Your are already following this user.",
    },
    REQUEST_NOT_FOUND: {
        success: false,
        message: "Request not found.",
    },
    REQUEST_ACCEPT: {
        success: true,
        message: "Request accepted.",
    },
    REQUEST_REJECT: {
        success: true,
        message: "Request rejected.",
    },
    NOT_FOLLOWING: {
        success: false,
        message: "You are not following.",
    },
    UN_FOLLOW: {
        success: true,
        message: "User un-followed.",
    }

}