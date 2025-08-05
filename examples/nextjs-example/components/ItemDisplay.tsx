'use client'

import type { ItemBuilderState } from '@/types/ui'

interface ItemDisplayProps {
    itemState: ItemBuilderState
}

export function ItemDisplay({ itemState }: ItemDisplayProps) {
    const getRarityColor = (rarity: string) => {
        switch (rarity) {
            case 'Common': return 'text-gray-600 border-gray-300'
            case 'Rare': return 'text-blue-600 border-blue-300'
            case 'Epic': return 'text-purple-600 border-purple-300'
            case 'Legendary': return 'text-yellow-600 border-yellow-300'
            default: return 'text-gray-600 border-gray-300'
        }
    }

    const getRarityBg = (rarity: string) => {
        switch (rarity) {
            case 'Common': return 'bg-gray-100'
            case 'Rare': return 'bg-blue-100'
            case 'Epic': return 'bg-purple-100'
            case 'Legendary': return 'bg-yellow-100'
            default: return 'bg-gray-100'
        }
    }

    return (
        <div className={`bg-white rounded-lg shadow border-2 ${getRarityColor(itemState.rarity)} p-6`}>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{itemState.itemName}</h2>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityBg(itemState.rarity)} ${getRarityColor(itemState.rarity)}`}>
                    {itemState.rarity}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-medium text-gray-600">Level:</span>
                    <span className="ml-2 font-bold">{itemState.level}</span>
                </div>

                <div>
                    <span className="font-medium text-gray-600">Quality:</span>
                    <span className="ml-2 font-bold">{itemState.quality}%</span>
                </div>

                <div>
                    <span className="font-medium text-gray-600">Sockets:</span>
                    <span className="ml-2">
                        {'○'.repeat(itemState.socketCount)}
                        {'●'.repeat(Math.max(0, 6 - itemState.socketCount))}
                    </span>
                </div>

                <div className="flex items-center space-x-3">
                    {itemState.enchanted && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            ✨ Enchanted
                        </span>
                    )}
                    {itemState.cursed && (
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            💀 Cursed
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-4">
                <span className="font-medium text-gray-600">Tags:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                    {itemState.tags.map((tag, index) => (
                        <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 italic">
                    Configure modifiers and click "Build & Evaluate" to see this item's final stats
                </p>
            </div>
        </div>
    )
}