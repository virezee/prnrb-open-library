import './global.js'
import { NestFactory } from '@nestjs/core'
import session from 'express-session'
import { RedisStore } from 'connect-redis'
import cp from 'cookie-parser'
import { AppModule } from './app.module.js'
import { RedisService } from '@infrastructure/redis/services/redis.service.js'
import { GraphqlFilter, HttpExceptionFilter } from '@common/filters/exception.filter.js'

(async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors({ origin: `http://${process.env['DOMAIN']}:${process.env['CLIENT_PORT']}`, credentials: true })
    app.use(cp())
    await app.init()
    const redisService = app.get(RedisService)
    app.use(
        session({
            name: 'pkce',
            store: new RedisStore({
                client: redisService.redis,
                prefix: 'google-oauth20:',
                ttl: 5 * 60
            }),
            secret: process.env['SESSION_SECRET']!,
            resave: false,
            saveUninitialized: false,
            cookie: {
                path: '/auth/google',
                maxAge: 5 * 60 * 1000,
                httpOnly: true,
                secure: true,
                sameSite: 'lax',
                priority: 'high'
            }
        })
    )
    app.useGlobalFilters(
        app.get(GraphqlFilter),
        app.get(HttpExceptionFilter)
    )
    await app.listen(process.env['PORT']!)
})()