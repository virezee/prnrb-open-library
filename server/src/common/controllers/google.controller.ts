import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { GoogleAuthGuard } from '@common/guards/google.guard.js'
import { GoogleCallbackGuard } from '@common/guards/google-callback.guard.js'
import { VerificationService } from '@modules/auth/services/verification.service.js'

@Controller('auth/google')
export class GoogleController {
    constructor(private readonly verificationService: VerificationService) {}
    @Get('register')
    @UseGuards(GoogleAuthGuard)
    _(): void {}
    @Get('login')
    @UseGuards(GoogleAuthGuard)
    __(): void {}
    @Get('connect')
    @UseGuards(GoogleAuthGuard)
    ___(): void {}
    @Get('callback')
    @UseGuards(GoogleCallbackGuard)
    async ____(@Req() req: Req, @Res() res: Res) {
        const user = req.user
        const identity = user.identity
        const { action } = JSON.parse(req.query['state'] as string)
        const id = user.id
        if (action === 'register' || action === 'login') await this.verificationService.generateToken(
            req,
            res,
            identity,
            id
        )
        // res.clearCookie('pkce')
        return res.send(`
            <script>
                window.opener.postMessage({ message: '' }, 'http://${process.env['DOMAIN']}:${process.env['CLIENT_PORT']}')
                window.close()
            </script>
        `)
    }
}