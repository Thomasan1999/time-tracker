<template lang="pug">
div.app-content
    template(v-if="initialized")
        div.time-entry-container
            div.time-entry-header-row.time-entry-row
                time-entry-header(
                    v-for="column in columns"
                    :key="column.name"
                    :column-name="column.name"
                    :sorted="column.sortable !== false && sorting.column === column.name"
                    :sort-order="column.sortable !== false && sorting.column === column.name && sorting.order"
                    :title="column.title"
                    @click="onHeaderClick(column)"
                )
                    template(v-if="column.name === 'fromToHyphen'")
                        from-to-hyphen
                    template(v-else-if="column.name === 'timeDiff'")
                        | Duration:
            time-entry(
                v-for="entry in unsavedEntries"
                :key="entry.id"
                v-bind="entry.attributes"
                @addType="addType"
                @input="(key, value) => entry.set(key, value)"
                @reset="() => entry.reset()"
                @save="() => saveEntry(entry)"
            )
            hr
            div.time-entry-settings
                time-entry-filter(v-if="filter.types" :all-types="types" v-model:name="filter.name" v-model:types="filter.types")
                div.page-size-container
                    label Per page:
                    input.page-size(min="1" type="number" :value="pageSize" @input="onPageSizeInput")
            div.sortable-time-entry-container-container
                div.sortable-time-entry-container
                    time-entry(
                        v-for="entry in sortedEntriesOnPage"
                        :key="entry.id"
                        v-bind="entry.attributes"
                        @addType="addType"
                        @input="(key, value) => entry.set(key, value)"
                        @delete="() => deleteEntry(entry)"
                    )
        page-index-container(:number-of-pages="numberOfPages" v-model="pageIndex")
    div(v-else) Loading
</template>

<script lang="ts">
import FromToHyphen from '@/components/FromToHyphen.vue'
import TimeEntry from '@/components/time-entry/TimeEntry.vue'
import TimeEntryHeader from '@/components/time-entry/TimeEntryHeader.vue'
import store from '@/store'
import {TimeEntryColumn} from '@/types'
import {computed, reactive, ref, watch} from 'vue'
import TimeEntryModel from "@/components/time-entry/TimeEntryModel";
import {debounce} from 'lodash'
import {Merge} from "ts-essentials";
import {getRouterQueryParam, setRouterQueryParam} from "@/utils/router";
import PageIndexContainer from "@/components/PageIndexContainer.vue";
import TimeEntryFilter from "@/components/time-entry/TimeEntryFilter.vue";
import db from "@/db";
import {InitializedRecord} from "@orbit/records";

