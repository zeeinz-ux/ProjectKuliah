import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import User from '#models/user'

export default class SeedAdmin extends BaseCommand {
  public static commandName = 'seed:admin'
  public static description = 'Create or update default admin user'

  public static options: CommandOptions = {
    startApp: true,
  }

  public async run() {
    const fullName = 'Admin'
    const email = 'admin@example.com'
    const password = 'admin12345'

    const admin = await User.updateOrCreate(
      { email },
      {
        fullName,
        email,
        password,
        role: 'admin',
        departemen: 'Super User',
        isActive: true,
      }
    )

    this.logger.success(
      `Admin siap digunakan.\nID: ${admin.id}\nEmail: ${email}\nPassword: ${password}`
    )
  }
}
