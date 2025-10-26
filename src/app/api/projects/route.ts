import { NextRequest, NextResponse } from 'next/server';
import { createProject, projectsStore } from '../../../lib/projects';
import { IotProjectSchema } from '../../../lib/types/iot-project';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Require at least a title on the incoming payload for a nicer error message.
        if (!body || !body.title || String(body.title).trim() === '') {
            return NextResponse.json({ error: 'title is required' }, { status: 400 });
        }

        // Let the server-side createProject normalize defaults (id, arrays) and
        // validate against the full zod schema. This allows clients to send a
        // minimal payload (title + optional fields) and avoid supplying an id.
        const project = createProject(body);
        return NextResponse.json(project.toJSON(), { status: 201 });
    } catch (err: any) {
        // If zod validation failed inside createProject, return details to client.
        if (err?.issues) {
            return NextResponse.json({ error: 'invalid payload', details: err.format?.() ?? err.issues }, { status: 400 });
        }
        return NextResponse.json({ error: 'failed to create project' }, { status: 500 });
    }
}

export async function GET() {
    try {
        // Return the stored projects as plain JSON
        const list = projectsStore.map((p) => p.toJSON());
        return NextResponse.json(list, { status: 200 });
    } catch (err) {
        return NextResponse.json({ error: 'failed to list projects' }, { status: 500 });
    }
}
