import { Injectable, type ExecutionContext } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
    override getAuthenticateOptions(context: ExecutionContext): { scope: ['profile', 'email'], state: string, prompt: string } {
        const req = context.switchToHttp().getRequest()
        const action = req.path.split('/').pop()
        const identity = req.query.identity ?? null
        const state = JSON.stringify({ action, identity })
        return {
            scope: ['profile', 'email'],
            state,
            prompt: 'select_account'
        }
    }
}