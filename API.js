const ServerInfo = require("./ServerInfo.json");
const Express = require("express");
const MongoDB = require("mongoose");

let Express_Server = Express();

/* Create Express Server */
Express_Server.listen(ServerInfo.ServerPort, () => console.log("API Started on: " + ServerInfo.ServerPort));
Express_Server.use(Express.json());

/* Connect to Mongo Database */
MongoDB.connect(ServerInfo.ServerDatabaseUrl, { useNewUrlParser: true, useUnifiedTopology: true });
let Database = MongoDB.connection;
Database.on("error", (error) => console.log(error));
Database.on("open", () => console.log("Connected to: " + ServerInfo.ServerDatabaseUrl));

/* Create EndPoint */
const APIEndpoint = require("./APIStructure/Endpoints");
Express_Server.use("/api", APIEndpoint);