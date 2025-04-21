import dayjs from "dayjs";
import { FaArrowRight } from "react-icons/fa";
import { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Button, Card } from "@tremor/react";
import { convertToItalicNumber } from "@/utils/methods";
import { dummyDailyData } from "@/utils/constants";
import { motion } from "framer-motion";
import { BarChart } from "../shared/BarChart";
import { toTitleCase } from "@/utils/methods";
import { fetchMonthlyData } from "@/app/redux/monthlyUsageSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/app/redux";
//import { dailyEnergyTypes } from "@/utils/types";
import boltPng from "../../../public/assets/Vector 309.png";
import Image from "next/image";
import { dailyEnergyTypes } from "@/utils/types";
import MonthlyStatsView from "./monthlyStats";

const MonthlyView = () => {
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());
  const [selectedMonth, setSelectedMonth] = useState<number>(dayjs().month());
  const [isNextDisabled, setIsNextDisabled] = useState<boolean>(false);
  const [barWidth, setBarWidth] = useState(10); // Default bar width
  const [monthlyData, setMonthlyData] =
    useState<dailyEnergyTypes[]>(dummyDailyData);

  const serial = useSelector(
    (store: RootState) => store.deviceData.data.serial
  );
  const dispatch = useDispatch<AppDispatch>();
  const totalMonthlyConsumption = monthlyData.reduce((sum, item) => sum + (item.totalActEnergy ?? 0), 0);
  useEffect(() => {
    const updateBarWidth = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 640) setBarWidth(6); // Mobile (Small)
      else if (windowWidth < 1024) setBarWidth(7); // Tablet (Medium)
      else setBarWidth(10); // Desktop (Large)
    };

    updateBarWidth(); // Set initial value
    window.addEventListener("resize", updateBarWidth); // Update on resize
    return () => window.removeEventListener("resize", updateBarWidth); // Cleanup
  }, []);

  useEffect(() => {
    const options = {
      serial: serial,
      month: selectedMonth + 1,
      year: selectedYear,
    };

    setIsNextDisabled(
      selectedYear === dayjs().year() && selectedMonth === dayjs().month()
    );

    if (fetchMonthlyData) {
      dispatch(fetchMonthlyData(options))
        .unwrap()
        .then((res) => {
          setMonthlyData(res);
        })
        .catch((err) => {
          console.log("FETCH MONTH DATA ERROR", err);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedYear, selectedMonth]);

  const handlePrevious = () => {
    setSelectedMonth((prevMonth) => {
      if (prevMonth === 0) {
        setSelectedYear((prevYear) => prevYear - 1);
        return 11; // December of the previous year
      } else return prevMonth - 1;
    });
  };

  const handleNext = () => {
    if (isNextDisabled) return;

    setSelectedMonth((prevMonth) => {
      if (prevMonth === 11) {
        setSelectedYear((prevYear) => prevYear + 1);
        return 0; // January of the next year
      } else return prevMonth + 1;
    });
  };

  return (
    <div className="flex flex-col bg-white">
      <div className="flex flex-col gap-0 pt-4 pr-4 pl-4 pb-4 w-100 bg-white">
        <div className="flex flex-row justify-between">
          <div className="flex flex-col gap-0">
            <p className="xsm:text-[14px] md:text-md text-base font-medium font-roobert text-[#667790]">
              Consumo mensile
            </p>
            <span className="flex flex-row items-end -mt-1">
              <p className="text-3xl font-roobert font-bold tracking-tighter">
                {convertToItalicNumber(totalMonthlyConsumption, 1000, 2).split(".")[0]}
              </p>
              <p className="font-mono font-extrabold">,</p>
              <p className="text-3xl font-roobert font-bold tracking-tighter">
                {convertToItalicNumber(totalMonthlyConsumption, 1000, 2).split(".")[1]}
              </p>
              <p className="text-md ml-1 font-roobert font-thin">kWh</p>
            </span>
          </div>
        </div>
        <div className="flex flex-row justify-between mt-2">
          <div className="flex flex-col gap-1">
            <p className="text-gray-500 text-sm font-medium">Mese</p>
            <span className="text-sm xss:text-base md:text-md -mt-1">
              {toTitleCase(dayjs().month(selectedMonth).format("MMMM"))}{" "}
              {dayjs().year(selectedYear).format("YYYY")}
            </span>
          </div>

          <div className={`flex items-center gap-4 mt-1 mr-1`}>
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
      </div>

      <MonthlyStatsView monthlyData={monthlyData} />

      <motion.div
        key={JSON.stringify(monthlyData)} // Ensures re-render when data changes
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-4"
      >
        <BarChart
          data={monthlyData}
          index="date"
          categories={["totalActEnergy"]}
          barWidth={barWidth}
          showLegend={false}
          showTooltip={false}
          barColor={"#c71c5d"}
          layout="horizontal"
          colors={["blue"]}
          customWrapperStyle={{
            borderRadius: "0.5rem 0.5rem 0 0",
            marginRight: "-10px",
          }}
          tickGap={0}
          startEndOnly={false}
          showYAxis={true}
          selectedBar={""}
          enableAnimation={true}
          animationDuration={0.5}
          showSparkPlugs={true}
          skipXAxisLabels={true}
          showDottedLines={false}
        />
      </motion.div>

      <Card className="relative p-4 rounded-lg mt-2 bg-[#1f6cf8] h-full w-8/10 mx-4">
        <div className="flex flex-col gap-2 font-roboto w-full text-white">
          <p className="font-semibold">Ehy, lo sapevi?</p>
          <p className="font-medium xsm:text-sm sm:text-base md:text-md ">
            Nel mese di Marzo hai <b>superato la soglia </b> del consumo per <b>5 giorni </b>.
          </p>

          <div className="flex text-white flex-row gap-4 items-center w-full mt-2">
            <p className="font-medium xsm:text-sm sm:text-base md:text-md ">
              Scopri l&apos;offerta che abbiamo pensato per te
            </p>
            <FaArrowRight className="font-medium text-white text-md" />
          </div>
          <Image
            className="absolute top-4 h-20 w-30 md:h-80 md:w-30 right-0 z-40 bg-transparent"
            src={boltPng}
            alt="bolt_image"
          />
        </div>
      </Card>
    </div>
  );
};

export default MonthlyView;
