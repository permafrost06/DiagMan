import { fetchApi } from "./http";

export const API_BASE = import.meta.env.VITE_API_BASE;
export const AUTH_TOKEN_KEY = import.meta.env.VITE_AUTH_TOKEN_KEY;
export const TMP_USER_KEY = import.meta.env.VITE_TMP_USER_KEY;
export const TMP_PIN_BYPASS_KEY = import.meta.env.VITE_PIN_BYPASS_KEY;



export const DEFAULT_SHOW_ORDER = ["name", "type", "age", "gender", "contact", "timestamp", "delivery_date", "specimen", "referer", "status"];


export const saveListConfig = async (config: any): Promise<[boolean, string]> => {
    const formData = new FormData();

    formData.append("data", JSON.stringify(config));

    const res = await fetchApi(`${API_BASE}/misc/named/save?name=patient_list_config&scope=user`, {
        method: "POST",
        body: formData,
    });

    if (!res.success) {
        return [false, res.message];
    } else {
        return [true, res.message!];
    }
};

