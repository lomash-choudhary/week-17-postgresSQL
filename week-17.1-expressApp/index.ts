import * as dotenv from "dotenv"
dotenv.config()
import express, { type Request, type Response } from "express";
import { Client } from "pg";
const app = express()
app.use(express.json())
const pgClient = new Client(process.env.POSTGRES_CONNECTION_STRING)
const port = parseInt(process.env.SERVER_PORT!,10)


app.get("/seeUsersTable", async (req:Request, res:Response) => {
    try{
        const result = await pgClient.query(`select * from user2`);
        res.send(result.rows);
    }
    catch(err){
        console.log(err);
        res.status(400).send("Error occured while getting data of the users from the database");
    }
})

app.post("/addData", async (req:Request, res:Response) => {
    try{
        const {username, email, password} = req.body
        try{
            await pgClient.query(`insert into user2 (username, email, password) values($1, $2, $3)`,[username, email, password])
            res.status(200).send("data addedd successfully to the database")
        }
        catch(err){
            console.log(err)
            res.status(400).send("error occured while entering the data in the database username and email should be unique")
        }        
    }
    catch(err){
        res.status(400).send("please enter the fileds to enter the data in the database")
    }
})
//fetch data from the database given email as an input
app.post("/getData", async (req:Request, res:Response) => {
    try{
        try{
            const email = req.body.email
            // console.log(email)
            const query = `select * from user2 where email = $1`
            const result = await pgClient.query(query,[email])
            // console.log(result.rowCount)
            if(result.rows.length === 0){
                res.status(200).send("User with this email doesn't exists in the database");
                return;
            }
            res.status(200).send(result.rows)
        }
        catch(err){
            console.log("Email is needed to find the user data")
        }
    }   
    catch(err){
        console.log(err)
        res.status(400).send("error occured while fetching the data of the user")
    }
})


const main = async () => {
    try{
        await pgClient.connect()
        console.log("Connected to the postgres database successfully");
    }
    catch(err){
        console.log("error occured while connecting to the database");
    }
    app.listen(port,() => {
        console.log(`app is listening on port ${port}`)
    })
}
main()