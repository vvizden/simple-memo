import { PrismaClient } from '@prisma/client'

const isValidMySQLURL = (str: string = '') => {
  if (str.includes('://')) {
    return false
  }

  try {
    const url = new URL('http://' + str)

    if (!url.hostname) {
      return false
    }

    if (!url.port) {
      return false
    }

    if (url.username) {
      return false
    }

    if (url.password) {
      return false
    }

    return true
  } catch {
    return false
  }
}

export function getPrismaClient(url: string, user: string, password: string) {
  if (!url || !user || !password) {
    throw new Error('Missing parameters')
  }

  if (!isValidMySQLURL(url)) {
    throw new Error('Invalid URL')
  }

  const connectionURL = `mysql://${user}:${password}@${url}`
  return new PrismaClient({
    datasources: {
      db: {
        url: connectionURL,
      },
    },
  })
}
