import React from "react";
import dayjs, { Dayjs } from "dayjs";
import "dayjs/locale/it"; // Import Italian locale
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"; // Tremor uses Heroicons // Tremor Button component
import { totalDailyUsageType } from "@/app/types/dailyUsageTypes";
import { convertToItalicNumber } from "@/utils/methods";
import { Button } from "@tremor/react";
dayjs.locale("it"); // Set locale globally

type DateSwitcherProps = {
  selectedDate: Dayjs;
  setSelectedDate: (date: Dayjs) => void;
  data?: totalDailyUsageType;
  view: string;
  setView: (prev: string) => void;
};

const DateSwitcher = ({
  selectedDate,
  setSelectedDate,
  data,
}: DateSwitcherProps) => {
  const today = dayjs().startOf("day");
  const isNextDisabled = selectedDate.isSame(today, "day");

  const handlePrevious = () => setSelectedDate(selectedDate.subtract(1, "day"));

  const handleNext = () => {
    if (!isNextDisabled) {
      setSelectedDate(selectedDate.add(1, "day"));
    }
  };
  return (
    <div className="flex flex-col gap-0 pt-4 pr-4 pl-4 pb-6 w-100 bg-white">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col gap-0">
          <p className="xsm:text-[14px] md:text-md text-base font-medium font-roobert text-[#667790]">
            Consumo giornaliero
          </p>
          <span className="flex flex-row items-end -mt-1">
            <p className="text-3xl font-roobert font-bold tracking-tighter">
              {
                convertToItalicNumber(
                  data?.totalEnergyConsumed ?? 0,
                  1000,
                  2
                ).split(".")[0]
              }
            </p>
            <p className="font-mono font-extrabold">,</p>
            <p className="text-3xl font-roobert font-bold tracking-tighter">
              {
                convertToItalicNumber(
                  data?.totalEnergyConsumed ?? 0,
                  1000,
                  2
                ).split(".")[1]
              }
            </p>
            <p className="text-md ml-1 font-roobert font-thin">kWh</p>
          </span>
        </div>
      </div>
      <div className="flex flex-row justify-between w-full pt-2 mb-4 bg-white font-roboto">
        <div className="flex flex-col gap-0 items-left">
          <span className="text-[#667790] text-sm font-medium">Giorno</span>

          <span className="text-sm xss:text-base md:text-md ">
            {selectedDate.locale("it").format("dddd D MMMM YYYY")}
          </span>
        </div>
        <div className={`flex items-center gap-4 mt-1`}>
          <Button
            variant="light"
            size="xs"
            icon={ChevronLeftIcon}
            onClick={handlePrevious}
            className="text-[#C2185B] p-2 rounded-[4px] cursor-not-allowed bg-[#F7F8FB]"
          />

          <Button
            variant="light"
            size="xs"
            icon={ChevronRightIcon}
            onClick={handleNext}
            className={`text-pink-700 p-2 rounded-[4px] cursor-not-allowed ${isNextDisabled
              ? "opacity-50 bg-[#C2CDDD] text-[#667790]"
              : "bg-[#F7F8FB]"
              }`}
            disabled={isNextDisabled}
          />
        </div>
      </div>
      <div
        id="total_consumption_stats"
        className="flex font-roboto flex-row justify-between w-full gap-4 pb-2 mb-1 bg-white border-b-2 border-gray-300 items-center"
      >
        <p className="text-sm font-medium xss:text-base md:text-lg text-black">
          Media di consumo giornaliero
        </p>
        <span className="flex flex-row items-end -mt-1">
          <p className="text-base md:text-md font-roobert tracking-tighter">
            {
              convertToItalicNumber(
                data?.averageConsumption ?? 0,
                1000,
                2
              ).split(".")[0]
            }
          </p>
          <p className="font-mono font-extrabold ">,</p>
          <p className="text-base md:text-md font-roobert tracking-tighter -ml-0">
            {
              convertToItalicNumber(
                data?.averageConsumption ?? 0,
                1000,
                2
              ).split(".")[1]
            }{" "}
            kWh
          </p>
        </span>
      </div>
      <div
        id="peak_consumption_stats"
        className="flex montserrat-custom items-center flex-row gap-8 justify-between w-full bg-white pt-2 mt-1 "
      >
        <div className="flex flex-col gap-0">
          <p className="text-sm font-medium xss:text-base md:text-md text-black">
            Orario di consumo massimo giornalerio
          </p>
          <p className="text-sm md:text-base text-gray-500 font-light">
            Orario {data?.peakConsumption.timeString ?? ""}
          </p>
        </div>

        <p className="text-base md:text-md w-16 md:w-18 -md:ml-0 font-semibold font-roobert">
          {data?.peakConsumption.value} Wh
        </p>
      </div>
    </div>
  );
};
export default DateSwitcher;
