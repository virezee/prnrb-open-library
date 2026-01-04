import './global.js'
import { NestFactory } from '@nestjs/core'
import cp from 'cookie-parser'
import { AppModule } from './app.module.js'
import { GraphqlFilter, HttpExceptionFilter } from '@common/filters/exception.filter.js'

(async () => {
    const app = await NestFactory.create(AppModule)
    app.enableCors({ origin: `http://${process.env['DOMAIN']}:${process.env['CLIENT_PORT']}`, credentials: true })
    app.use(cp())
    app.useGlobalFilters(
        app.get(GraphqlFilter),
        app.get(HttpExceptionFilter)
    )
    await app.listen(process.env['PORT']!)
})()