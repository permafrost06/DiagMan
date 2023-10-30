import { API_BASE } from "./config";
import { fetchApi } from "./http";

interface CachedItem<T = Record<string, any>> {
    insert?: T[];
    update?: Record<string, T>;
    remove?: Array<string | number>;
}

const syncTable = async (key: string, url: string) => {
    const { insert, update, remove } = JSON.parse(
        localStorage.getItem(key) || "{}"
    ) as CachedItem;
    const body: Required<CachedItem> = {
        insert: [],
        update: {},
        remove: [],
    };

    let maxOps = 100;

    if (insert?.length) {
        body.insert = insert.splice(0, maxOps);
        maxOps -= body.insert.length;
    }

    if (update) {
        const keys = Object.keys(update);
        for (let i = 0; i < maxOps && i < keys.length; i++) {
            const key = keys[i];
            body.update[key] = update[key];
        }
    }

    if (remove?.length) {
        body.remove = remove.splice(0, maxOps);
        maxOps -= body.remove.length;
    }

    if (maxOps === 100) {
        return;
    }

    const res = await fetchApi(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (res.success) {
        localStorage.setItem(
            key,
            JSON.stringify({
                insert,
                update,
                remove,
            })
        );
        syncTable(key, url);
    } else {
        console.warn(res.message);
    }
};

export const sync = async () => {
    syncTable("tests", API_BASE + "/tests/sync");
    syncTable("patients", API_BASE + "/patients/sync");
};

export const applyOfflineChanges = <
    T extends { id: string | number } = Record<string, any> & {
        id: string | number;
    }
>(
    key: string,
    data: T[]
) => {
    const { insert, update, remove } = JSON.parse(
        localStorage.getItem(key) || "{}"
    ) as CachedItem<T>;

    if (insert) {
        for (let i = 0; i < insert.length; i++) {
            data.push(insert[i]);
        }
    }

    if (update) {
        for (const id in update) {
            const toUpdate = data.findIndex((val) => val.id == id);
            if (toUpdate > -1) {
                data[toUpdate] = update[id];
            }
        }
    }

    if (remove) {
        data = data.filter((val) => remove.indexOf(val.id) === -1);
    }
    return data;
};
