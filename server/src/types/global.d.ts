import type { Request, Response } from 'express'
import type crypto from 'crypto'
import type { User as U } from './auth/user.d.ts'

declare global {
    type Req = Request & {
        user: User
        message?: string
    }
    type Res = Response
    type ReqRes = { req: Req, res: Res }
    var nodeCrypto: typeof crypto
    var dirname: string
}
export {}