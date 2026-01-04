import { Injectable, type ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@type/auth/user.js'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    override getAuthenticateOptions(context: ExecutionContext): { scope: string[], state: string, prompt: string } {
        const req = context.switchToHttp().getRequest()
        const state = req.path.split('/').pop()
        return {
            scope: ['profile', 'email'],
            state,
            prompt: 'select_account'
        }
    }
    override handleRequest<T extends object = User | { message: string }>(err: Error, result: T, context: ExecutionContext): T | null | never {
        const http = context.switchToHttp()
        const req = http.getRequest()
        const res = http.getResponse()
        if (err) {
            res.send(`
                <script>
                    window.opener.postMessage({ message: '${err}' }, 'http://${process.env['DOMAIN']}:${process.env['CLIENT_PORT']}')
                    window.close()
                </script>
            `)
            return null
        }
        if ('message' in result) {
            req.message = result.message
            return null
        }
        return result
    }
}