'use client'

import { useState, useEffect } from 'react'
import {
    createModifier,
    buildItem,
    evaluateItem,
    DEFAULT_ITEM_STATE,
    DEFAULT_BASE_METRICS,
    type ItemState,
    type ModifierForm,
    type RpgConfig,
    type EvaluationResult,
} from '@/lib/rpg-sdk'
import { ModifierFormComponent } from './ModifierForm'
import { ItemDisplay } from './ItemDisplay'
import { EvaluationResults } from './EvaluationResults'

export function ItemBuilder() {
    const [itemState, setItemState] = useState<ItemState>({
        ...DEFAULT_ITEM_STATE,
        itemName: 'Legendary Sword',
        rarity: 'Epic',
        tags: ['Weapon'],
        level: 50,
        enchanted: true,
        quality: 85,
        socketCount: 2,
    })

    const [modifiers, setModifiers] = useState<ModifierForm[]>([
        createModifier({
            metric: 'Damage',
            operation: 'sum',
            value: 100,
            priority: 10,
        }),
        createModifier({
            metric: 'Damage',
            operation: 'sum',
            value: 25,
            priority: 20,
            hasCondition: true,
            condition: {
                attribute: 'Enchanted',
                operation: 'eq',
                value: true
            },
        })
    ])

    const [evaluationResult, setEvaluationResult] = useState<EvaluationResult<RpgConfig> | null>(null)
    const [initialMetrics] = useState(DEFAULT_BASE_METRICS)
    const [validationErrors, setValidationErrors] = useState<string[]>([])

    const buildAndEvaluateItem = () => {
        try {
            // Use SDK helper to build and evaluate the item
            const item = buildItem(itemState, modifiers)
            const result = evaluateItem(item)

            setValidationErrors([])
            setEvaluationResult(result)

        } catch (error) {
            console.error('Error building item:', error)
            setValidationErrors([error instanceof Error ? error.message : 'Unknown error'])
        }
    }

    // Auto-evaluate whenever itemState or modifiers change
    useEffect(() => {
        buildAndEvaluateItem()
    }, [itemState, modifiers]) // eslint-disable-line react-hooks/exhaustive-deps

    const addModifier = () => {
        setModifiers([...modifiers, createModifier()])
    }

    const removeModifier = (index: number) => {
        setModifiers(modifiers.filter((_, i) => i !== index))
    }

    const updateModifier = (index: number, modifier: ModifierForm) => {
        const newModifiers = [...modifiers]
        newModifiers[index] = modifier
        setModifiers(newModifiers)
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Item Configuration */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h2 className="text-xl font-semibold mb-4">Item Configuration</h2>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Item Name</label>
                                <input
                                    type="text"
                                    value={itemState.itemName}
                                    onChange={(e) => setItemState({ ...itemState, itemName: e.target.value })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Rarity</label>
                                <select
                                    value={itemState.rarity}
                                    onChange={(e) => setItemState({ ...itemState, rarity: e.target.value as ItemState['rarity'] })}
                                    className="w-full p-2 border rounded"
                                >
                                    <option value="Common">Common</option>
                                    <option value="Rare">Rare</option>
                                    <option value="Epic">Epic</option>
                                    <option value="Legendary">Legendary</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Level</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={itemState.level}
                                    onChange={(e) => setItemState({ ...itemState, level: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Quality (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={itemState.quality}
                                    onChange={(e) => setItemState({ ...itemState, quality: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Socket Count</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="6"
                                    value={itemState.socketCount}
                                    onChange={(e) => setItemState({ ...itemState, socketCount: parseInt(e.target.value) })}
                                    className="w-full p-2 border rounded"
                                />
                            </div>

                            <div className="flex items-center space-x-4">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={itemState.enchanted}
                                        onChange={(e) => setItemState({ ...itemState, enchanted: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Enchanted
                                </label>

                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={itemState.cursed}
                                        onChange={(e) => setItemState({ ...itemState, cursed: e.target.checked })}
                                        className="mr-2"
                                    />
                                    Cursed
                                </label>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-1">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {(['Weapon', 'Armor', 'Consumable', 'Accessory', 'Ring', 'Amulet', 'Potion'] as const).map(tag => (
                                    <label key={tag} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={itemState.tags.includes(tag)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setItemState({ ...itemState, tags: [...itemState.tags, tag] })
                                                } else {
                                                    setItemState({ ...itemState, tags: itemState.tags.filter((t: string) => t !== tag) })
                                                }
                                            }}
                                            className="mr-1"
                                        />
                                        <span className="text-sm">{tag}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Modifiers */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">Modifiers</h2>
                            <button
                                onClick={addModifier}
                                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                            >
                                Add Modifier
                            </button>
                        </div>

                        <div className="space-y-4">
                            {modifiers.map((modifier, index) => (
                                <ModifierFormComponent
                                    key={modifier.id}
                                    modifier={modifier}
                                    onChange={(mod) => updateModifier(index, mod)}
                                    onRemove={() => removeModifier(index)}
                                />
                            ))}
                        </div>
                    </div>

                    {validationErrors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded p-4">
                            <h3 className="text-red-800 font-medium">Validation Errors:</h3>
                            <ul className="list-disc list-inside text-red-700 text-sm mt-1">
                                {validationErrors.map((error, i) => (
                                    <li key={i}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Results */}
                <div className="space-y-6">
                    <ItemDisplay itemState={itemState} />
                    <EvaluationResults
                        result={evaluationResult}
                        initialMetrics={initialMetrics}
                    />
                </div>
            </div>
        </div>
    )
}