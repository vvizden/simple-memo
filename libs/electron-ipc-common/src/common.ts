import type { FunctionKeys } from 'utility-types'

export type ParametersOrNever<T> = T extends (...args: any) => any ? Parameters<T> : never
export type ReturnTypeOrNever<T> = T extends (...args: any) => any ? ReturnType<T> : never

export interface BaseService<N extends string> {
  namespace: N
}

export class IpcServiceError extends Error {}

export enum MessageResponseCode {
  Success,
  CommonError,
}

export interface MessageResponse {
  code: MessageResponseCode
  message?: string
  data?: any
}

export type IpcService<T extends object> = {
  [P in FunctionKeys<T>]: (...args: ParametersOrNever<T[P]>) => Promise<ReturnTypeOrNever<T[P]>>
}
