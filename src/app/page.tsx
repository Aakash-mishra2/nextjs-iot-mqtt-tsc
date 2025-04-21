"use client";
import dynamic from "next/dynamic";
import Image from "next/image";
import queryString from "query-string";
import { useEffect, useMemo, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { CircularProgress } from "@mui/material";
import { quarterUsageData } from "@/app/types/dailyUsageTypes";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "./redux";
import { Button } from "@tremor/react";
import { fetchDeviceData } from "./redux/deviceSlice";
import { fetchQuarterData as refetch } from "./redux/powerSlice";
import { dummyBarGraph } from "@/utils/constants";
import MeterIcon from "../../public/assets/Bg.png"; //Static pic images
const MonthlyView = dynamic(() => import("@/components/tabs/monthlyview"));   //Monthly view Barchart 
const Navbar = dynamic(() => import("@/components/tabs/Tabs"));   //Display Tabs switcher on click
const Display = dynamic(() => import("@/components/display/display"));  //Daily consumption view tab
const InfoCard = dynamic(() => import("@/components/shared/InfoCard")); //Top component for Device Information
const BarListHero = dynamic(() => import("@/components/BarList/BarListHero"));  //Intervals data to render for Selected Bar
const MonthlyDisplay = dynamic(
  () => import("@/components/display/MonthlyDisplay") //Monthly consumption view tab
);
const ConsumptionCard = dynamic(
  () => import("@/components/progressBar/ConsumptionCard") //Progressbar with Instantaneous Consumption
);
const BarChartHero = dynamic(() => import("@/components/navbar/BarChartHero")); //Hourly consumption bargraph view
const DateSwitcher = dynamic(() => import("@/components/dateSwitch/DateSwitcher")); //Date switcher component 

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const powerData = useSelector((store: RootState) => store.powerData.data);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') ?? process.env.NEXT_PUBLIC_DEVICE_AUTH_TOKEN;

    if (token) {
      localStorage.setItem('DEVICE_AUTH_TOKEN', token);
      dispatch(fetchDeviceData(token)).unwrap().then(() => setLoading(false));
    }

    return (() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const serialId = useSelector(
    (store: RootState) => store.deviceData.data.serial
  ); //device serialId from redux store
  const status = useSelector((store: RootState) => store.deviceData.data.online); //deviceStatus online/offline indicator
  const [view, setView] = useState<string>("day");  //totalDailyConsumption switcher state
  const [displayView, setDisplayView] = useState<string>("day");  //totalMonthlyConsumption switcher state
  const [selectedDate, setselectedDate] = useState<Dayjs>(dayjs().locale("en"));  //active date barchart switche state
  const [selectedBarData, setselectedBarData] = useState<quarterUsageData>(dummyBarGraph.data[0]);  //Barlist data to render on selection
  const [selectedBar, setselectedbar] = useState<string>('0');  //Selected bar index switcher

  const options = useMemo(  //prevent infinite rerenders
    () => ({
      date: dayjs(selectedDate).format("YYYY-MM-DD"),
      serial: serialId,
    }),
    [selectedDate, serialId]
  ); // Recompute only when selectedDate changes

  useEffect(() => { //init initial data fetch on serialized listener  middleware 
    if (options.date && serialId) {
      dispatch(
        refetch({
          slug: queryString.stringify(options),
          options,
        })
      );
    }
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.date, selectedDate, refetch]);

  useEffect(() => {
    if (powerData && powerData.data?.length > 0 && powerData.data[powerData.data.length - 1].value === 0) {

      const lastIndex = powerData.data.findIndex((item) => item.timeString === '') - 1;
      setselectedbar(String(lastIndex ?? 0));
      setselectedBarData(powerData.data[lastIndex ?? powerData.data.length]);
    }
    else {
      setselectedbar("23");
      setselectedBarData(powerData.data[23]);
    }
  }, [powerData]);

  return (
    <div className="bg-[#edf1f5] no-scrollbar">
      <InfoCard />
      {
        status === true ? (
          <>
            <ConsumptionCard />
            {loading ?
              (<div className="h-[60vh] bg-white w-full flex flex-col items-center justify-center text-pink-800">
                <CircularProgress
                  sx={{
                    color: '#D3135A', // Custom hex color
                    thickness: 6, // Make it bolder (default is 3.6)
                  }}
                />
              </div>)
              :
              (<Navbar
                tabHeadings={[
                  {
                    heading: "Tab1",
                    title: "Consumi e spesa",
                  },
                  {
                    heading: "Tab2",
                    title: "Dettaglio dei consumi",
                  },
                ]}
                tabChildComponents={[
                  {
                    id: 1,
                    value: "Tab1",
                    children: (
                      //view switcher for total powerConsumption View
                      <div className="relative">
                        <div className="absolute top-6 z-10 right-4 h-10 bg-[#F7F8FB] p-1 rounded-lg flex flex-row gap-1">
                          <Button
                            onClick={() => setDisplayView("month")}
                            className={`text-md h-8 font-medium rounded-[4px] ${displayView === "month"
                              ? "border-2 border-[#0047CC] text-[#0047CC] bg-white"
                              : "text-gray-900 bg-transparent border-none tracking-wider"
                              }`}
                          >
                            Mese
                          </Button>
                          <Button
                            onClick={() => setDisplayView("day")}
                            className={`text-md font-medium h-8 rounded-[4px] ${displayView === "day"
                              ? "border-2 border-[#0047CC] text-[#0047CC] bg-white"
                              : "text-gray-900 bg-transparent border-none"
                              }`}
                          >
                            Giorno
                          </Button>
                        </div>
                        {displayView === "day" ? <Display /> : <MonthlyDisplay />}
                      </div>
                    ),
                  },
                  {
                    id: 2,
                    value: "Tab2",
                    children: (
                      //view switcher for total consumption barChart View
                      <div>
                        <div className="relative">
                          <div className="absolute top-6 z-10 right-4 h-10 bg-[#F7F8FB] p-1 rounded-lg flex flex-row gap-1">
                            <Button
                              onClick={() => setView("month")}
                              className={`text-md h-8 rounded-[4px] ${view === "month"
                                ? "border-2 border-blue-600 font-medium text-blue-700 bg-white"
                                : "text-gray-900 bg-transparent border-none"
                                }`}
                            >
                              Mese
                            </Button>
                            <Button
                              onClick={() => setView("day")}
                              className={`text-md h-8 rounded-[4px] ${view === "day"
                                ? "border-2 border-blue-600 font-medium text-blue-700 bg-white"
                                : "text-gray-900 bg-transparent border-none"
                                }`}
                            >
                              Giorno
                            </Button>
                          </div>
                        </div>
                        {view === "day" ? (
                          <>
                            <DateSwitcher
                              selectedDate={selectedDate}
                              setSelectedDate={setselectedDate}
                              data={powerData}
                              view={view}
                              setView={setView}
                            />
                            <BarChartHero
                              chartdata={powerData}
                              selectedBar={selectedBar}
                              setselectedbar={setselectedbar}
                              setselectedbardata={setselectedBarData}
                              selectedBarData={selectedBarData}
                            />
                            <BarListHero data={selectedBarData ?? []} />
                          </>
                        ) : (
                          <MonthlyView />     //Monthly view bar chart
                        )}
                      </div>
                    ),
                  },
                ]}
              />)
            }
          </>
        ) : (
          <div className="w-full bg-white flex flex-col gap-2 items-center text-center p-6 pb-12">
            <Image
              src={MeterIcon}
              alt="meter_icon"
              height={180}
              className="bg-white w-fit"
            />
            <div className="p-4 flex flex-col gap-2">

              <p className="text- font-semibold">Sembra che la tua presa plus non sia connessa!</p>
              <p className="text-lg text-[#667790] font-thin">Il dispositivo non riesce a completare la connessione.</p>
            </div>

            <div className="flex flex-col gap-2 items-left w-full text-left">

              <p className="font-bold text-xl">Come posso risolvere il problema?</p>
              <p className="text-md text-[#667790] font-thin">Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. </p>

              <div className="flex flex-col gap-2 p-2 bg-[#F7F8FB] rounded-[6px]">

                <p className="text-lg font-semibold">1. {" "} Lorem ipsum dolor sit amet</p>
                <p className="text-md font-thin text-[#667790]">
                  Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem </p>
              </div>

              <div className="flex flex-col gap-2 p-2 bg-[#F7F8FB] rounded-[6px]">

                <p className="text-lg font-semibold">2. {" "} Lorem ipsum dolor sit amet</p>
                <p className="text-md font-thin text-[#667790]">
                  Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem </p>
              </div>
              <div className="flex flex-col gap-2 p-2 bg-[#F7F8FB] rounded-[6px]">

                <p className="text-lg font-semibold">3. {" "} Lorem ipsum dolor sit amet</p>
                <p className="text-md font-thin text-[#667790]">
                  Lorem ipsum dolor sit amet, consectetur adipisci elit, sed eiusmod tempor incidunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrum exercitationem </p>
              </div>
            </div>

            <hr className="text-[#667790]" />

            <div className="flex flex-col gap-2 items-center">
              <p className="font-bold text-black">Non riesci a risolvere il problema? </p>
              <p className="font-thin text-black text-lg">Contatta l’assistenza cliccando sul
                pulsante che si trova in alto a destra.</p>
            </div>

          </div>
        )
      }

    </div>
  );
}
