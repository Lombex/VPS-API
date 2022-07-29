const MongoDB = require("mongoose");

let LoginSchema = new MongoDB.Schema({
    user: {
        type: String,
        required: false,
        minlength: 3,
        maxlength: 45
    },
    email: {
        type: String,
        required: true,
        maxlength: 128
    },
    password: {
        type: String,
        required: true,
        minlength: 8,
        maxlength: 256
    },
    rank: {
        type: String,
        required: false,
        maxlength: 128
    },
    joined: {
        type: Date,
        required: true,
        default: Date.now
    }
});

module.exports = MongoDB.model("Login", LoginSchema);