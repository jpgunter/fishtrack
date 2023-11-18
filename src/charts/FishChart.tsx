import { Chart } from "react-google-charts";
import data from '../data/data.json';
import { format } from "path";

export default function FishChart() {
    const chartData = [];
    chartData.push(["Date", "coho", "chinook", "pink"]);
    data.data.forEach(element => {
        let date = new Date(element.date*1000);
        chartData.push([date, element.coho, element.chinook, element.pink]);
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
            data={chartData}
            width="100%"
            height="400px"
            legendToggle
            options={options}
        />
    )
}