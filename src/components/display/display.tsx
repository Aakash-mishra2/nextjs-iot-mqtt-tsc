import React from "react";
import dayjs from "dayjs";
import queryString from "query-string";
import { Card } from "@tremor/react";
import { CircularProgress, Typography } from "@mui/material";
import { FaEuroSign } from "react-icons/fa";
import { TbBolt } from "react-icons/tb";
import { FaMoneyBills } from "react-icons/fa6";
import { convertToItalicNumber } from "@/utils/methods";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux";
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
  const billCost = ((value / 1000) * 0.2).toFixed(2);
  return (
    <Card className="w-full max-w-xs p-4  montserrat-custom rounded-[6px] !dark:border-none ring-0 !dark:ring-0 bg-[#F7F8FB] flex-col justify-items-left ">
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
          lineHeight: "27px",
        }}
        className="tracing-wider font-roobert"
      >
        {title}
      </Typography>
      <Typography
        sx={{
          fontWeight: "thin",
          fontSize: "12px",
          lineHeight: "100%",
          letterSpacing: "0%",
          color: grey[600],
        }}
        className="tracing-wider font-roobert"
      >
        {timeString ? `dalle ${timeString.split("-")[0]} alle 
      ${timeString.split("-")[1]}` : " "}
      </Typography>
      <div className="flex flex-col gap-3 justify-items-center mt-4">
        <div className="flex-col gap-1 flex text-semibold">
          <p className="text-sm xss:text-base font-semibold">Hai consumato</p>
          <div className="flex flex-row gap-1 items-center">
            <TbBolt className="text-[#D3135A] font-bold text-md" />

            <div className="flex flex-row gap-0 items-center">
              <Metric
                className="text-md xsm:text-xl sm:text-2xl font-bold font-roobert"
                style={{ color: "black" }}
              >
                {convertToItalicNumber(value, 1000, 2).split(".")[0] ?? "0"}
              </Metric>
              <Metric
                className="font-mono"
                style={{ color: "black", fontWeight: "bolder" }}
              >
                ,
              </Metric>
              <Metric
                className="text-md xsm:text-xl sm:text-2xl font-bold font-roobert -mr-1"
                style={{ color: "black" }}
              >
                {convertToItalicNumber(value, 1000, 2).split(".")[1] ?? "0"}{" "}
                {unit}
              </Metric>
            </div>
          </div>
        </div>

        <div className="flex-col gap-0 flex text-semibold">
          <p className="text-sm xss:text-base font-semibold">Hai speso*</p>
          <div className="flex flex-row gap-2 items-center">
            <FaMoneyBills className="text-[#D3135A] font-bold text-md mt-1" />
            <div className="flex flex-row gap-2 items-baseline">
              <div className="flex flex-row gap-0 items-center">
                <Metric
                  className="md:text-sm xsm:text-xl sm:text-2xl font-bold font-roobert"
                  style={{ color: "black" }}
                >
                  {billCost.split(".")[0]}
                </Metric>
                <Metric
                  className="font-mono"
                  style={{ color: "black", fontWeight: "bolder" }}
                >
                  ,
                </Metric>
                <Metric
                  className="md:text-sm xsm:text-xl sm:text-2xl font-bold font-roobert -mr-1"
                  style={{ color: "black" }}
                >
                  {billCost.split(".")[1]}
                </Metric>
              </div>
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


  const { data: currentDayConsumption, loading: showLoader } = FormatDailyUsageData({
    slug: queryString.stringify({
      date: dayjs().format("YYYY-MM-DD"),
      serial: serialId,
    }),
  });

  const { data: prevDayConsumption, loading: showLoader2 } = FormatDailyUsageData({

    slug: queryString.stringify({
      date: dayjs().subtract(1, "day").format("YYYY-MM-DD"),
      serial: serialId,
    }),
  }
  );
  const prevDay = prevDayConsumption.totalEnergyConsumed ?? 0;
  const currDayConsumption = currentDayConsumption.totalEnergyConsumed ?? 0;
  const timestringCurrDay = currentDayConsumption.data.findLastIndex((item) => item.date.length > 0);

  let difference = 0;
  if (
    currentDayConsumption.totalEnergyConsumed &&
    currentDayConsumption.totalEnergyConsumed > 0 &&
    prevDayConsumption.totalEnergyConsumed &&
    prevDayConsumption.totalEnergyConsumed > 0
  )
    difference = Math.round((currDayConsumption - prevDay) / 100);

  return (
    <div className="flex flex-col gap-4 bg-white px-4 mb-1">
      <div className="flex flex-col gap-4 pt-6 px-2">
        <div className="flex flex-col gap-0">
          <p className="xsm:text-[14px] md:text-md text-base font-medium font-roobert text-[#667790]">
            Andamento consumo
          </p>
          <div className="flex flex-row gap-1 items-baseline text-[#397a5c] ">
            <div className="flex flex-row gap-0 items-baseline">
              <Metric
                className="text-3xl font-black font-roobert tracking-wide"
                style={{ color: "#37785a" }}
              >
                {difference ?? 0}%
              </Metric>
              {/* <FaPercentage className="text-2xl font-black" /> */}
            </div>
            <p className="text-xl font-medium ">kWh</p>
          </div>
        </div>

        {
          (showLoader || showLoader2 || !currentDayConsumption || !prevDayConsumption) ?
            <div className="h-40 w-full flex items-center justify-center text-pink-800">
              <CircularProgress
                sx={{
                  color: '#D3135A', // Custom hex color
                  thickness: 6, // Make it bolder (default is 3.6)
                }}
              />
            </div>
            :
            (
              <>
                <div className="w-full text-black flex flex-row gap-4 justify-between">

                  <ConsumptionDisplay
                    title="Oggi"
                    value={currDayConsumption}
                    timeString={currentDayConsumption?.peakConsumption.timeString ? `00 - ${timestringCurrDay + 1}:00` : ""}
                    unit="kW"
                  />
                  <ConsumptionDisplay
                    title="Ieri"
                    value={prevDay}
                    timeString="00 - 23:59"
                    unit="kW"
                  />
                </div>
                <div className="rounded-[4px] border-2 px-4 py-2 flex flex-row gap-2 border-[#01855d] bg-[#f5fff6] text-black font-roboto items-center">
                  <p className={`text-xs xsss:text-sm xsm:text-md text-black`}>
                    Lo sapevi che questo mese hai consumato il{" "}
                    <b>
                      {Math.abs(difference)} % {difference < 0 ? "in meno" : "in più"}
                    </b>{" "}
                    rispetto a ieri? 🎉
                  </p>
                </div>
              </>
            )
        }
      </div>

      <hr className="text-gray-600 text-md" />

      <p className="text-[#59697e] montserrat-custom text-xs xsss:text-sm xsm:text-md font-bold mx-2 mt-1">
        {" "}
        * Dicitura costo dell’energia. Lorem ipsum dolor sit amet, consectetur
        adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna
        aliqua.{" "}
      </p>
    </div>
  );
};

export default Display;
