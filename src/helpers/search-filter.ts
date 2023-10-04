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
    while (start > -1) {
        const keyEnd = val.indexOf(":", start);
        const key = val.substring(start, keyEnd).trim();
        const nextKeyEnd = val.indexOf(":", keyEnd + 1);
        const valWithKey = val.substring(
            keyEnd + 1,
            nextKeyEnd > -1 ? nextKeyEnd + 1 : undefined
        );
        console.log(valWithKey);
        const sval = valWithKey.replace(/\s([a-zA-Z0-9_-]+):$/, "");
        start = nextKeyEnd - valWithKey.length + sval.length + 1;

        if (key) {
            f[key] = sval.trim();
        }
    }
    return f;
};
