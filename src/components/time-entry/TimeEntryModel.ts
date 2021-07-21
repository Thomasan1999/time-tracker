import {TimeEntryAttributes} from "@/types";
import {InitializedRecord, RecordIdentity} from "@orbit/records";
import db from "@/db";

export default class TimeEntryModel {
    id?: string
    attributes: TimeEntryAttributes = this.getDefaultValues()

    constructor(record?: InitializedRecord) {
        if (!record) {
            return
        }

        this.id = record.id
        this.attributes = record.attributes as TimeEntryAttributes
    }

    async delete() {
        if (!this.id) {
            throw new Error('Record not initialized')
        }

        await db.memory.update(t => t.removeRecord(<RecordIdentity>this.recordIdentity))
    }

    getDefaultValues() {
        return {
            from: 0,
            name: '',
            to: 0,
            type: '',
            unsaved: this.attributes?.unsaved ?? true
        }
    }

    async init() {
        if (this.id) {
            throw new Error('Model is already initialized')
        }

        await this.update()
    }

    get record() {
        return {
            attributes: this.attributes,
            ...this.recordIdentity
        }
    }

    get recordIdentity() {
        return {
            id: this.id,
            type: 'timeEntries'
        }
    }

    async reset() {
        this.attributes = this.getDefaultValues()

        await this.update()
    }

    async save() {
        this.attributes.unsaved = false

        await this.update()
    }

    async set(key: string, value: any) {
        this.attributes[key] = value

        await db.memory.update(t => t.replaceAttribute(<RecordIdentity>this.recordIdentity, key, value))
    }

    async update() {
        await db.memory.update(t => t.updateRecord(this.record))
    }
}
