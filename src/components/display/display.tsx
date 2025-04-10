import React from "react";
import dayjs from "dayjs";
import queryString from "query-string";
import { Card } from "@tremor/react";
import { Typography } from "@mui/material";
import { FaEuroSign } from "react-icons/fa";
import { TbBolt } from "react-icons/tb";
import { FaMoneyBills } from "react-icons/fa6";
import { convertToItalicNumber } from "@/utils/methods";
import { useSelector } from "react-redux";
import { RootState } from "@/app/store";
import { Metric } from "@tremor/react";
import { grey } from "@mui/material/colors";
import FormatDailyUsageData from "@/app/api/quarterlyUsageAPI";
interface ConsumptionDisplayProps {
  title: string;
  value: number;
  timeString: string;
  unit?: string;
}

const ConsumptionDisplay: React.FC<ConsumptionDisplayProps> = ({
  title,
  value,
  timeString,
  unit,
}) => {
  return (
    <Card className="w-full max-w-xs p-4 py-6 montserrat-custom rounded-xl !dark:border-none ring-0 !dark:ring-0 bg-[#ecf2f6] flex-col justify-items-left ">
      <Typography
        variant="h5"
        sx={{
          fontSize: {
            xsm: "0.5rem", // mobile screen size (xs)
            xs: "1rem",
            sm: "1.5rem", // small screens (sm and above)
            md: "2rem", // medium screens (md and above)
          },
          fontWeight: "bold",
          fontStyle: "brand",
          wordSpacing: "2px",
        }}
        className="tracing-wider"
      >
        {title}
      </Typography>
      {/* <p className="text-sm mt-1 text-gray-600">{`dalle ${
        timeString.split("-")[0]
      } alle 
      ${timeString.split("-")[1]}`}</p> */}
      <Typography
        sx={{
          fontWeight: "thin",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: grey[600],
        }}
        className="tracing-wider"
      >
        {`dalle ${timeString.split("-")[0]} alle 
      ${timeString.split("-")[1]}`}
      </Typography>
      <div className="flex flex-col gap-2 justify-items-center mt-4">
        <div className="flex-col gap-1 flex text-semibold">
          <p className="tex-sm font-thin">Hai consumato</p>
          <div className="flex flex-row gap-1">
            <TbBolt className="text-pink-800 font-bold text-2xl" />
            <p className="text-lg sm:text-2xl font-black ">
              {convertToItalicNumber(value, 1000, 2) ?? "0"} {unit}
            </p>
          </div>
        </div>

        <div className="flex-col gap-0 flex text-semibold">
          <p className="tex-sm font-thin">Hai speso*</p>
          <div className="flex flex-row gap-2 items-center">
            <FaMoneyBills className="text-2xl font-bold text-pink-600" />
            <div className="flex flex-row gap-1 items-baseline">
              <p className=" text-lg sm:text-2xl font-black ">
                {((value / 1000) * 0.2).toFixed(2)}
              </p>
              <FaEuroSign className="text-md md:text-lg font-bold mt-2 text-black" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

const Display = () => {
  const serialId = useSelector(
    (store: RootState) => store.deviceData.data.serial
  );

  const { data: currentDayConsumption } = FormatDailyUsageData({
    slug: queryString.stringify({
      date: dayjs().format("YYYY-MM-DD"),
      serial: serialId,
    }),
  });

  const { data: prevDayConsumption } = FormatDailyUsageData({
    slug: queryString.stringify({
      date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      serial: serialId,
    }),
  });

  const prevDay = prevDayConsumption.totalEnergyConsumed ?? 0;
  const currDayConsumption = currentDayConsumption.totalEnergyConsumed ?? 0;
  let difference = 0;
  if (
    currentDayConsumption.totalEnergyConsumed &&
    currentDayConsumption.totalEnergyConsumed > 0 &&
    prevDayConsumption.totalEnergyConsumed &&
    prevDayConsumption.totalEnergyConsumed > 0
  ) {
    difference = Math.ceil(((currDayConsumption - prevDay) / prevDay) * 100);
  }
  return (
    <div className="flex flex-col gap-4 bg-white px-4">
      <div className="flex flex-col gap-0 pt-8 px-2">
        <p className="xsm:text-[14px] md:text-md text-base font-medium font-roobert text-[#667790]">
          Andamento consumo
        </p>
        <div className="flex flex-row gap-1 items-baseline text-[#397a5c] ">
          <div className="flex flex-row gap-0 items-baseline">
            <Metric
              className="text-xll font-black font-roobert"
              style={{ color: "#37785a" }}
            >
              {difference ?? 0}%
            </Metric>
            {/* <FaPercentage className="text-2xl font-black" /> */}
          </div>
          <p className="text-xl font-medium ">kWh</p>
        </div>
      </div>
      <div className="w-full text-black flex flex-row gap-4 justify-between pb-4">
        <ConsumptionDisplay
          title="Ieri"
          value={prevDay}
          timeString="00:00 - 24:00"
          unit="kW"
        />
        <ConsumptionDisplay
          title="Oggi"
          value={currDayConsumption}
          timeString={`00:00 - ${
            prevDayConsumption?.peakConsumption?.timeString.split("-")[1]
          }`}
          unit="kW"
        />
      </div>
      <div className="rounded-lg border-2 mt-4 p-4 flex flex-row gap-2 border-[#01855d] bg-[#f5fff6] text-black font-roboto items-center">
        <p>
          Lo sapevi che questo mese hai consumato il{" "}
          <b>
            {Math.abs(difference)} % {difference < 0 ? "in meno" : "in più"}
          </b>{" "}
          rispetto allo scorso mese? 🎉
        </p>
      </div>

      <hr className="text-gray-600 text-md" />

      <p className="text-[#667890] montserrat-custom text-sm font-bold mx-2">
        {" "}
        * Dicitura costo dell’energia. Lorem ipsum dolor sit amet, consectetur
        adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna
        aliqua.{" "}
      </p>
    </div>
  );
};

export default Display;
