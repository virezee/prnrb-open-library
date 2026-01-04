import { Injectable, type ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@type/auth/user.d.ts'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    override getAuthenticateOptions(context: ExecutionContext): { scope: ['profile', 'email'], state: string, prompt: string, codeChallenge: string, codeChallengeMethod: 'S256' } {
        const http = context.switchToHttp()
        const req = http.getRequest()
        const res = http.getResponse()
        const action = req.path.split('/').pop()
        const identity = req.query.identity ?? null
        const codeVerifier = nodeCrypto.randomBytes(32).toString('base64url')
        const codeChallenge = nodeCrypto.createHash('sha256').update(codeVerifier).digest('base64url')
        res.cookie('pkce', codeVerifier, {
            path: '/auth/google',
            maxAge: 5 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            priority: 'high'
        })
        const state = JSON.stringify({ action, identity })
        return {
            scope: ['profile', 'email'],
            state,
            prompt: 'select_account',
            codeChallenge,
            codeChallengeMethod: 'S256'
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