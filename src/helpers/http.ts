import { formDataToObj } from "./utils";

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

export const addRequest = async (
    key: string,
    preRequestError: (
        old: Record<string, any>[],
        body: Record<string, any>
    ) => ApiResponse | boolean,
    resource: RequestInfo | URL,
    options?: RequestInit
): Promise<ApiResponse> => {
    let oldRecords = JSON.parse(localStorage.getItem(key) || "[]");

    if (!Array.isArray(oldRecords)) {
        oldRecords = [];
    }

    let body: any = options?.body;
    if (typeof body === "string") {
        body = JSON.parse(body);
    } else if (body instanceof FormData) {
        body = formDataToObj(body);
    } else {
        body = {};
    }
    const exists = preRequestError(oldRecords, body);
    if (typeof exists === "object") {
        return exists;
    }

    if (exists) {
        console.log("Existed!");

        return {
            status: 200,
            success: true,
            message: "Added successfully!",
            rows: [body],
        };
    }

    const res = navigator.onLine
        ? await fetchApi(resource, options)
        : {
              success: false,
              status: 500,
              message: "Offline",
          };

    if (!res.success && res.status !== 422) {
        body.id = `o${oldRecords.length + 1}`;
        oldRecords.push(body);
        localStorage.setItem(key, JSON.stringify(oldRecords));
        console.log("Cached");

        return {
            status: 200,
            success: true,
            message: "Added successfully!",
            rows: [body],
        };
    }

    return res;
};
