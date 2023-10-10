export const filterToValue = (filters: Record<string, string>): string => {
    let val = "";
    for (const by in filters) {
        const sval = filters[by].trim();
        val += by + ":" + sval + " ";
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
            f["all"] = val.trim();
            break;
        }
        const key = val.substring(start, keyEnd).trim();
        const nextKeyEnd = val.indexOf(":", keyEnd + 1);
        const valWithKey = val.substring(
            keyEnd + 1,
            nextKeyEnd > -1 ? nextKeyEnd + 1 : undefined
        );
        const sval = valWithKey.replace(/\s([a-zA-Z0-9_-]+):$/, "");
        if (key) {
            f[key] = sval.trim();
        }
        if (nextKeyEnd > -1) {
            start = nextKeyEnd - valWithKey.length + sval.length + 1;
        } else {
            break;
        }
    }
    return f;
};
