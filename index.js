const express = require('express')
const mongoose = require('mongoose')
const {
    MONGO_USER,
    MONGO_PASSWORD,
    MONGO_IP,
    MONGO_PORT,
    REDIS_URL,
    REDIS_PORT,
    SESSION_SECRET
} = require("./config/cf");
const cors = require('cors');
const redis = require('redis')
const session = require('express-session')


let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient({
    host: REDIS_URL,
    port: REDIS_PORT
})


const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const app = express()
const port = process.env.PORT || 3000;

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;
const connectWithRetry = () => {
    mongoose
        .connect(mongoURL)
        .then(() => console.log("successfully connected to DB"))
        .catch((e) => {
            console.log(e)
            setTimeout(connectWithRetry, 5000)
        })
}
connectWithRetry()

app.enable("trust proxy")
app.use(cors({}))
app.use(
    session({
        store: new RedisStore({client: redisClient}),
        secret: SESSION_SECRET,
        saveUninitialized: false,
        resave: false,
        cookie: {
            maxAge: 60000,
            httpOnly: true
        }
    })
)

app.use(express.json())

app.get('/api/v1', (req, res) => {
    res.send("<h2>Hi there!!!</h2>")
})
app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)


app.listen(port, () => console.log("listening on port: ", port))



