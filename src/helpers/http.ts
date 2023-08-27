type ApiResponse =
    | {
          success: true;
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
        return await res.json();
    } catch (error: any) {
        return {
            success: false,
            message: error.message || "Something went wrong!",
        };
    }
};
