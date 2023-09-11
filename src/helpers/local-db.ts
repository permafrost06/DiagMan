export enum TABLES {
    tests = "local_tests",
    patients = "local_patients",
}

export const insertRow = (table: TABLES, data: Record<string, any>) => {
    const old = JSON.parse(localStorage.getItem(table) || "[]");
    old.push(data);
    localStorage.setItem("meta_" + table, old.length);
    localStorage.setItem(table, JSON.stringify(old));
};

export const deletetRow = <T = Record<string, any>>(
    table: TABLES,
    check: (row: T, index: number) => boolean
) => {
    const old = JSON.parse(localStorage.getItem(table) || "[]");
    const keep = old.filter((row: T, index: number) => !check(row, index));

    localStorage.setItem("meta_" + table, keep.length);
    localStorage.setItem(table, JSON.stringify(keep));
};

export const emptyTable = (table: TABLES) => {
    localStorage.setItem(table, "[]");
};

export const getRows = <T = Record<string, any>>(table: TABLES): T[] => {
    const all = JSON.parse(localStorage.getItem(table) || "[]");
    return all;
};

export const getRowCount = (table: TABLES): number => {
    return parseInt(localStorage.getItem("meta_" + table) || "0");
};
