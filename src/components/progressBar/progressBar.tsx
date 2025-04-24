"use client";
import LinearProgress from "@mui/material/LinearProgress";
import { Box, Typography } from "@mui/material";
import { FaCheckCircle } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { Metric } from "@tremor/react";
import { convertToItalicNumber } from "@/utils/methods";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux";
import { useRouter } from "next/navigation";

type CustomProgressProps = {
  instantPower?: number;
  value: number;
  serial: string;
};

const CustomLinearProgress = ({ value = 0 }: CustomProgressProps) => {
  //const dispatch = useDispatch<AppDispatch>();
  const bkgColor =
    value < 3000 ? (value < 2500 ? "#41875c" : "#F5B500") : "#ED0529";
  const bkgBanner = value < 2500 ? "#f5fff6" : "#fbe9e9";
  const percent = Math.round((value / 4000) * 100);
  const contractPower = useSelector(
    (store: RootState) => store.podData.data.contractPower
  );
  const router = useRouter();

  return (
    <div className="flex flex-col relative bg-transparent">
      <div className="bg-white rounded-[6px] p-2 px-4 pb-4">
        <div className="flex flex-row gap-2 items-end mt-2 md:mb-4 mb-2">
          <div className="flex flex-row gap-0 items-end">
            <span className="flex flex-row items-end -mt-1">
              <Metric
                className="text-3xl font-roobert font-bold tracking-tighter"
                style={{ color: bkgColor }}
              >
                {convertToItalicNumber(value, 1000, 2).split(".")[0]}
              </Metric>
              <Metric
                className="font-mono"
                style={{ color: bkgColor, fontWeight: "bolder" }}
              >
                ,
              </Metric>
              <Metric
                className="text-3xl font-roobert font-bold tracking-normal"
                style={{ color: bkgColor }}
              >
                {convertToItalicNumber(value, 1000, 2).split(".")[1]}
              </Metric>
            </span>
          </div>
          <Metric className="text-black text-3xl font-medium ">
            di {contractPower / 1000}{" "}
          </Metric>
          <p className="text-black text-lg ">kW</p>
        </div>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: "fit-content",
            borderRadius: 16,
            backgroundColor: "#eff2f6",
            width: "95%",
            marginLeft: "10px",
          }}
        >
          <LinearProgress
            variant="buffer"
            value={value ?? 0}
            valueBuffer={80}
            sx={{
              height: 24,
              borderRadius: 20,
              overflow: "hidden",
              "& .MuiBoxRoot": {
                height: 50,
                animation: "none",
              },
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#eff2f6",
                marginLeft: "1%",
                position: "relative",
              },
              "& .MuiLinearProgress-bar1": {
                backgroundColor: bkgColor,
                borderRadius: 16,
                position: "absolute",
                marginY: "4px",
                transform: "translateX(-2%) !important",
                maxWidth: "98%",
                width: `${percent}%`,
                left: value >= 2500 ? "2%" : "1%",
              },
              "& .MuiLinearProgress-dashed": {
                backgroundColor: "#eff2f6",
                backgroundImage: "none",
              },
              "& .MuiLinearProgress-bar2Buffer": {
                backgroundColor: "#eff2f6",
                animation: "none",
              },
            }}
          />
        </Box>
        <Box
          className="font-roboto"
          sx={{
            position: "relative",
            width: "100%",
            fontFamily: "roboto",
            paddingBottom: "3.5rem", // Prevents overlap with alert box
          }}
        >
          {/* Dots */}
          <Box
            className="absolute w-full"
            sx={{
              top: "-18px",
              zIndex: 1,
            }}
          >
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: value === 0 ? "black" : "white",
                borderRadius: "50%",
                position: "absolute",
                left: {
                  xsm: "6%",
                  xsss: "7%",
                  xss: "7%",
                  xs: "7%",
                  sm: "6%",
                  md: "6%",
                  lg: "6%",
                  xl: "6%",
                  "2xl": "6%",
                },
              }}
            />
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: value < 2500 ? "black" : "white",
                borderRadius: "50%",
                position: "absolute",
                left: {
                  xsm: "52%",
                  xsss: "52%",
                  xss: "48%",
                  xs: "48%",
                  sm: "47%",
                  md: "47%",
                  lg: "47%",
                  xl: "46%",
                  "2xl": "46%",
                },
              }}
            />
            <Box
              sx={{
                width: 5,
                height: 5,
                backgroundColor: value < 3000 ? "black" : "white",
                borderRadius: "50%",
                position: "absolute",
                left: {
                  xsm: "78%",
                  xsss: "78%",
                  xss: "78%",
                  xs: "80%",
                  sm: "81%",
                  md: "81%",
                  lg: "81%",
                  xl: "82%",
                },
              }}
            />
          </Box>

          {/* Labels */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
              marginTop: "4px",
              marginBottom: "8px",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* 0 kW */}
            <Box
              sx={{
                position: "absolute",
                left: {
                  xsm: "6%",
                  xsss: "7%",
                  xss: "7%",
                  xs: "8%",
                  sm: "8%",
                  md: "8%",
                  lg: "8%",
                  xl: "9%",
                  "2xl": "9%",
                },
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography fontSize={15} fontWeight="bold">
                |
              </Typography>
              <p className="text-xs xsm:text-sm font-bold sm:text-sm md:text-lg">
                0 kw
              </p>
              <p className="text-xsm xsm:text-xsm mt-1 xs:text-xs sm:w-full font-medium sm:text-base ">
                Inattività
              </p>
            </Box>

            {/* 2.5 kW */}
            <Box
              sx={{
                position: "absolute",
                left: {
                  xsm: "43%",
                  xsss: "43%",
                  xss: "43%",
                  xs: "48%",
                  sm: "48%",
                  md: "48%",
                  lg: "48%",
                  xl: "48%",
                  "2xl": "48%",
                },
                transform: "translateX(-50%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography fontSize={14} fontWeight="bold">
                |
              </Typography>
              <p className="text-xs xsm:text-sm font-bold sm:text-sm md:text-lg">
                2,5 kw
              </p>
              <p className="text-xsm xsm:px-2 xs:text-xs sm:text-md font-medium mt-1">
                Soglia del tuo piano
              </p>
            </Box>

            {/* 3 kW */}
            <Box
              sx={{
                position: "absolute",
                left: {
                  xsm: "75%",
                  xsss: "76%",
                  xss: "76%",
                  xs: "77%",
                  sm: "78%",
                  md: "78%",
                  lg: "78%",
                  xl: "78%",
                  "2xl": "78%",
                },
                transform: "translateX(-42%)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <Typography fontSize={15} fontWeight="bold">
                |
              </Typography>
              <p className="text-xs xsm:text-sm font-bold sm:text-sm md:text-lg">
                3 kw
              </p>
              <p className="text-xss xsm:text-xsm mt-1 font-medium xs:text-xs w-28 sm:w-full sm:text-md">
                Soglia massima
              </p>
            </Box>
          </Box>
        </Box>
      </div>
      <hr />
      <div
        className={`rounded-[4px] border-2 mt-4 px-4 py-2 flex flex-row gap-4 bg-white text-black font-roboto items-center`}
        style={{ borderColor: bkgColor, background: bkgBanner }}

        onClick={() => router.push('/tempo')}
      >
        {value < 2500 ? (
          <FaCheckCircle
            className={`font-bold p-1 w-6 h-6 xss:w-8 xss:h-8 rounded-full  text-green-800`}
          />
        ) : value < 3000 ? (
          <IoWarning
            className={`font-bold p-1 w-6 h-6 xss:w-8 xss:h-8 rounded-full  text-yellow-500`}
          />
        ) : (
          <IoWarning
            className={`font-bold w-6 h-6 xss:w-8 xss:h-8 rounded-full  text-[#ee5126]`}
          />
        )}
        {value < 2500 ? (
          <p className={`text-xs xsss:text-sm xsm:text-md text-black`}>
            {" "}
            La potenza attuale della tua Presa Plus rispetta la soglia del tuo
            piano 👍
          </p>
        ) : value < 3000 ? (
          <p className={`text-sm xsss:text-sm xsm:text-md text-[${bkgColor}]`}>
            {" "}
            Stai raggiungendo il limite di utilizzo.
          </p>
        ) : value < 3100 ? (
          <p className={` text-xs xsss:text-sm xsm:text-md text-[${bkgColor}]`}>
            {" "}
            <b>Hai superato il limite di utilizzo.</b> Riduci il consumo di
            energia elettrica per evitare l’interruzione della fornitura.
          </p>
        ) : (
          <p className={`text-xs xsss:text-sm text-[${bkgColor}]`}>
            {" "}
            <b>Attenzione! Hai superato il limite di utilizzo.</b> La tua
            fornitura di energia verrà interrotta entro 2 minuti.
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomLinearProgress;
