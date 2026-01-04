import { Injectable, type ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@type/auth/user.d.ts'

@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
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