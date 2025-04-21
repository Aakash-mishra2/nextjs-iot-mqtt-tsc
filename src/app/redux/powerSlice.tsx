import { dummyBarGraph } from "@/utils/constants";
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  dividedDataReturnType,
  FetchQuarterlyUsageDataProps,
  ResultDataType,
  totalDailyUsageType,
} from "../types/dailyUsageTypes";
import { UsageFetchResponse } from "../types/dailyUsageTypes";

import { EnergyDataProp } from "@/utils/types";
import { divideIntoFourGroups } from "./utils/methods";
import axios from "axios";
import queryString from "query-string";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const QUARTER_USAGE_URL = "v1/energy/quarter";

/**
 * Fetches power usage data by 15 minute intervals based on the provided slug and options.
 * @param {Object} props - The function parameters.
 * @param {string} props.slug - The unique identifier for fetching usage data.
 * @param {Object} [props.options={}] - Optional parameters for the API request.
 * @returns {Promise<UsageData[]>} A promise that resolves to an array of usage data objects.
 */

const FetchUsageByIntervals = async ({
  slug,
  options = {},
}: FetchQuarterlyUsageDataProps): Promise<UsageFetchResponse> => {
  const url = `${BASE_URL}/${QUARTER_USAGE_URL}?${slug}`;
  const authToken = localStorage.getItem('DEVICE_AUTH_TOKEN');
  try {
    const response = await axios.get(url, {
      params: options,
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const responseData = response?.data;
    return { data: responseData, error: false, loading: false };
  } catch (err) {
    if (err instanceof Error)
      return {
        data: null,
        error: "Unexpected Error",
        loading: false,
      };
  }

  return {
    data: null,
    error: "Unknown error occurred",
    loading: false,
  };
};

export const fetchQuarterData = createAsyncThunk<
  ResultDataType,
  FetchQuarterlyUsageDataProps
>("dailyUsage/fetchPower", async ({ options, authToken }) => {
  const { data, error, loading } = await FetchUsageByIntervals({
    slug: queryString.stringify(options ?? {}),
    authToken,
  });

  if (!data || error) {
    return {
      data: {
        date: "",
        totalEnergyConsumed: 0,
        averageConsumption: 0,
        peakConsumption: { value: 0, timeString: "" },
        data: [],
      },
      error: error || null,
      loading: false,
    };
  }

  const chartData = data?.data.map((item: EnergyDataProp) => ({
    date: item.formattedDate,
    usage: item.currQuartActEnergy || 0,
    timestamp: item.measureTS - 16200,
    value: item.currQuartActEnergy || 0,
  }));

  const { peakConsumption, dividedIntervalsData }: dividedDataReturnType =
    divideIntoFourGroups(chartData);

  const averageConsumption = data?.totalEnergyConsumed
    ? data?.totalEnergyConsumed / 24
    : 0;

  const dividedData: totalDailyUsageType = {
    date: data?.date,
    totalEnergyConsumed: data?.totalEnergyConsumed,
    averageConsumption: averageConsumption,
    peakConsumption: peakConsumption,
    data: dividedIntervalsData,
  };

  return { data: dividedData, error: null, loading };
});
interface PowerSliceState {
  data: totalDailyUsageType;
  loading: boolean;
  error: string | null;
}

const initialState: PowerSliceState = {
  data: dummyBarGraph,
  loading: false,
  error: null,
};

const powerSlice = createSlice({
  name: "powerData",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuarterData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchQuarterData.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.error = action.payload.error;
      })
      .addCase(fetchQuarterData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "";
      });
  },
});

export default powerSlice.reducer;
