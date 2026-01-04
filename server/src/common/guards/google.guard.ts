import { Injectable, type ExecutionContext } from '@nestjs/common'
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
    override handleRequest<T extends object = User | { message: string }>(err: Error, result: T, _: never, context: ExecutionContext): T | undefined | never {
        const http = context.switchToHttp()
        const req = http.getRequest()
        if (err) throw err
        if ('message' in result) {
            req.message = result.message
            return
        }
        return result
    }
}