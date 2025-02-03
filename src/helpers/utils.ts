import type { z } from "zod";
import type { ApiResponse } from "./http";
import { ref, type Ref } from "vue";

export const formDataToObj = (
    formData: FormData,
    arrays: string[] = []
): Record<string, any> => {
    const body: Record<string, any> = {};

    arrays.forEach((key) => {
        body[key] = formData.getAll(key);
        formData.delete(key);
    });

    formData.forEach((value, key) => {
        body[key] = value;
    });
    return body;
};

export const hasDuplicate = (
    old: Record<string, any>[] | string,
    newVal: Record<string, any> | FormData | string
): boolean => {
    if (typeof old === "string") {
        old = JSON.parse(old) as Record<string, any>[];
    }

    if (newVal instanceof FormData) {
        newVal = formDataToObj(newVal);
    } else if (typeof newVal === "string") {
        newVal = JSON.parse(newVal) as Record<string, any>;
    }

    for (let i = 0; i < old.length; i++) {
        const oRow = old[i];
        let allSame = true;
        for (const key in oRow) {
            if (oRow[key] !== newVal[key]) {
                allSame = false;
                break;
            }
        }
        if (allSame) {
            return true;
        }
    }

    return false;
};

export const getFormError = (err: z.typeToFlattenedError<any, any>): string => {
    let error: string | undefined = err.formErrors[0];
    if (!error && err.fieldErrors) {
        const keys = Object.keys(err.fieldErrors);
        error = err.fieldErrors[keys[0]]?.[0] + ` in ${keys[0]} `;
        if (keys.length > 1) {
            error += ` (+${keys.length - 1} more fields)`;
        }
    }
    if (!error) {
        error = "Some fields have invalid data!";
    }
    return error;
};

export const validateObject = <T extends z.ZodRawShape>(
    body: T,
    schema: z.ZodObject<T>
): ApiResponse | Record<string, any> => {
    const res = schema.safeParse(body);

    if (!res.success) {
        const err = res.error.flatten();
        return {
            success: false,
            status: 422,
            message: getFormError(err),
            field: err.fieldErrors as any,
            form: err.formErrors as any,
        };
    }
    return res;
};

export type SortType = "desc" | "asc";
export interface Sorting<T extends string = string> {
    by: T;
    order: SortType;
}

export function useSorter<T extends string = string>(
    initial: T,
    order: SortType = "desc"
): [Ref<Sorting<T>>, (by: T) => Sorting<T>] {
    let sort_by = initial;
    let sort_type = order;
    const sorted = ref<Sorting<T>>({
        by: sort_by,
        order: sort_type,
    }) as Ref<Sorting<T>>;
    return [
        sorted,
        (by: T): Sorting<T> => {
            if (sort_by == by) {
                sort_type = sort_type === "desc" ? "asc" : "desc";
            } else {
                sort_by = by;
                sort_type = order;
            }
            sorted.value.by = by;
            sorted.value.order = sort_type;
            return sorted.value;
        },
    ];
}

export const dateToDMY = (date: Date): string =>
    `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getFullYear()}`;

export const dmyToDate = (dmy: string): Date => {
    const items = dmy.split("-");
    return new Date(
        parseInt(items[2]),
        parseInt(items[1]) - 1,
        parseInt(items[0])
    );
};

export const formatNumber = (num: number): string => {
    if (num < 10000) {
        return num.toString();
    }
    return num.toString().replace(/\B(?=(\d{3})(\d{2})*(?!\d))/g, ",");
};
