import { Catch, HttpException } from '@nestjs/common'
import type { ExceptionFilter, ArgumentsHost } from '@nestjs/common'
import type { GqlExceptionFilter } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

@Catch()
export class GraphqlFilter implements GqlExceptionFilter {
    catch(exception: { message?: string, code: string, errors?: Record<string, string> | string } | Error): never {
        if (typeof exception === 'object' && 'code' in exception) {
            const { message, code, errors } = exception
            if (errors) throw new GraphQLError(code, { extensions: { code, errors } })
            throw new GraphQLError(message ?? code, { extensions: { code } })
        }
        throw new GraphQLError(exception.message)
    }
}
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: HttpException, host: ArgumentsHost): Res {
        const ctx = host.switchToHttp()
        const res = ctx.getResponse<Res>()
        const status = exception.getStatus()
        return res.status(status).json(exception.getResponse())
    }
}