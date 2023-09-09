import type { z } from "zod";
import type { ApiResponse } from "./http";

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
