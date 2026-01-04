import { Injectable, UnauthorizedException, type ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import type { User } from '@type/auth/user.d.ts'

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
    override handleRequest<T = User>(err: Error, user: T, _: never, __: ExecutionContext): T | undefined | never {
        if (err) console.log('[Err]: ', err)
        if (!user) throw new UnauthorizedException()
        return user
    }
}