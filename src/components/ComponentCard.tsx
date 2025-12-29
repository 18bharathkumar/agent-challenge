"use client";
import React from "react";
import { Component } from "@/lib/types/iot-project";
import { getComponentVisual, getComponentPrice, formatPrice } from "@/lib/component-utils";
import { DollarSign } from "lucide-react";

export default function ComponentCard({ component }: { component: Component }) {
    const visual = getComponentVisual(component.id, component.component_type);
    const price = getComponentPrice(component.id);
    const IconComponent = visual.icon;

    return (
        <div className="glass-card rounded-xl p-5 border border-white/10 hover:border-white/20 transition-all group">
            <div className="flex items-start gap-4">
                {/* Component Icon - Always use gradient icon for consistency */}
                <div className={`flex-shrink-0 w-16 h-16 rounded-lg bg-gradient-to-br ${visual.gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <IconComponent className="w-8 h-8 text-white" />
                </div>

                {/* Component Info */}
                <div className="flex-1 min-w-0">
                    {/* Name and Category */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-white mb-1 capitalize">
                                {component.id.replace(/_/g, " ")}
                            </h3>
                            <p className="text-xs text-violet-400 font-medium">{visual.category}</p>
                        </div>

                        {/* Price Badge */}
                        <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 flex-shrink-0">
                            <DollarSign className="w-3 h-3 text-green-400" />
                            <span className="text-sm font-bold text-green-400">{formatPrice(price)}</span>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                        {component.description}
                    </p>

                    {/* Type and Subtype */}
                    <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-1 text-xs rounded-md bg-white/5 text-gray-300 border border-white/10">
                            {component.component_type}
                        </span>
                        {component.subtype && (
                            <span className="px-2 py-1 text-xs rounded-md bg-white/5 text-gray-300 border border-white/10">
                                {component.subtype}
                            </span>
                        )}
                        {component.unit && (
                            <span className="px-2 py-1 text-xs rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                                Unit: {component.unit}
                            </span>
                        )}
                    </div>

                    {/* Pin Connections */}
                    {component.pinConnection && component.pinConnection.length > 0 && (
                        <div className="space-y-1">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Pin Connections</p>
                            <div className="flex flex-wrap gap-2">
                                {component.pinConnection.map((pin, idx) => (
                                    <div
                                        key={idx}
                                        className="px-2 py-1 text-xs rounded bg-slate-800/50 border border-slate-700 font-mono"
                                    >
                                        <span className="text-cyan-400">{pin.name}</span>
                                        <span className="text-gray-500 mx-1">→</span>
                                        <span className="text-fuchsia-400">{pin.connected_to}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
