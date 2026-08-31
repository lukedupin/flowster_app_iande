import * as Util from '../../src/helpers/util.js'

export const post = (url, js, succ, err, headers = {}) => {
    Util.fetch_js(url, js, succ, err, headers)
}

export const get = (url, js, succ, err, headers = {}) => {
    const params = js ? new URLSearchParams(js).toString() : ''
    const full_url = params ? `${url}${url.includes('?') ? '&' : '?'}${params}` : url
    Util.fetch_js(full_url, null, succ, err, headers)
}
