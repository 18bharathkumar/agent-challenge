# Component Image Generation

This system automatically generates unique, realistic product photos for IoT components using Google's Generative AI (Imagen).

## Setup

1. Add your Google Generative AI API key to `.env`:
   ```
   GOOGLE_GENERATIVE_AI_API_KEY=your_api_key_here
   ```

2. Get an API key from: https://makersuite.google.com/app/apikey

## How It Works

- When a component card is rendered, it calls `/api/generate-component-image`
- The API generates a realistic product photo using component-specific prompts
- Images are cached in `public/components/` to avoid regenerating
- If generation fails or is slow, falls back to gradient icon

## Component Prompts

Each component type has a tailored prompt for realistic results:
- PIR Sensor: "White dome sensor on blue PCB..."
- Relay Module: "Blue relay component on PCB with terminal blocks..."
- Temperature Sensor: "Silver metal probe with wires..."
- etc.

## Caching

Generated images are saved as:
`public/components/{component_id}.png`

Once generated, images load instantly from cache on subsequent visits.

## Fallback

If image generation fails:
1. Shows loading spinner
2. Falls back to gradient icon with lucide-react
3. Still displays all component information
