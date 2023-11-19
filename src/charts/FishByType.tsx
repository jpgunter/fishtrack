import Chart from "react-google-charts";
import { CreelData } from "../data/CreelData";
import { FilterSelector } from "./FilterSelector";
import { useState } from "react";

interface FishByTypeProps {
    data: CreelData[];
}

export default function FishByType({data}: FishByTypeProps) {
    const [selectedFish, setSelectedFish] = useState("all");

    const chartData : any[] = [];
    const headings = ["Date"];
    const allSelected = selectedFish === "all";

    const selectedHeadings = allSelected ? ["coho", "chinook", "pink"] : [selectedFish];
    headings.push(...selectedHeadings);
    chartData.push(headings);

    data.forEach(creelData => {
        let chartRow : any[] = [creelData.date];
        switch(selectedFish){
            case "all":
                chartRow.push(creelData.coho, creelData.chinook, creelData.pink)
                break;
            case "coho":
                chartRow.push(creelData.coho);
                break;
            case "chinook":
                chartRow.push(creelData.chinook);
                break;
            case "pink":
                chartRow.push(creelData.pink);
                break;
        }
        chartData.push(chartRow);
    }); 

    const sortedChartData = chartData.sort((a,b) => {
        let aDate = new Date(a[0]);
        let bDate = new Date(b[0]);
        return bDate.getTime() - aDate.getTime();
    })

    const options = {
        hAxis: {
          format: "dd-MM-yyyy HH:MM",
          ticks: [
            new Date("2023-01-01 00:00:00"),
            new Date("2023-02-01 00:00:00"),
            new Date("2023-03-01 00:00:00"),
            new Date("2023-04-01 00:00:00"),
            new Date("2023-05-01 00:00:00"),
            new Date("2023-06-01 00:00:00"),
            new Date("2023-07-01 00:00:00"),
            new Date("2023-08-01 00:00:00"),
            new Date("2023-09-01 00:00:00"),
            new Date("2023-10-01 00:00:00"),
            new Date("2023-11-01 00:00:00"),
            new Date("2023-12-01 00:00:00"),
          ]
        }
      };

    const handleFishSelect = (value: string) => {
        console.log("selected fish:" + value);
        setSelectedFish(value);
    }

    return (
        <>
        <FilterSelector values={["all","coho", "chinook", "pink"]} initialSelected="all" onSelect={handleFishSelect} />
        <Chart
            chartType={"LineChart"}
            data={chartData}
            width="100%"
            height="400px"
            legendToggle
            options={options}
        />
        </>
    )
}