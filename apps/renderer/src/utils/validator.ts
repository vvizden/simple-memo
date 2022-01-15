export const isValidMySQLURL = (str: string = '') => {
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
