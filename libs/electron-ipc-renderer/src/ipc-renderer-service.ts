import { IpcServiceError, MessageResponseCode } from 'electron-ipc-common'
import isElectron from 'is-electron'
import type { IpcRenderer } from 'electron'
import type { BaseService, IpcService, MessageResponse } from 'electron-ipc-common'

function getRenderer(): IpcRenderer | null {
  if (!isElectron()) {
    return null
  }
  return window.require('electron').ipcRenderer as IpcRenderer
}

export function useService<T extends BaseService<string>>(namespace: T['namespace']): IpcService<T> {
  return new Proxy(Object.create(null), {
    get(target, actionKey: string): any {
      return function (...args: any) {
        const ipcRenderer = getRenderer()
        if (!ipcRenderer) {
          throw new IpcServiceError('Out of electron env')
        }

        return new Promise((resolve, reject) => {
          const { port1, port2 } = new MessageChannel()
          port1.onmessage = (event: MessageEvent<MessageResponse>) => {
            const { code, message, data } = event.data
            if (code === MessageResponseCode.Success) {
              resolve(data)
            } else {
              reject(message)
            }
          }
          port1.postMessage([actionKey, args])
          ipcRenderer.postMessage(namespace, null, [port2])
        })
      }
    },
  })
}

export { BaseService, IpcService, MessageResponse, IpcServiceError, MessageResponseCode }
