import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class ReportLog extends BaseModel {
  static table = 'report_logs'

  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'project_id' })
  declare projectId: number | null

  @column({ columnName: 'generated_by' })
  declare generatedBy: number | null

  @column({ columnName: 'report_type' })
  declare reportType: string

  @column({ columnName: 'report_name' })
  declare reportName: string

  @column.date({ columnName: 'filter_start_date' })
  declare filterStartDate: DateTime | null

  @column.date({ columnName: 'filter_end_date' })
  declare filterEndDate: DateTime | null

  @column({ columnName: 'generated_file_path' })
  declare generatedFilePath: string | null

  @column.dateTime({ columnName: 'generated_at' })
  declare generatedAt: DateTime | null

  @column.dateTime({ columnName: 'created_at', autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ columnName: 'updated_at', autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null
}