export default {
    components: {
        TimeEntryFilter,
        PageIndexContainer,
        FromToHyphen,
        TimeEntry,
        TimeEntryHeader
    },
    setup() {
        const addType = async (newTypeName: string) => {
            const newType = await db.memory.update<InitializedRecord>(t => {
                return t.updateRecord({attributes: {title: newTypeName}, type: 'timeEntryTypes'})
            })

            store.timeEntryTypes[newType.id] = newTypeName
        }

        const deleteEntry = async (entryToDelete: TimeEntryModel) => {
            await entryToDelete.delete()

            store.timeEntries = entries.value.filter((entry) => {
                return entry !== entryToDelete
            })
        }

        const getEntriesSortDiff = (entryA: TimeEntryModel, entryB: TimeEntryModel) => {
            const dataType = typeof entryA.attributes[sorting.column]

            if (dataType === 'string') {
                return entryA.attributes[sorting.column].localeCompare(entryB.attributes[sorting.column])
            }

            return entryA.attributes[sorting.column] - entryB.attributes[sorting.column]
        }

        const getPageIndexFromRoute = () => {
            return (getRouterQueryParam('pageNumber') ?? 1) - 1
        }

        const getTypesFromQuery = () => {
            const typesQuery = getRouterQueryParam('types')

            if (typeof typesQuery === 'undefined') {
                return
            }

            if (typesQuery === '') {
                return []
            }

            const typeNames = typesQuery.split(',')

            return typeNames.map((typeName) => {
                return Object.entries(types.value).find(([, otherTypeName]) => {
                    return otherTypeName === typeName
                })[0]
            })
        }

        const onHeaderClick = (column: typeof columns[0]) => {
            if (column.sortable === false) {
                return
            }

            sorting.order = sorting.column === column.name ? sorting.order * -1 : -1

            sorting.column = column.name
        }

        const onPageSizeInput = debounce(($event: Merge<InputEvent, { target: HTMLInputElement }>) => {
            pageSize.value = parseInt($event.target.value)
        }, 60)

        const saveEntry = async (entry: TimeEntryModel) => {
            await entry.save()

            await store.addUnsavedEntry()
        }

        const columns = reactive<TimeEntryColumn[]>([
            {
                name: 'type',
            },
            {
                name: 'name'
            },
            {
                name: 'from'
            },
            {
                name: 'fromToHyphen',
                sortable: false
            },
            {
                name: 'to'
            },
            {
                name: 'timeDiff',
                sortable: false
            },
            {
                name: 'controls',
                title: ''
            }
        ])

        const filter = reactive<{ name: string, types?: string[] }>({
            name: getRouterQueryParam('name') ?? '',
            types: undefined
        })

        const initialized = ref(false)

        const sorting = reactive({
            column: 'from',
            order: -1
        })

        const entries = computed(() => {
            return store.timeEntries
        })

        const pageIndex = ref<number>()

        const pageSize = ref(parseInt(getRouterQueryParam('pageSize') ?? 10))

        const numberOfPages = computed(() => {
            return Math.ceil(sortedEntries.value.length / pageSize.value)
        })

        const savedEntries = computed(() => {
            return entries.value.filter((entry) => {
                return !entry.attributes.unsaved
            })
        })

        const unsavedEntries = computed(() => {
            return entries.value.filter((entry) => {
                return entry.attributes.unsaved
            }).reverse()
        })

        const sortedEntries = computed(() => {
            return savedEntries.value
                .filter((entry) => {
                    return entry.attributes.name.includes(filter.name) && filter.types?.includes(entry.attributes.type)
                })
                .sort((entryA, entryB) => {
                    const diff = getEntriesSortDiff(entryA, entryB)

                    return diff * sorting.order
                })
        })

        const sortedEntriesOnPage = computed(() => {
            const start = pageIndex.value * pageSize.value
            const end = start + pageSize.value

            return sortedEntries.value
                .slice(start, end)
        })

        const types = computed(() => {
            return store.timeEntryTypes
        })

        watch(pageIndex, () => {
            setRouterQueryParam('pageNumber', pageIndex.value + 1)
        })

        watch(() => filter.name, () => {
            setRouterQueryParam('name', filter.name)
        })

        watch(() => filter.types, () => {
            const typesParam = filter.types!
                .map((typeId) => {
                    return Object.entries(types.value).find(([key]) => {
                        return key === typeId
                    })[1]
                })
                .join(',')

            setRouterQueryParam('types', typesParam)
        })

        watch(() => getRouterQueryParam('pageNumber'), () => {
            pageIndex.value = getPageIndexFromRoute()
        }, {immediate: true})

        watch(pageSize, () => {
            setRouterQueryParam('pageSize', pageSize.value)
        })

        store.init().then(() => {
            initialized.value = true

            if (typeof filter.types === 'undefined') {
                filter.types = getTypesFromQuery() ?? Object.keys(types.value)
            }
        })

        return {
            addType,
            columns,
            deleteEntry,
            filter,
            initialized,
            onHeaderClick,
            onPageSizeInput,
            numberOfPages,
            pageIndex,
            pageSize,
            saveEntry,
            sortedEntriesOnPage,
            sorting,
            types,
            unsavedEntries
        }
    }
}
</script>

<style lang="scss">

#app {
    display: flex;
    font-family: sans-serif;
    justify-content: center;
}

.app-content {
    display: flex;
    flex-direction: column;
    height: calc(100vh - 100px);
    margin-top: 30px;
    max-width: 1210px;
    width: 100%;
}

button {
    color: currentColor;
    cursor: pointer;

    &[disabled] {
        color: #666666;
        cursor: not-allowed;
    }
}

.time-entry-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 20px;
    overflow: hidden;
}

.sortable-time-entry-container-container {
    overflow: auto;
}

.sortable-time-entry-container {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    gap: 1px;
}

.time-entry-settings {
    display: flex;
    justify-content: space-between;
}

.time-entry-row {
    align-items: center;
    display: flex;
    gap: 1px;
    white-space: break-spaces;

    & > * {
        align-items: center;
        background-color: #eeeeee;
        box-sizing: border-box;
        display: flex;
        flex-grow: 0;
        flex-shrink: 0;
        height: 40px;
        padding-left: 5px;
        padding-right: 5px;
    }
}

.time-entry-header {
    cursor: pointer;
    user-select: none;
}

.type {
    flex-basis: 150px;
}

.name {
    flex-basis: 300px;
}

.from, .to {
    display: flex;
    flex-basis: 250px;
}

.controls {
    display: flex;
    flex-basis: 130px;
    justify-content: flex-end;
}

.timeDiff {
    flex-basis: 100px;
}

.page-size-container {
    align-items: center;
    display: flex;
    justify-content: flex-end;
}

.page-size {
    text-align: right;
    width: 50px;
}
</style>
