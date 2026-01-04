import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { GoogleAuthGuard } from '@common/guards/google.guard.js'
// import { VerificationService } from '@modules/auth/services/verification.service.js'

@Controller('auth/google')
export class GoogleController {
    constructor(private readonly _____: VerificationService) { }
    @Get('register')
    @UseGuards(GoogleAuthGuard)
    _(): void { }
    @Get('login')
    @UseGuards(GoogleAuthGuard)
    __(): void { }
    @Get('connect')
    @UseGuards(GoogleAuthGuard)
    ___(): void { }
    @Get('callback')
    @UseGuards(GoogleAuthGuard)
    async ____(@Req() req: Req, @Res() res: Res) {
        return res.send(`
            <script>
                window.opener.postMessage({ message: '' }, 'http://${process.env['DOMAIN']}:${process.env['CLIENT_PORT']}')
                window.close()
            </script>
        `)
    }
}