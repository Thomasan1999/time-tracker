export type AddTimeEntryFormDate = {
    date: string,
    time: string
}

export type TimeEntryColumn = {
    name: string,
    sortable?: boolean,
    title?: string
}

export type TimeEntryAttributes = {
    from: number,
    name: string,
    to: number,
    type: string,
    unsaved?: boolean
}

