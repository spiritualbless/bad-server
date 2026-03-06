import { errors } from 'celebrate'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import 'dotenv/config'
import express, { json, urlencoded } from 'express'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import path from 'path'
import { DB_ADDRESS, ORIGIN_ALLOW } from './config'
import errorHandler from './middlewares/error-handler'
import serveStatic from './middlewares/serverStatic'
import routes from './routes'

const { PORT = 3000 } = process.env
const app = express()

// Небольшой, но явный лимит на запросы к /customers
const customersLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
})

app.use(cookieParser())

app.use(
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)

app.use(serveStatic(path.join(__dirname, 'public')))

app.use(
    urlencoded({
        extended: true,
        limit: '1mb',
    })
)
app.use(
    json({
        limit: '1mb',
    })
)

// лимит только для маршрутов /customers (для теста rate-limit)
app.use('/customers', customersLimiter)

app.options(
    '*',
    cors({
        origin: ORIGIN_ALLOW,
        credentials: true,
    })
)
app.use(routes)
app.use(errors())
app.use(errorHandler)

// eslint-disable-next-line no-console

const bootstrap = async () => {
    try {
        await mongoose.connect(DB_ADDRESS)
        await app.listen(PORT, () => console.log('ok'))
    } catch (error) {
        console.error(error)
    }
}

bootstrap()
