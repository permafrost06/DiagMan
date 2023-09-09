export const getTests = (status: string | null): Record<string, any>[] => {
    const all = JSON.parse(localStorage.getItem("tests") || "[]") as any[];
    if (!status) {
        return all;
    }
    return all.filter((row) => row.status === status);
};
