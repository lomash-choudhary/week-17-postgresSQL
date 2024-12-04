import express, { query, type Request, type Response} from "express"
import * as dotenv from "dotenv"
import { Client } from "pg"
dotenv.config()
const app = express()
app.use(express.json());
const port = process.env.SERVER_PORT
const pgClient = new Client(process.env.POSTGRES_CONNECTION_STRING)

const tableCreation = async () => {
    const userTableQuery = `
        create table users(
            id SERIAL PRIMARY KEY,
            username VARCHAR(50) NOT NULL UNIQUE,
            password VARCHAR(20) NOT NULL,
            email VARCHAR(200) NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
    `
    const addressesTableQuery = `
        create table addresses(
            id SERIAL NOT NULL,
            user_id INTEGER NOT NULL,
            city VARCHAR(255) NOT NULL, 
            street VARCHAR(255) NOT NULL,
            pincode VARCHAR(255) NOT NULL,
            create_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `
    await pgClient.query(userTableQuery)
    await pgClient.query(addressesTableQuery)
}
// tableCreation()

//TRANSACTIONS
app.post("/signup", async (req:Request, res:Response) => {
    try{
        // await new Promise(x => setTimeout(x, 100* 1000))// this will await the js thread for resolving the promise and if the backend crashed then the partial entry has been made but the full data i.e. the address table is not sent.

        //so to overcome this we will need to use transactions

        const {username, email, password, city, street, pincode } = req.body;

        const insertQueryUsersTable = `INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id`
        const insertQueryAddressesTable = `INSERT INTO addresses(user_id, city, street, pincode) VALUES($1, $2, $3, $4)`

        await pgClient.query(`BEGIN;`)

        const userTableInsertionReponse = await pgClient.query(insertQueryUsersTable,[username,email,password])

        // await new Promise(x => setTimeout(x => x, 100*1000))// now if the backend during this time period then it will fail both the queries neither one will be executed

        const userId = userTableInsertionReponse.rows[0].id
        await pgClient.query(insertQueryAddressesTable,[userId,city, street,pincode])

        await pgClient.query("COMMIT;")

        res.status(200).send("Data inserted successfully in the database")
    }
    catch(err){
        await pgClient.query("ROLLBACK");
        res.status(400).send("error occured while adding the data in the database or the username and email already exists, ROLLBACKED")   
    }
})


app.get("/showMetaData/:id", async (req:Request, res:Response) => {
    try{
        const userId = req.params.id;

        const queryForSearchingInUsersTable = `SELECT username,email FROM users WHERE id = $1`
        const queryForSearchingInAddressesTable = `SELECT * FROM addresses WHERE user_id = $1`

        const usersReponse = await pgClient.query(queryForSearchingInUsersTable,[userId])

        const addressesResponse = await pgClient.query(queryForSearchingInAddressesTable,[userId])


        if(usersReponse.rows.length >0 && addressesResponse.rows.length >0){
            res.status(200).json({
                userResponse: usersReponse.rows,
                addressesResponse: addressesResponse.rows
            })
        }
        else{
            res.status(400).send("user with this id does not exists in the database");
        }
    }
    catch(err){
        console.log("error occured while fetching data from the database")
    }
})

//JOINS
app.get("/betterMetaData/:id", async (req:Request, res:Response) => {
    try{
        const userId = req.params.id;
        const joinQuery = `
            SELECT u.username, u.email, a.city, a.street, a.pincode
            FROM users u JOIN addresses a ON u.id = a.user_id WHERE u.id = $1
        `
        const response = await pgClient.query(joinQuery,[userId])
        res.status(200).json({
            response: response.rows
        })
    }
    catch(err){
        console.log(err)
        res.status(400).send("error occured while fetching data from the database")
    }
})

app.post("/getMetaDataUsingUsername", async (req:Request, res:Response) => {
    try{
        const username = req.body.username
        const usernameQuery = `SELECT id FROM users WHERE username = $1`
        const userData = await pgClient.query(usernameQuery,[username])
        const userId = userData.rows[0].id
        if(userId.rowCount === 0){
            res.status(200).send("user with this username does not exists in the database");
        }

        const joinQuery = `SELECT u.username, u.email, a.city, a.street, a.pincode FROM users u JOIN addresses a ON u.id = a.user_id WHERE u.id = $1`
        const response = await pgClient.query(joinQuery,[userId])
        res.status(200).json({
            reponse: response.rows
        })
    }
    catch(err){
        console.log(err)
        res.status(400).send("please enter a username to perform the search in the database")
    }
})

const main = async () => {
    try{
        await pgClient.connect()
        console.log("Connected to the dataBase successfullly")
        app.listen(port,() => {
            console.log("app is listening on port",port)
        })
    }
    catch(err){
        console.log("error occured while connecting to the database");
    }
}
main()