/* init nodejs api */
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config();
// init 
const app = express();

const port = process.env.PORT || 5000;

/* middle wares */
app.use(cors());
app.use(express.json())

/* fake root api endpoint */
app.get("/", (req, res) =>{
    res.send({message: "Now Our Akanda Warehouse API working."})
})


/* run function for connect and do something with mongodb */

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@akanda-warehouse.hanwa.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){

    try{
     await client.connect();
     console.log("DB CONNECTED.");
     const reviewsCollection =  client.db("reviews-db").collection("reviews");
     const teamsCollection = client.db("teams-db").collection("teams")
     /* GET REVIEWS FROM MONGODB DATABASES */
     app.get("/reviews", async(req, res)=>{
         const query = {};
         const cursor = await reviewsCollection.find(query);
         const result = await cursor.toArray();
         res.send(result)
     });
     
     /* GET TEAMS FROM MONGODB DATABASES */
     app.get("/teams", async(req, res) => {
         const query = {};
         const cursor = await teamsCollection.find(query);
         const result = await cursor.toArray();
         res.send({success: true, data: result})
     })
     
     


    }catch(err){
        console.log(err.message);
    }


};
run().catch(console.dir)







/* listen port */
app.listen(port, ()=>{
    console.log(`SERVER RUNNING ON PORT ${port}`);
})