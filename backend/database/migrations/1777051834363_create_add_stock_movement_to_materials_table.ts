import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'materials'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('stock_in').notNullable().defaultTo(0)
      table.integer('stock_out').notNullable().defaultTo(0)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('stock_in')
      table.dropColumn('stock_out')
    })
  }
}
