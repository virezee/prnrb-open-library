import { Injectable } from '@nestjs/common'
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
        const state = req.query['state']
        console.log(state)
        if (state === 'register') {
            const exist = await this.prismaService.user.findFirst({ where: { googleId } })
            if (exist) return { message: 'Google account is already registered! Try logging in with Google!' }
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
            return user
        } if (state === 'login') {
            const user = await this.prismaService.user.findFirst({ where: { googleId } })
            if (!user) return { message: 'Google account is not registered! Try registering it with Google!' }
            return user
        } if (state === 'connect') {
            const rt = req.cookies['!']
            if (!rt) throw new Error(ERROR.UNAUTHENTICATED)
            const refreshKey = this.securityService.sanitizeRedisKey('refresh', rt)
            const session = await this.redisService.redis.HGETALL(refreshKey)
            if (!session) throw new Error(ERROR.UNAUTHENTICATED)
            const user = await this.prismaService.user.findUnique({ where: { id: session['id']! } })
            if (!user) throw new Error(ERROR.UNAUTHENTICATED)
            let data: Record<string, string | null> = {}
            if (!user.googleId) data['googleId'] = googleId
            else if (user.googleId !== googleId) return { message: 'The selected Google account does not match the one connected to your profile!' }
            else {
                if (!user.pass) return { message: 'Set a password before disconnecting your account from Google!' }
                data['googleId'] = null
            }
            const updated = await this.prismaService.user.update({
                where: { id: user.id },
                data
            })
            await this.retryService.retry(() => this.redisService.redis.json.SET(`user:${user.id}`, '$.google', !!updated.googleId), {})
            return updated
        }
    }
}