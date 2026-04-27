import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const user = (request as any).user

    if (!user) {
      return response.unauthorized({
        message: 'Akses tidak sah. Silakan login terlebih dahulu.',
      })
    }

    if (user.role !== 'admin') {
      return response.forbidden({
        message: 'Akses ditolak. Fitur ini hanya bisa diakses oleh Admin.',
      })
    }

    return await next()
  }
}
