import {Coordinator, SyncStrategy} from '@orbit/coordinator'
import {IndexedDBSource} from '@orbit/indexeddb'
import {MemorySource} from '@orbit/memory'
import {InitializedRecord, RecordSchema} from '@orbit/records'
import {reactive} from 'vue'

class Db {
    readonly backup: IndexedDBSource
    private readonly coordinator: Coordinator
    readonly memory: MemorySource
    private readonly schema: RecordSchema

    constructor() {
        this.schema = new RecordSchema({
            models: {
                timeEntries: {
                    attributes: {
                        from: {
                            type: 'number'
                        },
                        name: {
                            type: 'string'
                        },
                        to: {
                            type: 'number'
                        },
                        type: {
                            type: 'string'
                        },
                        unsaved: {
                            type: 'boolean'
                        }
                    }
                },
                timeEntryTypes: {
                    attributes: {
                        title: {
                            type: 'string'
                        }
                    }
                }
            }
        })

        this.backup = new IndexedDBSource({
            namespace: 'app',
            name: 'backup',
            // @ts-ignore
            schema: this.schema
        })

        this.memory = new MemorySource({
            name: 'memory',
            // @ts-ignore
            schema: this.schema,
        })

        const backupMemorySync = new SyncStrategy({
            source: 'memory',
            target: 'backup',
            blocking: true
        })

        this.coordinator = new Coordinator({
            sources: [this.backup, this.memory],
            strategies: [backupMemorySync]
        })
    }

    async init(): Promise<void> {
        try {
            const backedUpRecords = await this.backup.query<InitializedRecord[]>(q => q.findRecords())

            await this.memory.update(t => backedUpRecords.map(record => t.updateRecord(record)))
        }
        catch {

        }

        await this.coordinator.activate()
    }
}

const db = reactive(new Db())

export default db
