import rawData from './catch-area-name-to-code.json';

export interface Coords {
    latitude: number;
    longitude: number;
}

export class CatchArea {
    public static readonly areas : CatchArea[] = parseAreas();

    readonly code: string;
    readonly name: string;
    readonly coords: Coords;

    constructor(code: string, name: string, coords: Coords){
        this.code = code;
        this.name = name;
        this.coords = coords;
    }

    public static fromCode(areaCode: string): CatchArea | undefined {
        return this.areas.find((ca) => ca.code === areaCode);
    } 
}

function parseAreas(): CatchArea[] {
    return Object.entries(rawData)
        .map(([name, value]) => new CatchArea(value.code, name, parseCoords(value.coords)))
}
function parseCoords(coords: string): Coords {
    let [latitude, longitude] = coords.split(", ");
    return {
        latitude: Number(latitude),
        longitude: Number(longitude)
    }
}

