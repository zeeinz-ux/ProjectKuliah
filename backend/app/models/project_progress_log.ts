import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Project from '#models/project'

export default class ProjectProgressLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number

  @column()
  declare author: string

  @column()
  declare note: string

  @column()
  declare image: string | null

  @belongsTo(() => Project)
  declare project: BelongsTo<typeof Project>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
