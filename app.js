require("dotenv").config();

const express = require("express");
const path = require("path");
const bodyparser = require('body-parser')
const cors = require("cors");
const audit = require('express-requests-logger')
const bunyan = require('bunyan');
let log = bunyan.createLogger({name: "app"});

const api = require("./src/routes/api");
const auth = require('./src/routes/auth');

const mongoose = require('mongoose');
const PORT = process.env.PORT || 5000;
const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "./src/views"));

if(process.env.PROD === "TRUE"){
    app.use(
        cors({
            origin: [process.env.BASE_URL],
            methods: ["GET", "POST", "PATCH"]
        })
    )
}

// app.use(audit({
//     logger: log,
//     request:{
//         excludeHeaders: ['authorization'],
//         maxBodyLength: 50
//     },
//     response:{
//         excludeHeaders: ['*'],
//         maxBodyLength: 50
//     }
// }))

app.use(cors());
app.use(bodyparser());
app.use('/api', api);
app.use('/auth', auth);
app.use((req,res,next)=>{
    return res.status(404).send('Not found');
})

require("./src/config/steam")(app);


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(() => console.log('Connected to MongoDB'))

app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));