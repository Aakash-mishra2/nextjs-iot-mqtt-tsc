import { quarterUsageData } from "@/app/types/dailyUsageTypes";
import { TbBolt } from "react-icons/tb";
import { Chip, LinearProgress } from "@mui/material";
import { grey } from "@mui/material/colors";
import { Card } from "@tremor/react";
interface BarListHeroProps {
  data: quarterUsageData | undefined;
}

const BarListHero = ({ data }: BarListHeroProps) => {
  const total =
    data?.data?.reduce((sum, item) => sum + (item?.usage ?? 0), 0) ?? 100;

  return (
    <div className="w-full mx-auto p-4 pt-2 bg-white font-roboto pb-12 mb-12">
      {/* Average Consumption Card */}
      <Card className="mt-3 p-4 flex justify-between !ring-transparent items-center bg-slate-200 rounded-lg">
        <span className="text-md itext-black">Consumo orario</span>
        <span className="text-xl font-semibold">{`${Math.round(total).toFixed(0)} Wh`}</span>
      </Card>
      <div className="mt-4 space-y-4">
        {data?.data?.map((item, index) => (Object.keys(item).length > 0 &&
          <div key={index} className="space-y-1">
            {/* Time & Consumption Value */}
            <div className="flex flex-row justify-between space-x-2 mb-2">
              <div className="flex gap-4 items-center">
                <span className="text-sm font-bold">{item?.timeString ?? ""}</span>
                {item.peakValue && (Number(item.peakValue) >= 3000) && (
                  <Chip
                    icon={<TbBolt style={{ color: "red" }} />}
                    label="Superamento soglia"
                    variant="outlined"
                    sx={{
                      borderColor: "red",
                      color: "black",
                      backgroundColor: "#ffecec", // Light red background
                      fontWeight: 400,
                      borderRadius: "8px",
                      paddingX: "2px",
                      paddingY: "0px",
                      height: 24,
                    }}
                  />
                )}
              </div>

              <span className="text-sm font-semibold">{item?.value} Wh</span>
            </div>
            <LinearProgress
              variant="determinate"
              value={item.value ?? 0}
              sx={{
                height: 12,
                borderRadius: 16,
                backgroundColor: grey[300],
                "& .MuiBoxRoot": {
                  height: 20,
                  animation: "none",
                  backgroundColor: grey[500],
                },
                "& .MuiLinearProgress-bar": {
                  backgroundColor: grey[500], // Value bar color (Primary)
                  marginLeft: "2%",
                },
                "& .MuiLinearProgress-bar1": {
                  backgroundColor: "#c71c5d", // Value bar color (Primary)
                  borderRadius: 16,
                  position: "absolute",
                  left: "4lpx",
                  marginY: "4px",
                  transform: "translateX(-2%) !important",
                  maxWidth: "98%",
                  width: `${((item?.value ?? 0) / total) * 100}%`,
                  margin: "0px",
                },
                "& .MuiLinearProgress-dashed": {
                  backgroundColor: "#edf1f5", // Dashed buffer color (Red)
                  backgroundImage: "none",
                },
                "& .MuiLinearProgress-bar2Buffer": {
                  backgroundColor: "#c1cede", // Buffer bar color (Amber)
                  animation: "none",
                },
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarListHero;
