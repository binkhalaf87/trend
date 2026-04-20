declare module "google-trends-api" {
  interface BaseOptions {
    geo?: string;
    hl?: string;
    timezone?: number;
    category?: number;
  }

  interface InterestOverTimeOptions extends BaseOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    granularTimeResolution?: boolean;
  }

  interface RelatedOptions extends BaseOptions {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
  }

  interface DailyTrendsOptions extends BaseOptions {
    trendDate?: Date;
  }

  const googleTrends: {
    interestOverTime(options: InterestOverTimeOptions): Promise<string>;
    interestByRegion(options: BaseOptions & { keyword: string; resolution?: string }): Promise<string>;
    relatedTopics(options: RelatedOptions): Promise<string>;
    relatedQueries(options: RelatedOptions): Promise<string>;
    dailyTrends(options: DailyTrendsOptions): Promise<string>;
    realTimeTrends(options: BaseOptions): Promise<string>;
    autoComplete(options: { keyword: string; hl?: string }): Promise<string>;
  };

  export default googleTrends;
}
