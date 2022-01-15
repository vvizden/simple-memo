import { IpcServiceError } from 'electron-ipc-main'
import store from '@/store/index'
import { getPrismaClient } from '@/util/prisma'
import type { DBService, DBConfigVO } from 'app-api'
import type { IpcService } from 'electron-ipc-main'

const MYSQL_STORE_KEY = 'mysql-store-key'

let dbConfigVO: DBConfigVO | undefined
let singleInstance: DBServiceImpl

export class DBServiceImpl implements IpcService<DBService> {
  constructor() {
    return (singleInstance = singleInstance ? singleInstance : this)
  }
  async save(url: string, user: string, password: string) {
    if (!url || !user || !password) {
      throw new IpcServiceError('Missing parameters')
    }
    if (store.has(MYSQL_STORE_KEY)) {
      return true
    }

    const config = {
      url,
      user,
      password,
    }
    store.set(MYSQL_STORE_KEY, config)
    dbConfigVO = config
    return true
  }
  async get() {
    return dbConfigVO ?? (store.get(MYSQL_STORE_KEY) as DBConfigVO | undefined)
  }
  async testConnection(url: string, user: string, password: string) {
    if (!url || !user || !password) {
      throw new IpcServiceError('Missing parameters')
    }

    const client = getPrismaClient(url, user, password)

    try {
      await client.$connect()
    } catch (error) {
      return false
    } finally {
      await client.$disconnect()
    }

    return true
  }
}
