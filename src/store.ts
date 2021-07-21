import db from '@/db'
import TimeEntryModel from '@/components/time-entry/TimeEntryModel'
import {InitializedRecord} from '@orbit/records'
import {reactive} from 'vue'

class Store {
    timeEntries: TimeEntryModel[] = []

    timeEntryTypes: Record<string, string> = {}

    async addUnsavedEntry(): Promise<TimeEntryModel> {
        const newEntry = new TimeEntryModel()

        await newEntry.init()

        this.timeEntries.push(newEntry)

        return newEntry
    }

    async init(): Promise<void> {
        await db.init()

        await this.initTimeEntries()

        await this.initTimeEntryTypes()
    }

    private async initTimeEntries(): Promise<void> {
        const records = await db.memory.query<InitializedRecord[]>(q => q.findRecords('timeEntries'))

        this.timeEntries = records.map((record) => new TimeEntryModel(record))

        const noUnsavedEntries = this.timeEntries.every((entry) => {
            return !entry.attributes.unsaved
        })

        if (noUnsavedEntries) {
            await this.addUnsavedEntry()
        }
    }

    private async initTimeEntryTypes(): Promise<void> {
        let records = await db.memory.query<InitializedRecord[]>(q => q.findRecords('timeEntryTypes'))

        if (!records.length) {
            const defaultTypes = ['coding', 'meeting', 'programming']

            records = await db.memory.update<InitializedRecord[]>(t => {
                return defaultTypes.map((defaultType) => {
                    return t.updateRecord({attributes: {title: defaultType}, type: 'timeEntryTypes'})
                })
            })
        }

        this.timeEntryTypes = records.reduce((acc, record) => {
            acc[record.id] = record.attributes!.title as string
            return acc
        }, {})
    }
}

const store = reactive(new Store())

export default store
