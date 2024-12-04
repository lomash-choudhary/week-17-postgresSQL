import { Client } from "pg";
import * as dotenv from "dotenv"
dotenv.config()
const pgClient = new Client(process.env.POSTGRES_CONNECTION_STRING)

const pgClient2 = new Client({
    user: process.env.POSTGRES_USER,
    database: process.env.POSTGRES_DATABASE,
    password: process.env.DATABASE_PASSWORD,
    port: parseInt(process.env.PORT_NUMBER || "5432", 10),//this 10 ensures that the value is parsed in base 10 value 
    host: process.env.DATABSE_HOST,
    ssl: process.env.SSL_VALUE === "true"
})


const main = async () => {
    try{
        await pgClient2.connect()
        console.log("data base connected successfully")

        const showUsersTable = async () => {
            const result = await pgClient2.query("select * from user2")
            console.log(result.rows)
        }

        const createUsersTable = async () => {

            try{
                await pgClient2.query(`
                        create table users(
                            id SERIAL PRIMARY KEY,
                            username VARCHAR(50) UNIQUE NOT NULL,
                            password VARCHAR(20) NOT NULL,
                            email VARCHAR(100) UNIQUE NOT NULL,
                            createAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        );
                    `)

                console.log("table create successfully in the database")
            }
            catch(err){
                console.log("Error occured while creating the table in the database")
            }
        }

        createUsersTable()
        showUsersTable()
    }
    catch(err){
        console.log("error occured while connecting to the database");
    }
}

const subMain = async () => {
    try{
        await pgClient.connect()
        console.log("database connected successfully")
        try{
        await pgClient.query("update user2 set username = 'Lomash Choudhary' where id = 1")
        console.log("updation done successfully")
        }
        catch(err){
            console.log("error occured while updating the username");
        }
    }
    catch(err){
        console.log("Error occured while connecting to the data base");
    }
}
// subMain()
main()