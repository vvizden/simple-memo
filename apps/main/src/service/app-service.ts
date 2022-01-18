import type { AppService, AppVOParams, AppVO, AppItemVO } from 'app-api'
import type { IpcService } from 'electron-ipc-main'
import type { DBClientService } from './db-client-service'
import type { PrismaClient } from '@prisma/client'

export class AppServiceImpl implements IpcService<AppService> {
  private dbClientService: DBClientService<PrismaClient>
  constructor(dbClientService: DBClientService<PrismaClient>) {
    this.dbClientService = dbClientService
  }

  async getOne(id: bigint) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return null
    }

    const app = await client.memo_app.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    })

    return app
  }

  async list(params?: AppVOParams) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return []
    }

    const apps = await client.memo_app.findMany({
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

  async add(vo: Omit<AppVO, 'id'> & { items?: Omit<AppItemVO, 'id' | 'app_id'>[] }) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return false
    }

    const app = await client.memo_app.create({
      include: {
        items: true,
      },
      data: {
        name: vo.name,
        items: {
          create: vo.items,
        },
      },
    })

    return app
  }

  async update(
    vo: AppVO & {
      itemsRemove?: bigint[]
      itemsUpdate?: Omit<AppItemVO, 'app_id'>[]
      itemsAdd?: Omit<AppItemVO, 'id' | 'app_id'>[]
    },
  ) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return false
    }

    const transactions = []

    if (vo.itemsRemove?.length) {
      const removeItems = vo.itemsRemove.map((id) => {
        return client.memo_app_item.deleteMany({
          where: {
            app_id: vo.id,
            id,
          },
        })
      })
      transactions.push(...removeItems)
    }

    if (vo.itemsUpdate?.length) {
      const updateItems = vo.itemsUpdate.map(({ id, title, value }) => {
        return client.memo_app_item.updateMany({
          where: {
            app_id: vo.id,
            id,
          },
          data: {
            title,
            value,
          },
        })
      })
      transactions.push(...updateItems)
    }

    if (vo.itemsAdd?.length) {
      const addItems = vo.itemsAdd.map(({ title, value }) => {
        return client.memo_app_item.create({
          data: {
            app_id: vo.id,
            title,
            value,
          },
        })
      })
      transactions.push(...addItems)
    }

    transactions.push(
      client.memo_app.update({
        where: {
          id: vo.id,
        },
        data: {
          name: vo.name,
        },
      }),
    )

    try {
      await client.$transaction(transactions)
      return true
    } catch (error) {
      return false
    }
  }

  async remove(id: bigint) {
    const client = await this.dbClientService.getClient()
    if (!client) {
      return false
    }

    try {
      await client.$transaction([
        client.memo_app_item.deleteMany({
          where: {
            app_id: id,
          },
        }),
        client.memo_app.delete({
          where: {
            id,
          },
        }),
      ])
      return true
    } catch (error) {
      return false
    }
  }
}
