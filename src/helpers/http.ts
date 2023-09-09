import { formDataToObj, validateObject } from "./utils";

export type ApiResponse =
    | {
          success: true;
          status: number;
          message?: string;
          rows?: any;
          data?: any;
          pagination?: {
              page: number;
              total: number;
              maxPage: number;
          };
      }
    | {
          success: false;
          status?: number;
          message: string;
          form?: string[];
          field?: Record<string, string[]>;
          details?: any;
      };

export const fetchApi = async (
    resource: RequestInfo | URL,
    options?: RequestInit
): Promise<ApiResponse> => {
    try {
        const res = await fetch(resource, options);
        const data = await res.json();
        data.status = res.status;
        return data;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Something went wrong!",
        };
    }
};

interface OfflineConfig {
    key: string;
    operation: "update" | "insert" | "remove";
    schema?: any;
}

export const fetchWithOffline = async (
    { key, operation, schema }: OfflineConfig,
    resource: RequestInfo | URL,
    options?: RequestInit
): Promise<ApiResponse> => {
    const old = JSON.parse(localStorage.getItem(key) || "{}");

    old[operation] = old[operation] || (operation === "update" ? {} : []);

    let body: any = options?.body;
    if (typeof body === "string") {
        body = JSON.parse(body);
    } else if (body instanceof FormData) {
        body = formDataToObj(body);
    } else {
        body = {};
    }

    if (schema) {
        const data = validateObject(body, schema);
        if (!data.success) {
            return data as any;
        }
    }

    const res = navigator.onLine
        ? await fetchApi(resource, options)
        : {
              success: false,
              status: 500,
              message: "Offline",
          };

    if (!res.success && res.status !== 422) {
        const oldId = body.id;
        if (operation === "remove") {
            old[operation].push(oldId);
        } else if (operation === "insert") {
            body.id = `n${old[operation].length + 1}`;
            old[operation].push(body);
        } else {
            body.id = `u${oldId}`;
            old[operation][oldId] = body;
        }

        localStorage.setItem(key, JSON.stringify(old));
        console.log("Cached");

        return {
            status: 200,
            success: true,
            message: "Operation successful!",
            rows: [body],
        };
    }

    return res;
};
