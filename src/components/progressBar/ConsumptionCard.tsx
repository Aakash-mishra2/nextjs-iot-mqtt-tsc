"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import dayjs from "dayjs";
import { Card, Badge, Text } from "@tremor/react/dist";
import { InfoIcon } from "lucide-react";
import Paho from "paho-mqtt";
import { meterEventDummyData } from "@/utils/constants";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux";
import { toTitleCase } from "@/utils/methods";
import { mqttOptions } from "@/utils/constants";
const DrawerModal = dynamic(
  () => import("../../components/drawer/DrawerModal")
);
const CustomLinearProgress = dynamic(
  () => import("../progressBar/progressBar")
);

const ConsumptionCard = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [iotData, setIotData] = useState(meterEventDummyData);
  const serial = useSelector(
    (store: RootState) => store.deviceData.data.serial
  );
  useEffect(() => {
    const clientId = crypto.randomUUID().replace(/-/g, "");
    const client = new Paho.Client(mqttOptions.url, clientId);
    client.connect({
      useSSL: true,
      timeout: 10,
      mqttVersion: 4,
      userName: mqttOptions.username,
      password: "",
      onSuccess: function () {
        client.subscribe(`c2/d/${serial}`); //serial from chain-2-gate
      },
    });
    client.onMessageArrived = function (message) {
      if (
        JSON.parse(message.payloadString).Chain2Data?.type === "CF21" ||
        "CF51"
      ) {
        const messageRecieved = JSON.parse(message.payloadString).Chain2Data;
        setIotData(messageRecieved);
        return { iotData: JSON.parse(message.payloadString).Chain2Data };
      } else return {};
    };
  }, [serial]);
  return (
    <>
      <Card className="bg-transparent font-roboto rounded-sm p-4 px-2 my-0 !ring-0 !dark:ring-0">
        <div className="flex flex-col p-2 justify-between">
          <div className="flex justify-between">
            <p className="text-[20px] md:text-lg text-black font-roobert font-medium">
              Consumo istantaneo
            </p>
            <Badge className="text-black text-base sm:text-md md:text-xl rounded-lg mb-1 ring-[#B2E6CD] ring-1 bg-[#f5fff6] px-2">
              TEMPO REALE
            </Badge>
          </div>
          <div className="flex flex-row gap-2 items-center mt-0 font-roobert">
            <Text className="text-[12px] md:text-xl text-black font-medium mt-0">
              {`${toTitleCase(
                dayjs(iotData?.Ts, "YYYY/MM/DD HH:mm:ss").format(
                  "dddd D MMMM YYYY, [ore] HH:mm"
                )
              ).replace("Ore", "ore")} - `}
              <strong className="text-gray-700 font-roobert tracking-tight">
                Fascia F1
              </strong>
            </Text>

            <InfoIcon
              className="font-bold text-[#D3135A] text-sm xsm:text-md w-3 h-3"
              onClick={() => setIsModalOpen(() => true)}
            />
          </div>
        </div>
        <div className="flex flex-col rounded-md px-2 mt-2">
          <CustomLinearProgress
            serial={serial}
            value={iotData?.Payload?.InstantPower ?? 0}
          />
        </div>
      </Card>
      <DrawerModal
        isOpen={isModalOpen}
        setIsOpen={setIsModalOpen}
        className="bg-white pb-12"
      />
    </>
  );
};

export default ConsumptionCard;
