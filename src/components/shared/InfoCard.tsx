"use client";
import Image from "next/image";
import { useSelector } from "react-redux";
import { Card, Text, Title, Flex } from "@tremor/react/dist";
import PowerOutlinedIcon from "@mui/icons-material/PowerOutlined";
import MeterIcon from "../../../public/assets/meter_Icon.png";
import { TbCircleFilled } from "react-icons/tb";
import { RootState } from "@/app/redux";

const InfoCard = () => {
  const serialId = useSelector(
    (store: RootState) => store.deviceData.data.serial
  );
  const status = useSelector(
    (store: RootState) => store.deviceData.data.online
  );
  return (
    <>
      <div className="bg-[#C81D5E] h-fit p-4 min-w-[100vw] ring-none dark:ring-none">
        <Card className="bg-white rounded-[4px] p-4 px-5 font-roobert !ring-0 !dark:ring-0">
          <Title className="text-lg text-black font-medium mb-2" style={{ fontWeight: '500' }}>
            La mia Presa Plus
          </Title>

          <div className="flex flex-row gap-4 h-fit font-roobert">
            <Image src={MeterIcon} className="w-20 h-24 mt-1" height={180} alt="meter_icon" />
            <div className="flex flex-col gap-1 mt-1">
              <Flex justifyContent="start" alignItems="center" className="mt-2">
                <PowerOutlinedIcon
                  className="font-thin text-black text-[2px]"
                />
                <div className="text-sm flex flex-col ml-2">
                  <p className="text-[#667790] font-roboto text-base ">
                    Numero seriale
                  </p>
                  <Text className="text-sm font-thin font-roboto ">{`${serialId ?? ""
                    }`}</Text>
                </div>
              </Flex>

              <Flex
                justifyContent="start"
                alignItems="center"
                className="mt-1 gap-1 ml-1"
              >
                {status ? (
                  <TbCircleFilled className="text-[#1F6CF9] rounded-full w-4 h-4" />
                ) : (
                  <TbCircleFilled className="text-[#ED0529] rounded-full w-4 h-4" />
                )}
                <div className="flex flex-col gap-1 text-xs ml-2">
                  <p className="text-[#667790] font-roboto text-base">
                    Stato connessione
                  </p>
                  <p
                    className={` font-thin text-md text-black font-roboto -mt-1`}
                  >
                    {status ? "Connessa" : "Non-connessa"}
                  </p>
                </div>
              </Flex>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default InfoCard;
