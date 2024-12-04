import {type ICache } from "@auth0/auth0-vue";

export class LocalStorageCache implements ICache {
    allKeys(): Promise<string[]> {
        return Promise.resolve(Object.keys(localStorage));
    }

    async get<T>(key: string): Promise<undefined | T> {
        const item = localStorage.getItem(key);
        if (!item) return undefined;

        try {
            return JSON.parse(item) as T;
        } catch (error) {
            console.error(`Error parsing data from localStorage for key "${key}":`, error);
            return undefined;
        }
    }

    async set<T>(key: string, entry: T): Promise<void> {
        try {
            const value = JSON.stringify(entry);
            localStorage.setItem(key, value);
        } catch (error) {
            console.error(`Error saving data to localStorage for key "${key}":`, error);
        }
    }

    async remove(key: string): Promise<void> {
        localStorage.removeItem(key);
    }
}

export const cache = new LocalStorageCache()
