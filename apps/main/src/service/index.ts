import { registerService as register } from 'electron-ipc-main'
import { DBServiceImpl } from './db-service'
import { PrismaClientImpl } from './db-client-service'
import { AppServiceImpl } from './app-service'
import type { AppService, DBService } from 'app-api'

let registered = false

export async function registerService() {
  if (registered) {
    return
  }

  const dbService = new DBServiceImpl()
  const prismaService = new PrismaClientImpl(dbService)

  register<DBService>('DBService', dbService)
  register<AppService>('AppService', new AppServiceImpl(prismaService))

  return {
    prismaService,
  }
}
