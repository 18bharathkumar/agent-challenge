export interface Pin {
    name: string;          
    connected_to: string;  
}

export interface Component {
    id: string;
    title: string;         
    type: "sensor" | "output";
    subtype?: "analog" | "digital";
    pins: Pin[];
    unit?: string; 
    description: string;
}


