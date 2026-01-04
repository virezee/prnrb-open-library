import { Injectable, type ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@type/auth/user.d.ts'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    override getAuthenticateOptions(context: ExecutionContext): { scope: ['profile', 'email'], state: string, prompt: string } {
        const req = context.switchToHttp().getRequest()
        const state = req.path.split('/').pop()
        return {
            scope: ['profile', 'email'],
            state,
            prompt: 'select_account'
        }
    }
    override handleRequest<T = User>(err: Error, user: T, _: never, context: ExecutionContext): T | undefined | never {
        const res = context.switchToHttp().getResponse()
        if (err) {
            return res.send(`
                <script>
                    window.opener.postMessage({ message: '${err.message}' }, 'http://${process.env['DOMAIN']}:${process.env['CLIENT_PORT']}')
                    window.close()
                </script>
            `)
        }
        return user
    }
}