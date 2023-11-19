import Chart from "react-google-charts";
import { CreelData } from "../data/CreelData";
import { groupBy } from "lodash";

interface FishByTypeProps {
    data: CreelData[];
}

export default function FishByArea({data}: FishByTypeProps) {

    const headings = ["Date"];
    const marineAreas = new Set(data.map(d => d.marineArea));

    marineAreas.forEach(ma => headings.push(ma));

    const dateGroups = groupBy(data, (d) => d.date);

    const chartData = [];
    chartData.push(headings);
    Object.keys(dateGroups).sort().forEach(date => {
        let dateData = dateGroups[date];
        let chartRow :[any] = [date];
        marineAreas.forEach((marineArea) => {
            let marineAreaData = dateData.find(d => d.marineArea === marineArea);
            let fishPerAngler = marineAreaData?.fishPerAngler
            chartRow.push(fishPerAngler || 0);
        })
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


    return (
        <Chart
            chartType={"LineChart"}
            data={sortedChartData}
            width="100%"
            height="400px"
            legendToggle
            options={options}
        />
    )
}