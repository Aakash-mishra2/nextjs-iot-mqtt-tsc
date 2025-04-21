import { EnergyDataProp } from "@/utils/types";
import dayjs from "dayjs";
export type FetchQuarterlyUsageDataProps = {
  slug?: string | undefined;
  options?: object;
  authToken?: string;
};

export type QuarterlyAPIResponseType = {
  date: string;
  totalEnergyConsumed?: number;
  data?: EnergyDataProp[];
};

export type dataItem = {
  date: string;
  usage: number;
  timestamp: number;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  timeString: string;
  peakValue: boolean;
  value: number;
};

export type quarterUsageData = {
  date?: string;
  usage?: number | string;
  value?: number | string;
  timestamp?: string;
  timestring?: string;
  data?: dataItem[];
};

export type totalDailyUsageType = {
  date: string;
  totalEnergyConsumed: number | undefined;
  averageConsumption: number;
  peakConsumption: { value: number; timeString: string };
  data: HourlyGroup[];
};
export type ResultDataType = {
  data: totalDailyUsageType;
  error: string | null;
  loading: boolean;
  refetch?: (params: FetchQuarterlyUsageDataProps) => void;
};

type UsageDataItem = {
  date: string;
  usage: number;
  timestamp: number;
  from: dayjs.Dayjs;
  to: dayjs.Dayjs;
  timeString: string;
  peakValue: boolean;
  value: number;
};


type HourlyGroup = {
  date: string;
  usage?: number;        // in kWh (usage / 1000)
  value?: number;        // same as usage, can be used for charting
  timestring?: string;   // e.g., "Dalle ore 00:00 - alle ore 01:00"
  data?: UsageDataItem[]; // 4 items per group
};


export type dividedDataReturnType = {
  peakConsumption: {
    value: number;        // max hourly usage
    timeString: string;   // range of the peak hour
  };
  dividedIntervalsData: HourlyGroup[];
};

export type UsageFetchResponse = {
  data: {
    date: string;
    totalEnergyConsumed: number;
    averageConsumption: number;
    peakConsumption: { value: number; timeString: string };
    data: EnergyDataProp[];
  } | null;
  error: string | false | null;
  loading: boolean;
};
