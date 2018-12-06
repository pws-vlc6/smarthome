export class SensorData {
    public name: string;
    public current: number;
    public buzzStatus: "Off"|"On";
}

export class lampData {
    public status?: boolean;
    public brightness?: number;
    public colors?: string[];
    public active?: number;
}
