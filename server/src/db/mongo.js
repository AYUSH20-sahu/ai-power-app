import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI || 'mongodb+srv://amankumargopi20_db_user:nLXICIH4SB0zIBej@cluster0.szg2n4r.mongodb.net/ai-power-app?retryWrites=true&w=majority';
const dbName = process.env.MONGODB_DB || 'ai-power-app';

let client;
let db;
let fallbackMode = false;
const memoryStore = {
    users: [],
    projects: [],
};

const buildMatcher = (query = {}) => {
    const entries = Object.entries(query || {});

    return (doc) => {
        for (const [field, expected] of entries) {
            if (field === '$or') {
                if (!Array.isArray(expected)) return false;
                return expected.some((condition) => buildMatcher(condition)(doc));
            }
            if (expected === undefined) continue;
            if (doc[field] !== expected) return false;
        }
        return true;
    };
};

const createMemoryCollection = (name) => {
    const ensureDocs = () => {
        if (!memoryStore[name]) {
            memoryStore[name] = [];
        }
        return memoryStore[name];
    };

    const getDocs = () => ensureDocs();

    return {
        async createIndex() {
            return null;
        },
        async findOne(query = {}) {
            return getDocs().find(buildMatcher(query)) || null;
        },
        async insertOne(doc) {
            const docs = getDocs();
            docs.push(doc);
            return { acknowledged: true, insertedId: doc._id ?? doc.id };
        },
        async insertMany(docs) {
            const collectionDocs = getDocs();
            collectionDocs.push(...docs);
            return { acknowledged: true, insertedCount: docs.length };
        },
        async deleteOne(query = {}) {
            const docs = getDocs();
            const index = docs.findIndex(buildMatcher(query));
            if (index === -1) {
                return { acknowledged: true, deletedCount: 0 };
            }
            docs.splice(index, 1);
            return { acknowledged: true, deletedCount: 1 };
        },
        async deleteMany(query = {}) {
            const docs = getDocs();
            const filtered = docs.filter((doc) => !buildMatcher(query)(doc));
            const deletedCount = docs.length - filtered.length;
            memoryStore[name] = filtered;
            return { acknowledged: true, deletedCount };
        },
        find(query = {}) {
            const docs = getDocs().filter(buildMatcher(query));

            return {
                sort(spec = {}) {
                    if (!spec || Object.keys(spec).length === 0) return this;
                    docs.sort((left, right) => {
                        for (const [field, direction] of Object.entries(spec)) {
                            const value = direction === -1 ? -1 : 1;
                            if (left[field] < right[field]) return -value;
                            if (left[field] > right[field]) return value;
                        }
                        return 0;
                    });
                    return this;
                },
                toArray() {
                    return docs.slice();
                },
            };
        },
        async findOneAndUpdate(query = {}, update = {}, _options = {}) {
            const docs = getDocs();
            const index = docs.findIndex(buildMatcher(query));
            if (index === -1) {
                return { value: null };
            }

            const current = docs[index];
            const next = { ...current };

            if (update.$set) {
                Object.assign(next, update.$set);
            }
            if (update.$push) {
                for (const [field, value] of Object.entries(update.$push)) {
                    const entries = value?.$each ?? value;
                    if (!Array.isArray(entries)) continue;
                    if (!Array.isArray(next[field])) {
                        next[field] = [];
                    }
                    next[field].push(...entries);
                }
            }

            docs[index] = next;
            return { value: next };
        },
    };
};

const createMemoryDb = () => ({
    collection: (name) => createMemoryCollection(name),
});

export const connectToDatabase = async () => {
    if (db) return db;
    if (fallbackMode) return createMemoryDb();

    try {
        client = new MongoClient(uri, {
            serverSelectionTimeoutMS: 3000,
        });
        await client.connect();
        db = client.db(dbName);
        return db;
    } catch (error) {
        fallbackMode = true;
        console.warn(`[mongo] MongoDB unavailable at ${uri}; falling back to in-memory storage. ${error.message}`);
        return createMemoryDb();
    }
};

export const getDb = () => db;

export const closeDatabase = async () => {
    if (client) {
        await client.close();
        client = null;
        db = null;
        fallbackMode = false;
    }
};
