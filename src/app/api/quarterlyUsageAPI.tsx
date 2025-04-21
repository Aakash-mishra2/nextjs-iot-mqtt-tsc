//import axios from "axios";
import dayjs from "dayjs";
import axios from "axios";
import { useState, useEffect, useCallback } from "react";
import {
  FetchQuarterlyUsageDataProps,
  QuarterlyAPIResponseType,
  ResultDataType,
  totalDailyUsageType,
} from "../types/dailyUsageTypes";
import { EnergyDataProp } from "@/utils/types";
import { dividedDataReturnType } from "../types/dailyUsageTypes";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
const AUTH_TOKEN = localStorage.getItem('DEVICE_AUTH_TOKEN');
const QUARTER_USAGE_URL = "v1/energy/quarter";

/**
 * Fetches power usage data by 15 minute intervals based on the provided slug and options.
 * @param {Object} props - The function parameters.
 * @param {string} props.slug - The unique identifier for fetching usage data.
 * @param {Object} [props.options={}] - Optional parameters for the API request.
 * @returns {Promise<UsageData[]>} A promise that resolves to an array of usage data objects.
 */

const FetchUsageByIntervals = ({
  slug,
  options = {},
}: FetchQuarterlyUsageDataProps) => {
  const [data, setData] = useState<QuarterlyAPIResponseType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = useCallback(
    async ({ slug, options = {} }: FetchQuarterlyUsageDataProps) => {
      try {
        const url = `${BASE_URL}/${QUARTER_USAGE_URL}?${slug}`;
        const response = await axios.get(url, {
          params: options,
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${AUTH_TOKEN}`,
          },
        });

        setLoading(() => true);
        setError(null);
        const responseData = response?.data;
        setData(responseData);
      } catch (err) {
        if (err instanceof Error) setError(err.message);
      }
      setLoading(() => false);
    },
    []
  );

  useEffect(() => {
    if (fetchData)
      fetchData({
        slug: slug,
        options: options,
      });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { data, error, loading, refetch: fetchData };
};

const FormatDailyUsageData = ({
  slug,
  options = {},
}: FetchQuarterlyUsageDataProps): ResultDataType => {
  const { data, error, loading, refetch } = FetchUsageByIntervals({
    slug,
    options,
  });

  if (!data || !data?.data) {
    return {
      data: {
        date: "",
        totalEnergyConsumed: 0,
        averageConsumption: 0,
        peakConsumption: { value: 0, timeString: "" },
        data: []
      },
      error: error || null,
      loading,
    };
  }

  function divideIntoFourGroups(
    data: {
      date: string;
      usage: number;
      timestamp: number;
    }[]
  ): dividedDataReturnType {
    const groupedData = [];
    const peakConsumption = { value: 0, timeString: "" };

    // 1️⃣ Preprocess each item: add time string from timestamp
    const formattedData = data.map((item) => {
      const from = dayjs.unix(item.timestamp);
      const to = from.add(15, "minute");
      return {
        ...item,
        from: from.toISOString(),
        to: to.toISOString(),
        timeString: `${from.format("HH:mm")} - ${to.format("HH:mm")}`,
      };
    });

    // 2️⃣ Now group into chunks of 4 items
    for (let i = 0; i < 24; i++) {
      const chunk = formattedData.slice(i * 4, i * 4 + 4); // 4 items/hour

      if (chunk.length === 4) {
        const totalUsage = chunk.reduce((sum, item) => sum + item.usage, 0);

        // Peak usage object in this chunk
        const peakItem = chunk.reduce(
          (prev, curr) => (curr.usage > prev.usage ? curr : prev),
          chunk[0]
        );

        if (totalUsage > peakConsumption.value) {
          peakConsumption.value = totalUsage;
          peakConsumption.timeString = `${dayjs(peakItem.from).format("HH:mm")} - ${dayjs(chunk[3].to).format("HH:mm")}`;
        }

        // Mark peakValue and prepare final objects
        const updatedChunk = chunk.map((item) => ({
          ...item,
          date: item.date.split('-')[2],
          peakValue: item.timestamp === peakItem.timestamp,
        }));

        const timeString = `Dalle ore ${dayjs(chunk[0].from).format("HH:mm")} - alle ore ${dayjs(chunk[3].to).format("HH:mm")}`;

        groupedData.push({
          date: String(i),
          usage: totalUsage / 1000,
          value: totalUsage / 1000,
          timeString,
          data: updatedChunk,
        });
      }
    }
    const totalHours = 24;
    while (groupedData.length < totalHours) {
      groupedData.push({
        date: "10",
        usage: 24,
        value: 24,
        timeString: "06:15 - 06:30",
        data: [{
          date: '1',
          usage: 210,
          value: 210,
          timeString: "06:15 - 06:30",
          peakValue: true,
          from: "",
          to: "",
          timestamp: 0,
        }]
      });
    }

    return { peakConsumption, dividedIntervalsData: groupedData };
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

  return { data: dividedData, error: error || null, loading, refetch };
};

export default FormatDailyUsageData;
