import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import dayjs from "dayjs";
import axios from "axios";
import { dailyEnergyTypes } from "@/utils/types";
import { dummyDailyData } from "@/utils/constants";

const getMonthStartToEnd = (year: number, month: number) => {
  const targetMonth = dayjs(`${year}-${month}-01`);
  const firstDate = targetMonth.startOf("month").format("YYYY-MM-DD");
  const lastDate = targetMonth.endOf("month").format("YYYY-MM-DD");

  return { firstDate, lastDate };
};

type FetchDataParams = {
  serial?: string;
  year: number;
  month: number;
};

export const fetchMonthlyData = createAsyncThunk<
  dailyEnergyTypes[],
  FetchDataParams
>(
  "monthlyUsage/fetchPower",
  async ({ serial = "c2g-57CFACECC", year, month }) => {
    const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
    const authToken = localStorage.getItem('DEVICE_AUTH_TOKEN');
    const { firstDate, lastDate } = getMonthStartToEnd(year, month);

    const options = {
      fromDate: firstDate,
      toDate: lastDate,
      serial: serial,
    };

    const start = dayjs(firstDate);
    const end = dayjs(lastDate);

    const numberOfDays = end.diff(start, "day") + 1;

    const response = await axios.get(`${BASE_URL}/v1/energy/daily-glue`, {
      params: options,
      headers: {
        accept: "application/json",
        "Content-type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const formattedResponse = response.data.map((item: dailyEnergyTypes) => {
      return {
        ...item,
        date: item.formattedDate ? (Number(item?.formattedDate.split("-")[2]) < 10 ? (item?.formattedDate.split("-")[2][1]) : item?.formattedDate.split("-")[2]) : "0",
        formattedDate: item.formattedDate,
        totalActEnergy: (item?.totalActEnergy ? item?.totalActEnergy : 0) / 100,
      };
    });

    while (formattedResponse.length < numberOfDays)
      formattedResponse.push({
        date: "",
        formattedDate: "2025-01-01",
        totalActEnergy: 0,
      });
    return formattedResponse;
  }
);

export type MonthlyState = {
  data: dailyEnergyTypes[];
  loading: boolean;
  error: string | null;
};

const initialState: MonthlyState = {
  data: dummyDailyData,
  loading: false,
  error: null,
};

const monthlySlice = createSlice({
  name: "monthlyData",
  initialState: initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonthlyData.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchMonthlyData.fulfilled,
        (state, action: PayloadAction<dailyEnergyTypes[]>) => {
          state.loading = false;
          state.data = action.payload;
        }
      )
      .addCase(fetchMonthlyData.rejected, (state) => {
        state.loading = false;
        // state.error = action.error.message;
      });
  },
});

export default monthlySlice.reducer;
