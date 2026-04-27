import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ActivityLog extends BaseModel {
  static table = 'activity_logs'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number | null

  @column()
  declare module: string

  @column()
  declare action: string

  @column()
  declare title: string

  @column()
  declare description: string | null

  @column()
  declare icon: string

  @column()
  declare color: string

  @column()
  declare isRead: boolean

  @column()
  declare metadata: Record<string, any> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
