import { storage } from '@forge/api';
import pako from 'pako';
import { STORAGE_KEYS } from '../config';
import { initializeCache } from '../cache';

const VERSION_STORAGE_KEY = 'versions';

// Helper to compress data using pako
function compressData(data) {
    const jsonString = JSON.stringify(data);
    // Convert string to Uint8Array
    const uint8Array = new TextEncoder().encode(jsonString);
    // Compress the data
    const compressed = pako.deflate(uint8Array);
    // Convert to base64 for storage
    return btoa(String.fromCharCode.apply(null, compressed));
}

// Helper to decompress data using pako
function decompressData(compressedData) {
    // Convert from base64 to binary
    const binary = atob(compressedData);
    // Create Uint8Array from binary
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    // Decompress
    const decompressed = pako.inflate(bytes);
    // Convert back to string
    const jsonString = new TextDecoder().decode(decompressed);
    // Parse JSON
    return JSON.parse(jsonString);
}

// Helper to get all storage data except versions
async function getAllStorageData() {
    const data = {};
    
    for (const key of STORAGE_KEYS.filter(key => key !== VERSION_STORAGE_KEY)) {
        data[key] = await storage.get(key);
    }
    
    return data;
}

// Helper to restore all storage data
async function restoreAllStorageData(data) {
    // Delete all existing keys except versions
    for (const key of STORAGE_KEYS.filter(key => key !== VERSION_STORAGE_KEY)) {
        await storage.delete(key);
    }
    
    // Restore data
    for (const [key, value] of Object.entries(data)) {
        await storage.set(key, value);
    }
}

export async function getVersions() {
    const versions = await storage.get(VERSION_STORAGE_KEY) || [];
    return versions.map(version => ({
        key: version.key,
        description: version.description,
        createdDate: version.createdDate
    }));
}


export async function createVersion({payload}) {
    const { key, description } = payload;
    // Get all current data
    const data = await getAllStorageData();
    
    // Compress the data
    const compressedData = compressData(data);
    
    // Get existing versions
    const versions = await storage.get(VERSION_STORAGE_KEY) || [];
    
    // Create new version
    const newVersion = {
        key,
        description,
        createdDate: new Date().toISOString(),
        data: compressedData
    };
    console.log(payload)
    
    // Add to versions list
    versions.push(newVersion);
    
    // Save updated versions
    await storage.set(VERSION_STORAGE_KEY, versions);
    
    return newVersion;
}

export async function removeVersion({ payload }) {
    const { versionKey } = payload;
    const versions = await storage.get(VERSION_STORAGE_KEY) || [];
    const updatedVersions = versions.filter(v => v.key !== versionKey);
    await storage.set(VERSION_STORAGE_KEY, updatedVersions);
    return { success: true };
}

export async function restoreVersion({ payload }) {
    const { versionKey } = payload;
    const versions = await storage.get(VERSION_STORAGE_KEY) || [];
    const version = versions.find(v => v.key === versionKey);
    
    if (!version) {
        throw new Error('Version not found');
    }
    
    // Decompress the data
    const decompressedData = decompressData(version.data);
    
    // Restore all data
    await restoreAllStorageData(decompressedData);
    await initializeCache()
    
    return { success: true };
} 