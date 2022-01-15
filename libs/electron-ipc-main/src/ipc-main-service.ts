import { ipcMain } from 'electron'
import type { BaseService, IpcService, MessageResponse } from 'electron-ipc-common'
import { IpcServiceError, MessageResponseCode } from 'electron-ipc-common'

const namespaceSet = new Set()

export function registerService<T extends BaseService<string>>(
  namespace: T['namespace'],
  service: IpcService<T>,
) {
  const hasNamespace = namespaceSet.has(namespace)
  if (hasNamespace) {
    throw new IpcServiceError(`The namespace ${namespace} already exists!`)
  }

  if (!ipcMain) {
    throw new IpcServiceError('Out of electron env.')
  }

  ipcMain.on(namespace, (event) => {
    const [replyPort] = event.ports

    let isSettled = false
    const settle = (message: MessageResponse) => {
      if (isSettled) {
        return
      }
      isSettled = true
      replyPort.postMessage(message)
    }

    replyPort.on('message', (event) => {
      const [actionKey, args] = event.data

      service[actionKey as keyof IpcService<T>](...args)
        .then((data) => {
          settle({
            code: MessageResponseCode.Success,
            data,
          })
        })
        .catch((error) => {
          settle({
            code: MessageResponseCode.CommonError,
            message: `action [${namespace}.${actionKey}] error: ${error}`,
          })
        })
        .finally(() => {
          replyPort.close()
        })
    })

    replyPort.start()
  })

  namespaceSet.add(namespace)
}

export { BaseService, IpcService, MessageResponse, IpcServiceError, MessageResponseCode }
