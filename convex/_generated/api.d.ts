/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as adminEvents from "../adminEvents.js";
import type * as adminReset from "../adminReset.js";
import type * as affiliates from "../affiliates.js";
import type * as bundlePurchases from "../bundlePurchases.js";
import type * as constants from "../constants.js";
import type * as crons from "../crons.js";
import type * as emailActions from "../emailActions.js";
import type * as eventStaff from "../eventStaff.js";
import type * as events from "../events.js";
import type * as multiDayEvents from "../multiDayEvents.js";
import type * as paymentSettings from "../paymentSettings.js";
import type * as payments from "../payments.js";
import type * as platformTransactions from "../platformTransactions.js";
import type * as purchases from "../purchases.js";
import type * as scanning from "../scanning.js";
import type * as sellers from "../sellers.js";
import type * as storage from "../storage.js";
import type * as tableSales from "../tableSales.js";
import type * as tables from "../tables.js";
import type * as testData from "../testData.js";
import type * as ticketTypes from "../ticketTypes.js";
import type * as tickets from "../tickets.js";
import type * as transactions from "../transactions.js";
import type * as users from "../users.js";
import type * as waitingList from "../waitingList.js";
import type * as zellePayments from "../zellePayments.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  adminEvents: typeof adminEvents;
  adminReset: typeof adminReset;
  affiliates: typeof affiliates;
  bundlePurchases: typeof bundlePurchases;
  constants: typeof constants;
  crons: typeof crons;
  emailActions: typeof emailActions;
  eventStaff: typeof eventStaff;
  events: typeof events;
  multiDayEvents: typeof multiDayEvents;
  paymentSettings: typeof paymentSettings;
  payments: typeof payments;
  platformTransactions: typeof platformTransactions;
  purchases: typeof purchases;
  scanning: typeof scanning;
  sellers: typeof sellers;
  storage: typeof storage;
  tableSales: typeof tableSales;
  tables: typeof tables;
  testData: typeof testData;
  ticketTypes: typeof ticketTypes;
  tickets: typeof tickets;
  transactions: typeof transactions;
  users: typeof users;
  waitingList: typeof waitingList;
  zellePayments: typeof zellePayments;
}>;
declare const fullApiWithMounts: typeof fullApi;

export declare const api: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApiWithMounts,
  FunctionReference<any, "internal">
>;

export declare const components: {
  rateLimiter: {
    lib: {
      checkRateLimit: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      clearAll: FunctionReference<
        "mutation",
        "internal",
        { before?: number },
        null
      >;
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
      getValue: FunctionReference<
        "query",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          key?: string;
          name: string;
          sampleShards?: number;
        },
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          shard: number;
          ts: number;
          value: number;
        }
      >;
      rateLimit: FunctionReference<
        "mutation",
        "internal",
        {
          config:
            | {
                capacity?: number;
                kind: "token bucket";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: null;
              }
            | {
                capacity?: number;
                kind: "fixed window";
                maxReserved?: number;
                period: number;
                rate: number;
                shards?: number;
                start?: number;
              };
          count?: number;
          key?: string;
          name: string;
          reserve?: boolean;
          throws?: boolean;
        },
        { ok: true; retryAfter?: number } | { ok: false; retryAfter: number }
      >;
      resetRateLimit: FunctionReference<
        "mutation",
        "internal",
        { key?: string; name: string },
        null
      >;
    };
    time: {
      getServerTime: FunctionReference<"mutation", "internal", {}, number>;
    };
  };
};
