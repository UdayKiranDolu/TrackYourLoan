export interface PaginationOptions {
    page: number;
    limit: number;
    skip: number;
}

export function getPagination(
    pageStr?: string,
    limitStr?: string
): PaginationOptions {
    const page = Math.max(1, parseInt(pageStr || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(limitStr || '10', 10)));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}