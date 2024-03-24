'use strict'
const redis = require('redis');

let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    RECONNECTING: 'reconnecting',
    END: 'end',
    ERROR: 'error',
}
const handleEventConnection = ({ connectionRedis }) => {
    connectionRedis.on(statusConnectRedis.CONNECT, () => {
        console.log('Redis connected')
    })
    connectionRedis.on(statusConnectRedis.RECONNECTING, () => {
        console.log('Redis reconnecting')
    })
    connectionRedis.on(statusConnectRedis.END, () => {
        console.log('Redis end')
    })
    connectionRedis.on(statusConnectRedis.ERROR, (err) => {
        console.log('Redis error', err)
    })

}
const initRedis = () => {
    const instanceRedis = redis.createClient()
    client.instanceConnect = instanceRedis

    handleEventConnection({
        connectionRedis: instanceRedis
    })
}
const getRedis = () => client
const closeRedis = () => { }

module.exports = {
    initRedis,
    getRedis,
    closeRedis,
}