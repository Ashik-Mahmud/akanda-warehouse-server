/* init nodejs api */
var jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
     const reviewsCollection =  client.db("reviews-db").collection("reviews");
     const teamsCollection = client.db("teams-db").collection("teams")
     const productsCollection = client.db("products-db").collection('products');
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
     



     /* ADD PRODUCT INTO MONGODB SERVER */
     app.post("/add-product",VerifyToken, async(req,res) => {
         const data = req.body.data;
         const decodedId = req.decoded;
         const sendingUid = req.body.data.author.uid;
         if(decodedId.uid === sendingUid){
             const result = await productsCollection.insertOne(data);
             if(result.acknowledged){
                 res.send({success: true, message: "Product Added successfully done."})
             }
         }else{
             res.status(403).send({success: false, message: "Forbidden Request"})
         };
                     
     })

     /* GET ALL THE PRODUCTS FROM MONGODB */
     app.get("/products", async(req, res) => {
         const query = {};
         const cursor = await productsCollection.find(query);
         const result = await cursor.toArray();
         res.send({success: true, result: result})
     })

    /*  GET ALL THE PRODUCTS BASED ON CURRENT USER */
    app.get("/currentUser-product", VerifyToken, async(req, res)=>{
        const uid = req.decoded.uid;
        const userUid = req.query.uid;
                
        if(uid === userUid){

          const query = {"author.uid": userUid};
          const cursor = await productsCollection.find(query);
          const result = await cursor.toArray();
          res.send({success: true, result: result})


        }else{
            res.status(403).send({success: false, message: "Forbidden Request"})
        }
        
        
    })





     /* GET A USER INFO AND CREATE A ACCESS_TOKEN */
     app.post("/login", async(req, res) => {
         const info = req.body;
         var token = jwt.sign(info, process.env.ACCESS_TOKEN, {
             expiresIn: '1d'
         });
         if(token){
             res.send({token})
         };
     })


    }catch(err){
        console.log(err.message);
    }


};
run().catch(console.dir)


/* VERIFY TOKEN */
function VerifyToken(req, res, next){
    const authToken = req?.body?.authorization?.split(" ")[1] || req?.headers?.authorization?.split(" ")[1];
    if(!authToken){
        return res.status(401).send({success: false, message: "Unauthorized Users"})
    }
    jwt.verify(authToken, process.env.ACCESS_TOKEN, function(err, decoded) {
       if(err){
           return res.status(403).send({success: false, message: "Request Forbidden"})
       }
       req.decoded = decoded;
       next();
    });    
};




/* listen port */
app.listen(port, ()=>{
    console.log(`SERVER RUNNING ON PORT ${port}`);
})