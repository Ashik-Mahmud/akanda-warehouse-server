/* init nodejs api */
const express = require('express');
const cors = require('cors');
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



/* listen port */
app.listen(port, ()=>{
    console.log(`SERVER RUNNING ON PORT ${port}`);
})