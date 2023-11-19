import { Chart } from "react-google-charts";
import { CreelData } from "../data/CreelData";
import FishByType from "./FishByType";
import FishByArea from "./FishByArea";

export default function FishChart() {
    const data: CreelData[] = CreelData.loadData();
    return (
        <>
            <h2>Fish By Type</h2>
            <FishByType data={data}/>
            <h2>Fish By Area (fish/angler)</h2>
            <FishByArea data={data}/>
        </>
    )
}