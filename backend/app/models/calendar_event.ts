import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class CalendarEvent extends BaseModel {
  static table = 'calendar_events'

  @column({ isPrimary: true })
  declare id: number

  @column.date()
  declare eventDate: DateTime

  @column()
  declare title: string

  @column()
  declare startTime: string

  @column()
  declare endTime: string

  @column()
  declare colorKey: string

  @column()
  declare description: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
