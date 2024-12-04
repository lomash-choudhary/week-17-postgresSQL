"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const pgClient = new pg_1.Client(process.env.POSTGRES_CONNECTION_STRING);
const pgClient2 = new pg_1.Client({
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.PORT_NUMBER || "5432", 10), //this 10 ensures that the value is parsed in base 10 value 
    host: process.env.DATABSE_HOST,
    ssl: process.env.SSL_VALUE === "true"
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pgClient2.connect();
        console.log("data base connected successfully");
        const showUsersTable = () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield pgClient2.query("select * from user2");
            console.log(result.rows);
        });
        const createUsersTable = () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield pgClient2.query(`
                        create table users(
                            id SERIAL PRIMARY KEY,
                            username VARCHAR(50) UNIQUE NOT NULL,
                            password VARCHAR(20) NOT NULL,
                            email VARCHAR(100) UNIQUE NOT NULL,
                            createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    `);
                console.log("table create successfully in the database");
            }
            catch (err) {
                console.log("Error occured while creating the table in the database");
            }
        });
        createUsersTable();
        showUsersTable();
    }
    catch (err) {
        console.log("error occured while connecting to the database");
    }
});
const subMain = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield pgClient.connect();
        console.log("database connected successfully");
        try {
            yield pgClient.query("update user2 set username = 'Lomash Choudhary' where id = 1");
            console.log("updation done successfully");
        }
        catch (err) {
            console.log("error occured while updating the username");
        }
    }
    catch (err) {
        console.log("Error occured while connecting to the data base");
    }
});
// subMain()
main();
