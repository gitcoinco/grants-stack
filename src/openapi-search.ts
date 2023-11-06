/**
 * FastAPI
 * 0.1.0
 * DO NOT MODIFY - This file has been generated using oazapfts.
 * See https://www.npmjs.com/package/oazapfts
 */
import * as Oazapfts from "oazapfts/lib/runtime";
import * as QS from "oazapfts/lib/runtime/query";
export const defaults: Oazapfts.RequestOpts = {
    baseUrl: "/",
};
const oazapfts = Oazapfts.runtime(defaults);
export const servers = {};
export type SearchResultMeta = {
    searchType: "fulltext" | "semantic";
    searchScore: number;
};
export type ApplicationSummary = {
    applicationRef: string;
    chainId: number;
    roundApplicationId: string;
    roundId: string;
    projectId: string;
    name: string;
    websiteUrl: string;
    logoImageCid: string | null;
    bannerImageCid: string | null;
    summaryText: string;
};
export type SearchResult = {
    meta: SearchResultMeta;
    data: ApplicationSummary;
};
export type SearchResponse = {
    results: SearchResult[];
};
export type ValidationError = {
    loc: (string | number)[];
    msg: string;
    "type": string;
};
export type HttpValidationError = {
    detail?: ValidationError[];
};
export type ApplicationsResponse = {
    applicationSummaries: ApplicationSummary[];
};
export type ApplicationResponse = {
    applicationSummary: ApplicationSummary;
};
/**
 * Search
 */
export function searchSearchGet(q: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: SearchResponse;
    } | {
        status: 422;
        data: HttpValidationError;
    }>(`/search${QS.query(QS.explode({
        q
    }))}`, {
        ...opts
    }));
}
/**
 * Get Applications
 */
export function getApplicationsApplicationsGet(opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ApplicationsResponse;
    }>("/applications", {
        ...opts
    }));
}
/**
 * Get Application
 */
export function getApplicationApplicationsApplicationRefGet(applicationRef: string, opts?: Oazapfts.RequestOpts) {
    return oazapfts.ok(oazapfts.fetchJson<{
        status: 200;
        data: ApplicationResponse | null;
    } | {
        status: 422;
        data: HttpValidationError;
    }>(`/applications/${encodeURIComponent(applicationRef)}`, {
        ...opts
    }));
}

