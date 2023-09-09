import { API_BASE } from "./config";
import { fetchApi } from "./http";

export const getTests = (status: string | null): Record<string, any>[] => {
    const all = JSON.parse(localStorage.getItem("tests") || "[]") as any[];
    if (!status) {
        return all;
    }
    return all.filter((row) => row.status === status);
};

const syncTable = async (key: string, url: string) => {
    const all = JSON.parse(localStorage.getItem(key) || "[]") as Array<any>;
    if (all.length === 0) {
        return;
    }
    const step = all.splice(0, 100);
    const res = await fetchApi(url, {
        method: "POST",
        body: JSON.stringify(step),
        headers: {
            "Content-Type": "application/json",
        },
    });
    if (res.success) {
        localStorage.setItem(key, JSON.stringify(all));
        syncTable(key, url);
    } else {
        console.warn(res.message);
    }
};

export const sync = async () => {};
