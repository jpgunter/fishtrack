import { Chart } from "react-google-charts";
import { CreelData, CreelDataRetriever } from "../data/CreelData";
import FishByType from "./FishByType";
import FishByArea from "./FishByArea";
import { FishMap } from "./FishMap";

interface FishChartProps {
    creelDataRetriever?: CreelDataRetriever;
}

export default function FishChart(props : FishChartProps) {
    const creelDataRetriever = props.creelDataRetriever || new CreelDataRetriever();
    const data: CreelData[] = creelDataRetriever.getCreelData();
    return (
        <>
            <h2>Fish By Type</h2>
            <FishByType data={data}/>
            <h2>Fish By Area (fish/angler)</h2>
            <FishByArea data={data}/>
            <h2>Fish Map Heatmap</h2>
            <FishMap />
        </>
    )
}