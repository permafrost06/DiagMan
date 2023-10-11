export const filterToValue = (filters: Record<string, string>): string => {
    let val = "";
    for (const by in filters) {
        const sval = filters[by].trim();
        val += by + ":" + sval.replace(/([^a-zA-Z0-9_-])/g, "") + " ";
    }
    return val;
};

export const valueToFilter = (val: string): Record<string, string> => {
    const f: Record<string, string> = {};
    let start = 0;
    let count = 0;
    while (start > -1 && count < 1000) {
        count++;
        const keyEnd = val.indexOf(":", start);
        if (keyEnd === -1) {
            f["all"] = val.substring(start).trim();
            break;
        }
        let key = val.substring(start, keyEnd).trim();
        const strEnd = val.indexOf(" ", keyEnd + 1);
        if (strEnd < 0) {
            f[key] = val.substring(keyEnd + 1);
            break;
        }
        const str = val.substring(keyEnd + 1, strEnd);
        const keyLastWordStart = key.lastIndexOf(" ");
        if (keyLastWordStart > -1) {
            key = key.substring(keyLastWordStart + 1);
        }
        f[key] = str;
        start = strEnd + 1;
    }
    return f;
};
