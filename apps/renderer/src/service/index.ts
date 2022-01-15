import { useService } from 'electron-ipc-renderer'
import type { DBService, AppService } from 'app-api'

const dbService = useService<DBService>('DBService')
const appService = useService<AppService>('AppService')

export { dbService, appService }
