"use client";
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  quarterUsageData,
  totalDailyUsageType,
} from "@/app/types/dailyUsageTypes";
import { motion } from "framer-motion";
import { Button } from "@tremor/react";
import { BarChart } from "@/components/shared/BarChart";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface BarchartProps {
  chartdata: totalDailyUsageType;
  selectedBar: string;
  selectedBarData: quarterUsageData;
  setselectedbar: (data: string) => void;
  setselectedbardata: (data: quarterUsageData) => void;
}

const BarChartHero = ({
  chartdata,
  selectedBar,
  setselectedbar,
  setselectedbardata,
  selectedBarData,
}: BarchartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [barWidth, setBarWidth] = useState(7); // Default bar width
  useEffect(() => {
    const updateBarWidth = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth < 640) setBarWidth(5); // Mobile (Small)
      else if (windowWidth < 1024) setBarWidth(7); // Tablet (Medium)
      else setBarWidth(10); // Desktop (Large)
    };

    updateBarWidth(); // Set initial value
    window.addEventListener("resize", updateBarWidth); // Update on resize
    return () => window.removeEventListener("resize", updateBarWidth); // Cleanup
  }, []);

  const handleBarClick = useCallback(
    (date: string) => {
      const newSelectedBarIndex = chartdata?.data.findIndex(
        (bar) => bar.date === date
      );
      if (newSelectedBarIndex !== -1) {
        setselectedbar(date);
        setselectedbardata(chartdata?.data[newSelectedBarIndex]);
      }
    },
    [chartdata, setselectedbar, setselectedbardata]
  );

  // ✅ Fix: Ensure dependencies include `chartdata` and `setselectedbar`
  const handlePrevClick = useCallback(() => {
    const currentIndex = chartdata.data.findIndex(
      (bar) => bar.date === selectedBar
    );
    if (currentIndex > 0) {
      const prevBar = chartdata.data[currentIndex - 1];
      setselectedbar(prevBar?.date ?? "0");
      setselectedbardata(prevBar);
    }
  }, [selectedBar, chartdata, setselectedbar, setselectedbardata]);

  const handleNextClick = useCallback(() => {
    const currentIndex = chartdata.data.findIndex(
      (bar) => bar.date === selectedBar
    );
    if (currentIndex < chartdata.data.length - 1) {
      const nextBar = chartdata.data[currentIndex + 1];
      setselectedbar(nextBar.date ?? "0");
      setselectedbardata(nextBar);
    }
  }, [selectedBar, chartdata, setselectedbar, setselectedbardata]);

  return (
    <div className="relative bg-white">
      <div
        ref={containerRef}
        className="overflow-x-auto h-full !bg-white"
        style={{ scrollbarWidth: "thin" }}
      >
        <div style={{ width: `300px`, minWidth: "100%" }}>
          <motion.div
            key={JSON.stringify(chartdata?.data)} // Ensures re-render when data changes
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <BarChart
              data={chartdata?.data}
              index="date"
              categories={["usage"]}
              barWidth={barWidth}
              showLegend={false}
              showTooltip={false}
              barColor={"#c71c5d"}
              layout="horizontal"
              colors={["blue"]}
              customWrapperStyle={{
                borderRadius: "0.5rem 0.5rem 0 0",
                marginRight: "-4px",
              }}
              handleBarClick={handleBarClick}
              tickGap={0}
              startEndOnly={false}
              showYAxis={true}
              selectedBar={selectedBar}
              enableAnimation={true}
              animationDuration={0.5}
              skipXAxisLabels={true}
              showDottedLines={true}
            />
          </motion.div>
          <div id="switch_hours" className="montserrat-custom w-100 pl-4 mt-2">
            <div className="flex flex-row justify-between">
              <div className="flex flex-col gap-1">
                <div className="text-gray-600 text-sm">Ora della giornata</div>
                <h2 className="text-sm md:text-md text-black font-semibold">
                  {selectedBarData.timestring}
                </h2>
              </div>

              <div id="switch_arrows" className="flex flex-row gap-2 *:mr-4 ">
                <div className="flex items-center gap-4 mt-1">
                  <Button
                    variant="light"
                    size="xs"
                    icon={ChevronLeftIcon}
                    onClick={handlePrevClick}
                    className="text-pink-700 p-2 rounded-md bg-[#F7F8FB]"
                    disabled={selectedBar === chartdata.data[0]?.date}
                  />

                  <Button
                    variant="light"
                    size="xs"
                    icon={ChevronRightIcon}
                    onClick={handleNextClick}
                    className={`text-pink-700 rounded-md p-2 ${Object.keys(
                      chartdata.data[
                      chartdata.data.findIndex(
                        (bar) => bar.date === selectedBar
                      ) + 1
                      ] ?? {}
                    ).length === 0
                      ? "opacity-50 cursor-not-allowed bg-[#C2CDDD] text-[#667790]"
                      : "bg-[#F7F8FB]"
                      }`}
                    disabled={
                      Object.keys(
                        chartdata.data[
                        chartdata.data.findIndex(
                          (bar) => bar.date === selectedBar
                        ) + 1
                        ] ?? {}
                      ).length === 0
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BarChartHero;
