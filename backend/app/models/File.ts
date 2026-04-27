//FILES.TS

import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class File extends BaseModel {
  public static table = 'files'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number | null

  @column({ columnName: 'uploaded_by' })
  declare uploadedBy: number | null

  @column({ columnName: 'original_name' })
  declare originalName: string

  @column({ columnName: 'stored_name' })
  declare storedName: string

  @column({ columnName: 'file_path' })
  declare filePath: string

  @column({ columnName: 'mime_type' })
  declare mimeType: string

  @column({ columnName: 'file_size' })
  declare fileSize: number

  @column()
  declare category: string

  @column.dateTime({ columnName: 'uploaded_at' })
  declare uploadedAt: DateTime | null

  @column.dateTime({ autoCreate: true, columnName: 'created_at' })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, columnName: 'updated_at' })
  declare updatedAt: DateTime | null
}
