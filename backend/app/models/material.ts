import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import ProjectMaterial from '#models/project_material'

export default class Material extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare category: string

  @column()
  declare sku: string

  @column()
  declare stock: number

  @column()
  declare unit: string

  @column()
  declare price: number

  @column({ columnName: 'stock_in' })
  declare stockIn: number

  @column({ columnName: 'stock_out' })
  declare stockOut: number

  // Relasi: 1 material bisa dipakai di banyak project
  @hasMany(() => ProjectMaterial)
  declare projectMaterials: HasMany<typeof ProjectMaterial>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
