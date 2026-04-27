import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: number
  email: string
  full_name?: string
  role: 'admin' | 'project_manager' | 'finance'
  iat?: number
  exp?: number
}

export default class OptionalAuthMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    const authHeader = request.header('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        const decoded = jwt.verify(token, env.get('JWT_SECRET')) as JwtPayload

        ;(request as any).user = decoded
      } catch (error) {
        // Optional auth: token invalid tidak memblokir request
      }
    }

    return await next()
  }
}
