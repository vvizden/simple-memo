import type { BaseService } from 'electron-ipc-common'

export interface DBConfigVO {
  url: string
  user: string
  password: string
}

export interface DBService extends BaseService<'DBService'> {
  save(url: string, user: string, password: string): boolean
  get(): DBConfigVO | undefined
  testConnection(url: string, user: string, password: string): boolean
}
