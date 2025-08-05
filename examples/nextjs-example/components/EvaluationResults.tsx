'use client'

import {
    METRIC_ICONS,
    getMetricColor,
    formatMetricValue,
    type EvaluationResult,
    type RpgConfig
} from '@/lib/rpg-sdk'
import type { ModifierApplication } from 'mod-engine'

interface EvaluationResultsProps {
    result: EvaluationResult<RpgConfig> | null
    initialMetrics: Record<string, number>
}

export function EvaluationResults({ result, initialMetrics }: EvaluationResultsProps) {
    const metrics = result?.metrics || initialMetrics

    const getMetricIcon = (metric: string) => {
        return METRIC_ICONS[metric as keyof typeof METRIC_ICONS] || '📊'
    }

    return (
        <div className="space-y-6">
            {/* Final Metrics */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">📊 Final Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                    {Object.entries(metrics).map(([metric, value]) => {
                        const initialValue = initialMetrics[metric] || 0;
                        const currentNumericValue = value as number;
                        const currentValue = formatMetricValue(currentNumericValue);

                        // Only show changes if result exists AND values are actually different
                        // Use Number() to ensure type consistency and handle precision issues
                        const initialNum = Number(initialValue);
                        const currentNum = currentNumericValue;
                        const hasChanged = result && Math.abs(currentNum - initialNum) > 0.001; // Use small threshold for floating point comparison
                        const isIncrease = hasChanged && currentNum > initialNum;
                        const isDecrease = hasChanged && currentNum < initialNum;

                        return (
                            <div key={metric} className="metric-card">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg">{getMetricIcon(metric)}</span>
                                        <span className="font-medium">{metric}</span>
                                    </div>
                                    <div className="text-right">
                                        <div className={`text-2xl font-bold ${getMetricColor(currentNumericValue)}`}>
                                            {currentValue}
                                        </div>
                                        {hasChanged && (
                                            <div className="text-xs flex items-center justify-end space-x-1">
                                                <span className="text-gray-500">{initialValue}</span>
                                                <span className={`font-medium ${isIncrease ? 'text-green-600' : isDecrease ? 'text-red-600' : 'text-gray-500'
                                                    }`}>
                                                    {isIncrease ? '+' : ''}
                                                    {Math.round((currentNumericValue - initialValue) * 100) / 100}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Applied Modifiers */}
            {result && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">
                        🔧 Applied Modifiers ({result.applied.length})
                    </h2>

                    {result.applied.length === 0 ? (
                        <p className="text-gray-500 italic">No modifiers were applied to this item.</p>
                    ) : (
                        <div className="space-y-3">
                            {result.applied.map((application: ModifierApplication<RpgConfig>, index: number) => (
                                <div key={index} className="border rounded p-3 bg-gray-50">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center space-x-2">
                                            <span>{getMetricIcon(application.modifier.metric)}</span>
                                            <span className="font-medium">{application.modifier.metric}</span>
                                            <span className="text-sm text-gray-600">
                                                {application.modifier.operation}
                                            </span>
                                            <span className="font-bold text-blue-600">
                                                {application.modifier.value}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Priority: {application.modifier.priority || 10}
                                        </div>
                                    </div>

                                    <div className="text-sm text-gray-600">
                                        <span className="font-medium">Result:</span>
                                        <span className="ml-1">
                                            {Math.round(application.before * 100) / 100} → {' '}
                                            {Math.round(application.after * 100) / 100}
                                        </span>
                                        {application.modifier.source && (
                                            <span className="ml-3 px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                                                {application.modifier.source}
                                            </span>
                                        )}
                                    </div>

                                    {application.modifier.conditions && (
                                        <div className="mt-2 text-xs text-blue-600 bg-blue-50 p-2 rounded">
                                            <strong>Condition:</strong> {JSON.stringify(application.modifier.conditions)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Raw Data */}
            {result && (
                <details className="bg-white rounded-lg shadow">
                    <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-50">
                        🔍 Raw Evaluation Data (Click to expand)
                    </summary>
                    <div className="p-4 border-t bg-gray-50">
                        <pre className="text-xs text-gray-600 overflow-auto">
                            {JSON.stringify(result, null, 2)}
                        </pre>
                    </div>
                </details>
            )}
        </div>
    )
}