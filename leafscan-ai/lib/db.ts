import { Session } from '@/types'

const DB_NAME = 'leafscan_db'
const DB_VERSION = 1
const STORE_NAME = 'sessions'

export const db = {
    async open(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION)

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    db.createObjectStore(STORE_NAME, { keyPath: 'id' })
                }
            }

            request.onsuccess = (event) => {
                resolve((event.target as IDBOpenDBRequest).result)
            }

            request.onerror = (event) => {
                reject((event.target as IDBOpenDBRequest).error)
            }
        })
    },

    async getAllSessions(): Promise<Session[]> {
        const dbInstance = await this.open()
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction(STORE_NAME, 'readonly')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.getAll()

            request.onsuccess = () => {
                resolve(request.result || [])
            }

            request.onerror = () => {
                reject(request.error)
            }
        })
    },

    async saveSession(session: Session): Promise<void> {
        const dbInstance = await this.open()
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.put(session)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    },

    async deleteSession(id: string): Promise<void> {
        const dbInstance = await this.open()
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.delete(id)

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    },

    async clear(): Promise<void> { // For debugging or full reset
        const dbInstance = await this.open()
        return new Promise((resolve, reject) => {
            const transaction = dbInstance.transaction(STORE_NAME, 'readwrite')
            const store = transaction.objectStore(STORE_NAME)
            const request = store.clear()

            request.onsuccess = () => resolve()
            request.onerror = () => reject(request.error)
        })
    }
}
