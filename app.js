require("dotenv").config();

const express = require("express");
const path = require("path");
const cors = require("cors");

const api = require("./src/routes/api");
const auth = require('./src/routes/auth');
const discord = require('./src/routes/discord');
const {checkAllUsers} = require('./src/utils/status');

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

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.use('/api', api);
app.use('/auth', auth);
app.use('/discord', discord)
app.use((req,res,next)=>{
    return res.status(404).send('Not found');
})

require("./src/config/steam")(app);


mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
.then(() => {
    console.log('Connected to MongoDB')
    setInterval(()=>{
        checkAllUsers();
    },parseInt(process.env.CHECK_INTERVAL_MINS) * 60000)
})

app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on port ${PORT}`));