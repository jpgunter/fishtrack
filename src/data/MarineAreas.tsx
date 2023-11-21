import { CreelData, CreelDataRetriever } from "./CreelData";
import { GeoJsonObject } from 'geojson';

import dataFromFile from './marineAreas.json';
import { max } from "lodash";

interface GeoHeatProps {
    start: Date;
    end: Date;
}

export class MarineAreas {

    private rawData: any;
    private creelData: CreelData[];

    constructor(rawData: any, creelData: CreelData[]) {
        this.rawData = rawData;
        this.creelData = creelData;

        this.colorArea(); //set all colors to min;
    }

    public toGeoJson() : GeoJsonObject {
        return this.rawData as GeoJsonObject;
    }

    public heat({start, end}: GeoHeatProps): MarineAreas {
        const codeToCount: Map<string, number> = this.creelData
            .filter((creelData) => creelData.date >= start && creelData.date <= end)
            .reduce<Map<string, number>>((codeToCount, creelData) => {
                const code = creelData.marineArea;
                const count = creelData.chinook + creelData.coho + creelData.pink;
                const prevCount = codeToCount.get(code) || 0;
                codeToCount.set(code, prevCount + count);
                return codeToCount;
            }, new Map());

        const maxCount = max(Array.from<number>(codeToCount.values())) || 1;

        codeToCount.forEach((count, code) => {
            this.colorArea(code, count/maxCount);
        });

        return this;
    }

    private colorArea(code?: string, count?: number) {
        this.rawData["features"].forEach((feature: any) => {
            if(code !== undefined && feature["properties"]["code"] !== code){
                return;
            }
            const color = this.getColor(count || 0);
            feature["properties"]["color"] = color;
        });
    }

    private getColor(value: number): string {
        let h = (1.0 - value) * 255
        return `hsl(${h},100%,50%)`;
    }
}

export class MarineAreasRetriever {
    private static initialData = dataFromFile;

    private creelDataRetriever: CreelDataRetriever;

    constructor(creelDataRetriever?: CreelDataRetriever) {
        this.creelDataRetriever = creelDataRetriever || new CreelDataRetriever();
    }

    public getMarineAreasGeo(geoHeat?:GeoHeatProps) : GeoJsonObject {
        let marineAreas = new MarineAreas(MarineAreasRetriever.initialData, this.creelDataRetriever.getCreelData());
        if(geoHeat) {
            marineAreas = marineAreas.heat(geoHeat);
        }
        return marineAreas.toGeoJson();
    }
}