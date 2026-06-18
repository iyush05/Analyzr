export interface UserAnalyticsOptions {
  endpoint: string;
  siteId: string;
  batchSize?: number;
  flushInterval?: number;
  debug?: boolean;
}

export function init(options: UserAnalyticsOptions): void;

declare const UserAnalytics: {
  init: typeof init;
};

export default UserAnalytics;
