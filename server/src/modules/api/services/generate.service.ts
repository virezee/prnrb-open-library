import { Injectable } from '@nestjs/common'
import { PrismaService } from '@infrastructure/database/prisma.service.js'
import { RedisService } from '@infrastructure/redis/services/redis.service.js'
import { SecurityService } from '@shared/utils/services/security.service.js'
import type { User } from '@type/auth/user.d.ts'

@Injectable()
export class GenerateService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly redisService: RedisService,
        private readonly securityService: SecurityService
    ) {}
    async generate(user: User): Promise<string> {
        const key = this.securityService.sanitizeRedisKey('user', user.id)
        let apiKey: string
        let exists: boolean
        do {
            const randomString = nodeCrypto.randomBytes(64).toString('hex')
            apiKey = nodeCrypto.createHash('sha3-512').update(randomString).digest('hex')
            exists = !!(await this.prismaService.user.findFirst({
                where: { api_key: Buffer.from(apiKey, 'hex') },
                select: { id: true }
            }))
        } while (exists)
        await this.prismaService.user.update({
            where: { id: user.id },
            data: {
                api_key: Buffer.from(apiKey, 'hex'),
                updated: new Date()
            }
        })
        await this.redisService.redis.json.SET(key, '$.api_key', apiKey)
        return apiKey
    }
}