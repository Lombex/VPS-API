const Express = require("express");
const Router = Express.Router();
const JsonToken = require("jsonwebtoken");
const Encryption = require("bcryptjs");
const { request, response } = require("express");
const ServerInfo = require("../ServerInfo.json");

const LoginDatabase = require("../DataStructure/LoginEndpoint");

//#region LoginEndpoints

    Router.post("/user/add", Authentication, AdminOnly, async (request, response) => {
        let UserEmail = await LoginDatabase.findOne({ email: request.body.email });
        if (UserEmail) return response.status(400).json({ message: "User already exits inside database!" });

        let Salt = await Encryption.genSalt(14);
        let HashPassword = await Encryption.hash(request.body.password, Salt);

        let CreateUser = new LoginDatabase({
            user: request.body.user,
            email: request.body.email,
            password: HashPassword,
            rank: request.body.rank
            //address: request.socket.remoteAddress
        });

        try {
            let User = await CreateUser.save();
            response.status(201).json({message: "Successfully added user as: " + User.email });
        } catch (error) {
            response.status(400).json({ message: "Failed adding user " });
            console.log("Failed creating user:\n" + error);
        }
    });

    Router.post("/login", async (request, response) => 
    {
        let UserEmail = await LoginDatabase.findOne({ email: request.body.email });
        if (!UserEmail) return response.status(401).json({ message: "Your login is invalid please try again!" });

        let Password = await Encryption.compare(request.body.password, UserEmail.password);
        if (!Password) return response.status(401).json({ message: "Your login is invalid please try again!" });
        
        let Token = JsonToken.sign({ UserEmail: UserEmail._id }, ServerInfo.EncryptionToken, { expiresIn: '36h'});
        response.header("auth-token", Token).json({ Token, UserID: UserEmail._id, Rank: UserEmail.rank});
    });

//#endRegion LoginEndpoints


//#region Functions

function Authentication(request, response, next) {
    let GetToken = request.header("auth-token");
    if (!GetToken) return response.status(401).json({ message: "No permission to access this endpoint"});
    try {
        let VerifyToken = JsonToken.verify(GetToken, ServerInfo.EncryptionToken);
        request.UserEmail = VerifyToken;
        next();
    } catch (error) {
        response.status(400).json({ message: "Invalid Token" });
    }
}

async function AdminOnly(request, response, next) {
    let GetAdminKey = request.header("admin-key");
    if (!GetAdminKey) return response.status(401).json({ message: "No permission to access this endpoint"});
    try {
        if (GetAdminKey === ServerInfo.AdminKey) next();
        else return response.status(401).json({message: "No permission to access this endpoint" });
    } catch (error) {
        response.status(400).json({ message: "No access to this endpoint"});
    }
}

//#endregion Functions

module.exports = Router;