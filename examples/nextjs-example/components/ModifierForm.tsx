'use client'

import {
    ATTRIBUTE_DEFINITIONS,
    getDefaultValueForAttribute,
    type ModifierForm,
    type AttributeKey
} from '@/lib/rpg-sdk'

interface ModifierFormComponentProps {
    modifier: ModifierForm
    onChange: (modifier: ModifierForm) => void
    onRemove: () => void
}

export function ModifierFormComponent({ modifier, onChange, onRemove }: ModifierFormComponentProps) {
    const updateModifier = (updates: Partial<ModifierForm>) => {
        onChange({ ...modifier, ...updates })
    }

    // Use SDK attribute definitions

    // Get the appropriate input component for the condition value
    const renderConditionValueInput = () => {
        if (!modifier.condition) return null

        const attrType = ATTRIBUTE_DEFINITIONS[modifier.condition.attribute]
        if (!attrType) return (
            <input
                type="text"
                value={modifier.condition.value || ''}
                onChange={(e) => updateModifier({
                    condition: { ...modifier.condition!, value: e.target.value }
                })}
                className="w-full p-1 border rounded text-xs"
                placeholder="Enter value..."
            />
        )

        switch (attrType.kind) {
            case 'boolean':
                return (
                    <label className="flex items-center">
                        <input
                            type="checkbox"
                            checked={modifier.condition.value === true}
                            onChange={(e) => updateModifier({
                                condition: { ...modifier.condition!, value: e.target.checked }
                            })}
                            className="mr-1"
                        />
                        <span className="text-xs">True</span>
                    </label>
                )

            case 'enum':
                return (
                    <select
                        value={modifier.condition.value || ''}
                        onChange={(e) => updateModifier({
                            condition: { ...modifier.condition!, value: e.target.value }
                        })}
                        className="w-full p-1 border rounded text-xs"
                    >
                        <option value="">Select...</option>
                        {(attrType as { kind: 'enum'; values: string[] }).values.map((val: string) => (
                            <option key={val} value={val}>{val}</option>
                        ))}
                    </select>
                )

            case 'number': {
                const numType = attrType as { kind: 'number'; min: number; max: number }
                return (
                    <input
                        type="number"
                        value={modifier.condition.value || ''}
                        min={numType.min}
                        max={numType.max}
                        onChange={(e) => updateModifier({
                            condition: { ...modifier.condition!, value: parseFloat(e.target.value) || 0 }
                        })}
                        className="w-full p-1 border rounded text-xs"
                        placeholder={`${numType.min}-${numType.max}`}
                    />
                )
            }

            case 'string':
                return (
                    <input
                        type="text"
                        value={modifier.condition.value || ''}
                        onChange={(e) => updateModifier({
                            condition: { ...modifier.condition!, value: e.target.value }
                        })}
                        className="w-full p-1 border rounded text-xs"
                        placeholder="Enter text..."
                    />
                )

            default:
                return (
                    <input
                        type="text"
                        value={modifier.condition.value || ''}
                        onChange={(e) => updateModifier({
                            condition: { ...modifier.condition!, value: e.target.value }
                        })}
                        className="w-full p-1 border rounded text-xs"
                        placeholder="Enter value..."
                    />
                )
        }
    }

    return (
        <div className="border rounded p-4 bg-gray-50">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-gray-900">Modifier</h4>
                <button
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-700 text-sm"
                >
                    Remove
                </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs font-medium mb-1">Metric</label>
                    <select
                        value={modifier.metric}
                        onChange={(e) => updateModifier({ metric: e.target.value as any })}
                        className="w-full p-2 border rounded text-sm"
                    >
                        <option value="Health">Health</option>
                        <option value="Strength">Strength</option>
                        <option value="Speed">Speed</option>
                        <option value="Mana">Mana</option>
                        <option value="Damage">Damage</option>
                        <option value="Defense">Defense</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1">Operation</label>
                    <select
                        value={modifier.operation}
                        onChange={(e) => updateModifier({ operation: e.target.value as any })}
                        className="w-full p-2 border rounded text-sm"
                    >
                        <option value="sum">Add (+)</option>
                        <option value="subtract">Subtract (-)</option>
                        <option value="multiply">Multiply (×)</option>
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1">Value</label>
                    <input
                        type="number"
                        value={modifier.value}
                        onChange={(e) => updateModifier({ value: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border rounded text-sm"
                        step="0.1"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1">Priority</label>
                    <input
                        type="number"
                        value={modifier.priority}
                        onChange={(e) => updateModifier({ priority: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border rounded text-sm"
                    />
                </div>

                <div>
                    <label className="block text-xs font-medium mb-1">Stacking</label>
                    <select
                        value={modifier.stacking}
                        onChange={(e) => updateModifier({ stacking: e.target.value as any })}
                        className="w-full p-2 border rounded text-sm"
                    >
                        <option value="default">Default</option>
                        <option value="unique">Unique</option>
                    </select>
                </div>

                {modifier.stacking === 'unique' && (
                    <div>
                        <label className="block text-xs font-medium mb-1">Source</label>
                        <input
                            type="text"
                            value={modifier.source || ''}
                            onChange={(e) => updateModifier({ source: e.target.value })}
                            className="w-full p-2 border rounded text-sm"
                            placeholder="unique-source-id"
                        />
                    </div>
                )}
            </div>

            <div className="mt-3">
                <label className="flex items-center text-sm">
                    <input
                        type="checkbox"
                        checked={modifier.hasCondition}
                        onChange={(e) => updateModifier({
                            hasCondition: e.target.checked,
                            condition: e.target.checked ? {
                                attribute: 'Enchanted',
                                operation: 'eq',
                                value: true
                            } : undefined
                        })}
                        className="mr-2"
                    />
                    Add Condition
                </label>
            </div>

            {modifier.hasCondition && (
                <div className="mt-3 p-3 bg-blue-50 rounded border">
                    <h5 className="text-sm font-medium mb-2">Condition</h5>
                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs mb-1">Attribute</label>
                            <select
                                value={modifier.condition?.attribute || 'Enchanted'}
                                onChange={(e) => {
                                    const attribute = e.target.value as AttributeKey
                                    const defaultValue = getDefaultValueForAttribute(attribute)

                                    updateModifier({
                                        condition: {
                                            attribute,
                                            operation: modifier.condition?.operation || 'eq',
                                            value: defaultValue
                                        }
                                    })
                                }}
                                className="w-full p-1 border rounded text-xs"
                            >
                                {Object.keys(ATTRIBUTE_DEFINITIONS).map(attr => (
                                    <option key={attr} value={attr}>{attr}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs mb-1">Operator</label>
                            <select
                                value={modifier.condition?.operation || 'eq'}
                                onChange={(e) => updateModifier({
                                    condition: { ...modifier.condition, operation: e.target.value } as any
                                })}
                                className="w-full p-1 border rounded text-xs"
                            >
                                <option value="eq">Equals</option>
                                <option value="gt">Greater Than</option>
                                <option value="gte">Greater Than or Equal</option>
                                <option value="lt">Less Than</option>
                                <option value="lte">Less Than or Equal</option>
                                <option value="includes">Includes</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs mb-1">Value</label>
                            {renderConditionValueInput()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}