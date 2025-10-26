import type { IotProject as IotProjectType } from './types/iot-project';
import { IotProjectSchema } from './types/iot-project';

/**
 * IotProject class (runtime representation).
 * The constructor accepts an object matching the zod-inferred `IotProject` type
 * (or a partial of it) and produces a normalized instance.
 */
export class IotProject {
    id: string;
    title: string;
    components: IotProjectType['components'];
    triggers?: IotProjectType['triggers'];
    automations?: IotProjectType['automations'];
    outputs: IotProjectType['outputs'];

    constructor(input: Partial<IotProjectType> | IotProjectType) {
        const now = new Date().toISOString();
        // Accept input that may be partial and fill sensible defaults
        this.id = (input as any)?.id ?? `proj_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
        this.title = (input as any)?.title ? String((input as any).title).trim() : 'Untitled Project';
        this.components = (input as any)?.components ?? [];
        this.triggers = (input as any)?.triggers ?? undefined;
        this.automations = (input as any)?.automations ?? undefined;
        this.outputs = (input as any)?.outputs ?? [];
    }

    toJSON(): IotProjectType {
        // Return an object that satisfies the IotProject zod type as best as possible
        return {
            id: this.id,
            title: this.title,
            components: this.components,
            triggers: this.triggers ?? [],
            automations: this.automations ?? [],
            outputs: this.outputs,
        } as IotProjectType;
    }

    /** Helper that validates this instance against the schema and returns the parsed value */
    validate(): IotProjectType {
        const parsed = IotProjectSchema.parse(this.toJSON());
        return parsed;
    }
}

// In-memory store for demo/testing purposes.
export const projectsStore: IotProject[] = [];

/** Create a new project from input (zod type or partial), validate, store it, and return the instance. */
export function createProject(input: Partial<IotProjectType> | IotProjectType): IotProject {
    const p = new IotProject(input);
    // Validate before storing to ensure required fields conform to schema
    p.validate();
    projectsStore.push(p);
    return p;
}
