"use client";
import React, { useState, useRef } from "react";
import { Component } from "@/lib/types/iot-project";

interface CircuitDiagramProps {
    components: Component[];
}

interface Position {
    x: number;
    y: number;
}

export default function CircuitDiagram({ components }: CircuitDiagramProps) {
    const [hoveredWire, setHoveredWire] = useState<string | null>(null);
    const [draggingComponent, setDraggingComponent] = useState<string | null>(null);
    const [componentPositions, setComponentPositions] = useState<Map<string, Position>>(new Map());
    const svgRef = useRef<SVGSVGElement>(null);
    const dragStartPos = useRef<Position>({ x: 0, y: 0 });

    // SVG dimensions
    const width = 1000;
    const height = 600;

    // ESP32 board position (center-left)
    const esp32X = 300;
    const esp32Y = height / 2;
    const esp32Width = 200;
    const esp32Height = 100;

    // Pin positions on ESP32 (left and right sides)
    const esp32Pins = {
        left: [] as Position[],
        right: [] as Position[],
    };

    // Create pin positions along the sides of ESP32
    const pinsPerSide = 15;
    const pinSpacing = esp32Height / (pinsPerSide + 1);

    for (let i = 0; i < pinsPerSide; i++) {
        esp32Pins.left.push({
            x: esp32X - esp32Width / 2,
            y: esp32Y - esp32Height / 2 + (i + 1) * pinSpacing,
        });
        esp32Pins.right.push({
            x: esp32X + esp32Width / 2,
            y: esp32Y - esp32Height / 2 + (i + 1) * pinSpacing,
        });
    }

    // Get default component position with better spacing to avoid collisions
    const getDefaultComponentPosition = (index: number, total: number): Position => {
        // Vertical stacking on the right side with good spacing
        const startX = 700;
        const startY = 100;
        const spacingY = 150; // Increased spacing to avoid overlap

        return {
            x: startX,
            y: startY + index * spacingY,
        };
    };

    // Get component position (use custom position if set, otherwise default)
    const getComponentPosition = (componentId: string, index: number): Position => {
        if (componentPositions.has(componentId)) {
            return componentPositions.get(componentId)!;
        }
        return getDefaultComponentPosition(index, components.length);
    };

    // Get wire color based on pin name
    const getWireColor = (pinName: string): string => {
        const lowerPin = pinName.toLowerCase();
        if (lowerPin.includes("vcc") || lowerPin.includes("3v3") || lowerPin.includes("5v")) {
            return "#DC2626"; // Red for power
        }
        if (lowerPin.includes("gnd")) {
            return "#6B7280"; // Gray for ground (better visibility)
        }
        if (lowerPin.includes("sda")) {
            return "#10B981"; // Green for SDA
        }
        if (lowerPin.includes("scl")) {
            return "#3B82F6"; // Blue for SCL
        }
        if (lowerPin.includes("tx")) {
            return "#F59E0B"; // Orange for TX
        }
        if (lowerPin.includes("rx")) {
            return "#8B5CF6"; // Purple for RX
        }
        // Default signal colors
        return "#22D3EE"; // Cyan for other signals
    };

    // Get ESP32 pin position for a connection
    const getESP32PinPosition = (pinIndex: number, isRightSide: boolean): Position => {
        if (isRightSide) {
            return esp32Pins.right[pinIndex % esp32Pins.right.length];
        } else {
            return esp32Pins.left[pinIndex % esp32Pins.left.length];
        }
    };

    // Draw a wire connection
    const drawWire = (
        start: Position,
        end: Position,
        color: string,
        wireId: string,
        label: string
    ) => {
        const isHovered = hoveredWire === wireId;
        const strokeWidth = isHovered ? 4 : 2.5;

        // Create path with right angles (like real wires)
        const midX = (start.x + end.x) / 2;
        const path = `M ${start.x} ${start.y} L ${midX} ${start.y} L ${midX} ${end.y} L ${end.x} ${end.y}`;

        return (
            <g key={wireId}>
                <path
                    d={path}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="none"
                    opacity={isHovered ? 1 : 0.85}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    onMouseEnter={() => setHoveredWire(wireId)}
                    onMouseLeave={() => setHoveredWire(null)}
                    className="transition-all cursor-pointer"
                    style={{ filter: isHovered ? 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' : 'none' }}
                />
                {isHovered && (
                    <text
                        x={midX}
                        y={start.y - 10}
                        fill="#FFF"
                        fontSize="13"
                        fontWeight="600"
                        textAnchor="middle"
                        className="pointer-events-none"
                        style={{ textShadow: '0 0 4px rgba(0,0,0,0.8)' }}
                    >
                        {label}
                    </text>
                )}
            </g>
        );
    };

    // Handle drag start
    const handleMouseDown = (e: React.MouseEvent<SVGGElement>, componentId: string) => {
        if (!svgRef.current) return;

        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        setDraggingComponent(componentId);
        dragStartPos.current = { x: svgP.x, y: svgP.y };
        e.stopPropagation();
    };

    // Handle dragging
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (!draggingComponent || !svgRef.current) return;

        const svg = svgRef.current;
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;
        const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

        setComponentPositions(prev => {
            const newPositions = new Map(prev);
            newPositions.set(draggingComponent, { x: svgP.x, y: svgP.y });
            return newPositions;
        });
    };

    // Handle drag end
    const handleMouseUp = () => {
        setDraggingComponent(null);
    };

    return (
        <div className="w-full overflow-x-auto bg-slate-900/30 rounded-xl p-4">
            <div className="mb-3 flex items-center gap-2 text-xs text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
                </svg>
                <span>💡 <strong>Drag components</strong> to reposition them and avoid wire overlap</span>
            </div>

            <svg
                ref={svgRef}
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                className="mx-auto"
                style={{ maxWidth: "100%", height: "auto", cursor: draggingComponent ? 'grabbing' : 'default' }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Background grid pattern */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#ffffff08" strokeWidth="1" />
                    </pattern>

                    {/* ESP32 Board Gradient */}
                    <linearGradient id="esp32BoardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#1e40af", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#3b82f6", stopOpacity: 1 }} />
                    </linearGradient>

                    {/* Component Gradient */}
                    <linearGradient id="compGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#dc2626", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#ef4444", stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                <rect width={width} height={height} fill="url(#grid)" />

                {/* Draw all wires first (behind components) */}
                {components.map((comp, compIndex) => {
                    const compPos = getComponentPosition(comp.id, compIndex);
                    const isRightSide = compPos.x > esp32X;

                    return comp.pinConnection.map((pin, pinIndex) => {
                        const esp32Pin = getESP32PinPosition(pinIndex + compIndex * 3, isRightSide);
                        const color = getWireColor(pin.name);
                        const wireId = `${comp.id}-${pin.name}-${pinIndex}`;

                        // Component pin position (left side of component box)
                        // Add vertical spacing to prevent wire overlap
                        const pinSpacingOffset = 25; // Increased spacing between pins
                        const compPinPos: Position = {
                            x: compPos.x - 60,
                            y: compPos.y - 30 + pinIndex * pinSpacingOffset,
                        };

                        return drawWire(esp32Pin, compPinPos, color, wireId, `${pin.name} → ${pin.connected_to}`);
                    });
                })}

                {/* ESP32 Board */}
                <g>
                    {/* Board body */}
                    <rect
                        x={esp32X - esp32Width / 2}
                        y={esp32Y - esp32Height / 2}
                        width={esp32Width}
                        height={esp32Height}
                        fill="url(#esp32BoardGradient)"
                        stroke="#1e40af"
                        strokeWidth="3"
                        rx="4"
                    />

                    {/* Chip in center */}
                    <rect
                        x={esp32X - 40}
                        y={esp32Y - 25}
                        width={80}
                        height={50}
                        fill="#0f172a"
                        stroke="#475569"
                        strokeWidth="2"
                        rx="2"
                    />

                    {/* Pin headers (left side) */}
                    {esp32Pins.left.slice(0, 8).map((pin, i) => (
                        <circle key={`pin-l-${i}`} cx={pin.x} cy={pin.y} r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                    ))}

                    {/* Pin headers (right side) */}
                    {esp32Pins.right.slice(0, 8).map((pin, i) => (
                        <circle key={`pin-r-${i}`} cx={pin.x} cy={pin.y} r="3" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                    ))}

                    {/* USB port */}
                    <rect
                        x={esp32X - 15}
                        y={esp32Y - esp32Height / 2 - 8}
                        width={30}
                        height={8}
                        fill="#94a3b8"
                        stroke="#475569"
                        strokeWidth="1"
                        rx="1"
                    />

                    {/* Board label */}
                    <text
                        x={esp32X}
                        y={esp32Y - 5}
                        fill="#fff"
                        fontSize="14"
                        fontWeight="700"
                        textAnchor="middle"
                    >
                        ESP32
                    </text>
                    <text
                        x={esp32X}
                        y={esp32Y + 10}
                        fill="#93c5fd"
                        fontSize="10"
                        textAnchor="middle"
                    >
                        DevKit v1
                    </text>

                    {/* Board name label below */}
                    <text
                        x={esp32X}
                        y={esp32Y + esp32Height / 2 + 20}
                        fill="#e2e8f0"
                        fontSize="13"
                        fontWeight="600"
                        textAnchor="middle"
                    >
                        ESP32 Board
                    </text>
                </g>

                {/* Draw components (draggable) */}
                {components.map((comp, index) => {
                    const pos = getComponentPosition(comp.id, index);
                    const boxWidth = 120;
                    const boxHeight = 80;
                    const isDragging = draggingComponent === comp.id;

                    // Determine component color based on type
                    let componentColor = "#DC2626"; // Default red
                    if (comp.component_type === "sensor") {
                        componentColor = "#DC2626"; // Red for sensors
                    } else if (comp.component_type === "output") {
                        componentColor = "#7C3AED"; // Purple for outputs
                    }

                    return (
                        <g
                            key={comp.id}
                            onMouseDown={(e) => handleMouseDown(e, comp.id)}
                            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                            opacity={isDragging ? 0.7 : 1}
                        >
                            {/* Component box (simulating module board) */}
                            <rect
                                x={pos.x - boxWidth / 2}
                                y={pos.y - boxHeight / 2}
                                width={boxWidth}
                                height={boxHeight}
                                fill={componentColor}
                                stroke={isDragging ? "#ffffff" : "#1f2937"}
                                strokeWidth={isDragging ? 3 : 2}
                                rx="4"
                                opacity="0.9"
                            />

                            {/* Sensor/component icon area */}
                            <circle
                                cx={pos.x}
                                cy={pos.y - 10}
                                r={18}
                                fill="#1f2937"
                                stroke={componentColor}
                                strokeWidth="2"
                            />

                            {/* Pin connectors */}
                            {comp.pinConnection.slice(0, 4).map((pin, pinIdx) => (
                                <rect
                                    key={`${comp.id}-pin-${pinIdx}`}
                                    x={pos.x - boxWidth / 2 - 6}
                                    y={pos.y - 30 + pinIdx * 25}
                                    width={6}
                                    height={12}
                                    fill="#fbbf24"
                                    stroke="#d97706"
                                    strokeWidth="1"
                                    rx="1"
                                />
                            ))}

                            {/* Component name */}
                            <text
                                x={pos.x}
                                y={pos.y + 25}
                                fill="#fff"
                                fontSize="11"
                                fontWeight="600"
                                textAnchor="middle"
                                className="pointer-events-none"
                            >
                                {comp.id.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                            </text>

                            {/* Component type badge */}
                            <rect
                                x={pos.x - 25}
                                y={pos.y + 30}
                                width={50}
                                height={14}
                                fill="rgba(0,0,0,0.5)"
                                rx="7"
                            />
                            <text
                                x={pos.x}
                                y={pos.y + 40}
                                fill="#22d3ee"
                                fontSize="8"
                                fontWeight="600"
                                textAnchor="middle"
                                className="pointer-events-none"
                            >
                                {comp.component_type.toUpperCase()}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Enhanced Legend */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-white/10">
                <h4 className="text-sm font-semibold text-white mb-3">Wire Color Guide</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#DC2626' }}></div>
                        <span className="text-gray-300">VCC (Power)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#6B7280' }}></div>
                        <span className="text-gray-300">GND (Ground)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#10B981' }}></div>
                        <span className="text-gray-300">SDA (I2C)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#3B82F6' }}></div>
                        <span className="text-gray-300">SCL (I2C)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-1 rounded-full" style={{ backgroundColor: '#22D3EE' }}></div>
                        <span className="text-gray-300">Signal</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
