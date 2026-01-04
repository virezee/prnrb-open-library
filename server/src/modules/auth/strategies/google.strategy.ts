import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy, type Profile } from 'passport-google-oauth20'
import { PrismaService } from '@infrastructure/database/prisma.service.js'
import { RedisService } from '@infrastructure/redis/services/redis.service.js'
import { RetryService } from '@common/workers/services/retry.service.js'
import { SecurityService } from '@shared/utils/services/security.service.js'
import { FormatterService } from '@shared/utils/services/formatter.service.js'
import { MiscService } from '@shared/utils/services/misc.service.js'
import ERROR from '@common/constants/error.constant.js'
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
        private readonly retryService: RetryService,
        private readonly securityService: SecurityService,
        private readonly formatterService: FormatterService,
        private readonly miscService: MiscService
    ) {
        super({
            clientID: process.env['GOOGLE_CLIENT_ID']!,
            clientSecret: process.env['GOOGLE_CLIENT_SECRET']!,
            callbackURL: `http://${process.env['DOMAIN']}:${process.env['PORT']}/auth/google/callback`,
            scope: ['profile', 'email'],
            passReqToCallback: true
        })
    }
    async validate(req: Req, _: never, __: never, profile: Profile): Promise<any> {
        const googleId = profile.id
        const name = [profile.name?.givenName, profile.name?.familyName].filter(Boolean).join(' ')
        const email = profile.emails![0]!.value
        const { action, identity: identityB64 } = JSON.parse(req.query['state'] as string)
        const identity = identityB64 ? JSON.parse(Buffer.from(identityB64, 'base64').toString()) : null
        if (action === 'register') {
            const exist = await this.prismaService.user.findFirst({ where: { googleId } })
            if (exist) throw new BadRequestException('Google account is already registered! Try logging in with Google!')
            const user = await this.prismaService.user.create({
                data: {
                    googleId,
                    photo: Buffer.from(this.miscService.generateAvatar(name), 'base64'),
                    name: this.formatterService.formatName(name),
                    username: await this.miscService.generateUniqueUsername(email.split('@')[0]!),
                    email,
                    pass: null,
                    verified: true
                }
            })
            ;(user as any).identity = identity
            return user
        } if (action === 'login') {
            const user = await this.prismaService.user.findFirst({ where: { googleId } })
            if (!user) throw new BadRequestException('Google account is not registered! Try registering it with Google!')
            ;(user as any).identity = identity
            return user
        } if (action === 'connect') {
            const rt = req.cookies['!']
            if (!rt) throw new UnauthorizedException(ERROR.UNAUTHENTICATED)
            const refreshKey = this.securityService.sanitizeRedisKey('refresh', rt)
            const session = await this.redisService.redis.HGETALL(refreshKey)
            if (!session) throw new UnauthorizedException(ERROR.UNAUTHENTICATED)
            const user = await this.prismaService.user.findUnique({ where: { id: session['id']! } })
            if (!user) throw new UnauthorizedException(ERROR.UNAUTHENTICATED)
            let data: Record<string, string | null> = {}
            if (!user.googleId) data['googleId'] = googleId
            else if (user.googleId !== googleId) throw new BadRequestException('The selected Google account does not match the one connected to your profile!')
            else {
                if (!user.pass) throw new BadRequestException('Set a password before disconnecting your account from Google!')
                data['googleId'] = null
            }
            const updated = await this.prismaService.user.update({
                where: { id: user.id },
                data
            })
            await this.retryService.retry(() => this.redisService.redis.json.SET(`user:${user.id}`, '$.google', !!updated.googleId), {})
            return updated
        }
        return
    }
}