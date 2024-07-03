import { BadRequestException, ForbiddenException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { addDays, addHours, compareAsc, format, isValid } from "date-fns";
import { PaginateOptions } from "mongoose";
import { DeepPartial } from "ts-essentials";

export const CONFIG_SERVICE = new ConfigService();

export const QueryOptions = (query: Record<string, unknown>, lean = false): {
    otherQuery: Record<string, any>,
    paginateOptions: PaginateOptions
} => {
    const { page, limit, select, sort, ...rest }: PaginateOptions = query;

    const paginateOptions: PaginateOptions = {
        page: page || 1,
        limit: limit || 10,
        select: select || '',
        sort: sort ? `${sort} -createdAt` : '-createdAt',
        populate: [],
        lean
    }

    return { otherQuery: rest as unknown as Record<string, any>, paginateOptions }
}

export const BaseResponses = (resource: string) => {
    return {
        DEFAULT: 'Data fetch Successful.',
        FIND_ALL: `${resource}s Data Fetch Successful.`,
        FIND_ONE_BY_ID: `${resource} Data Fetch Successful.`,
        DELETE: `${resource} Deleted Successully.`,
        CREATE: `${resource} Created Successfully.`,
        UPDATE: `${resource} Updated Successfully.`,
    }
}

export const DateFormatString = 'PPPPpppp'

interface IteratorIF<T> {
    length: number;
}

export const MapArrToObject = <T>(data: T & IteratorIF<T>) => {
    let obj: Record<string, unknown> = {};

    for (let i = 0; i < data.length; i++) obj[data[i]] = data[i];

    return obj;
}

export const MapKeysToValues = <T>(obj: T) => {
    return Object.keys(obj!).reduce(
        function (
            obj,
            key,
        ) {
            obj[key] = key;
            return obj;
        },
        {}) as unknown as Record<keyof T, string>;
}