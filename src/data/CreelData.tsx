import rawData from "./data.json";

export interface CreelDataJson {
    marine_area: string;
    date: number;
    anglers: number;
    chinook: number;
    coho: number;
    pink: number;
}

export class CreelData {

    readonly marineArea: string;
    readonly date : Date;
    readonly anglers: number;
    readonly chinook: number;
    readonly coho: number;
    readonly pink: number;
    readonly fishPerAngler: number;

    constructor(json: CreelDataJson) {
        this.marineArea = json.marine_area;
        this.date = new Date(json.date*1000);
        this.anglers = json.anglers;
        this.chinook = json.chinook;
        this.coho = json.coho;
        this.pink = json.pink;
        this.fishPerAngler = (this.chinook + this.coho + this.pink) / this.anglers;
    }
}

export class CreelDataRetriever {
    static data = this.loadData();
    
    public getCreelData(): CreelData[] {
        return CreelDataRetriever.data;
    }

    static loadData(): CreelData[]{
        let jsonData : CreelDataJson[] = rawData.data;
        return jsonData.map(d => new CreelData(d));
    }

}