import { Output, Trigger,Automation,Component} from '../types/iot-project'

export class IoTProject {
    id: string;
    title: string;
    outputs:Output[];
    triggers:Trigger[];
    automations:Automation[];
    components:Component[];
    code:string;

    constructor(params: {
        id: string;
        title: string;
        outputs: Output[];
        triggers: Trigger[];
        automations?: Automation[];
        components:Component[];
        code:string;
    }) {
        this.id = params.id ?? `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        this.title = params.title ?? 'Untitled Project';
        this.outputs = params.outputs??[]
        this.triggers = params.triggers??[]
        this.automations = params.automations??[]
        this.components = params.components??[]
        this.code = params.code??'';
    }


    
}
