import type { AppService, AppVOParams } from 'app-api'
import type { IpcService } from 'electron-ipc-main'
import type { DBClientService } from './db-client-service'
import type { PrismaClient } from '@prisma/client'

export class AppServiceImpl implements IpcService<AppService> {
  private dbClientService: DBClientService<PrismaClient>
  constructor(dbClientService: DBClientService<PrismaClient>) {
    this.dbClientService = dbClientService
  }

  async list(params?: AppVOParams) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return []
    }

    const apps = client.memo_app.findMany({
      where: {
        name: {
          contains: params?.name,
        },
      },
    })
    return apps
  }

  async listWithItems(params?: AppVOParams) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return []
    }

    const apps = await client.memo_app.findMany({
      include: {
        items: true,
      },
      where: {
        name: {
          contains: params?.name,
        },
      },
    })
    return apps
  }
}
