import { getPrismaClient } from '@/util/prisma'
import type { DBService } from 'app-api'
import type { IpcService } from 'electron-ipc-main'
import type { PrismaClient } from '@prisma/client'

export interface DBClientService<T> {
  getClient(): Promise<T | undefined>
}

export class PrismaClientImpl implements DBClientService<PrismaClient> {
  private dbService: IpcService<DBService>
  private client?: PrismaClient
  constructor(dbService: IpcService<DBService>) {
    this.dbService = dbService
  }

  async getClient() {
    if (this.client) {
      return this.client
    }

    const dbConfig = await this.dbService.get()
    if (dbConfig) {
      const { url, user, password } = dbConfig
      return (this.client = getPrismaClient(url, user, password))
    }

    return
  }
}
