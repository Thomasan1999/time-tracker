import router from "@/router";

export function getRouterQueryParam(name: string) {
    return router.currentRoute.value.query[name]
}

export function setRouterQueryParam(name: string, value: any): void {
    router.push({
        query: {
            ...router.currentRoute.value.query,
            [name]: value
        }
    })
}
