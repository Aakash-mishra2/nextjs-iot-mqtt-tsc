import dayjs from "dayjs";

export function divideIntoFourGroups(
  data: {
    date: string;
    usage: number;
    timestamp: number;
  }[]
) {
  const groupedData = [];
  const peakConsumption = { value: 0, timeString: "" };

  // 1️⃣ Preprocess each item: add time string from timestamp
  const formattedData = data.map((item) => {
    const from = dayjs.unix(item.timestamp);
    const to = from.add(15, "minute");
    return {
      ...item,
      from: from.toISOString(), // serialize Dayjs to string
      to: to.toISOString(),     // serialize Dayjs to string
      timeString: `${from.format("HH:mm")} - ${to.format("HH:mm")}`,
    };
  });

  // 2️⃣ Now group into chunks of 4 items
  for (let i = 0; i < 24; i++) {
    const chunk = formattedData.slice(i * 4, i * 4 + 4); // 4 items/hour

    if (chunk.length === 4) {
      const totalUsage = chunk.reduce((sum, item) => sum + item.usage, 0);

      // Peak usage object in this chunk
      const peakItem = chunk.reduce(
        (prev, curr) => (curr.usage > prev.usage ? curr : prev),
        chunk[0]
      );

      if (totalUsage > peakConsumption.value) {
        const fromTime = dayjs(peakItem.from);
        const toTime = dayjs(chunk[3].to);
        peakConsumption.value = totalUsage;
        peakConsumption.timeString = `${fromTime.format("HH:mm")} - ${toTime.format("HH:mm")}`;
      }

      // Mark peakValue and prepare final objects
      const updatedChunk = chunk.map((item) => ({
        ...item,
        date: item.date.split('-')[2],
        peakValue: item.timestamp === peakItem.timestamp,
      }));

      const timeString = `Dalle ore ${dayjs(chunk[0].from).format("HH:mm")} - alle ore ${dayjs(chunk[3].to).format("HH:mm")}`;


      groupedData.push({
        date: String(i),
        usage: totalUsage / 1000,
        value: totalUsage / 1000,
        timeString,
        data: updatedChunk,
      });
    }
  }
  const totalHours = 24;
  while (groupedData.length < totalHours) {
    groupedData.push({
      date: "10",
      usage: 24,
      value: 24,
      timeString: "06:15 - 06:30",
      data: []
    });
  }

  return { peakConsumption, dividedIntervalsData: groupedData };
}
