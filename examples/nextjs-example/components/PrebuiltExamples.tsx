'use client'

import { useState } from 'react'
import {
  rpgEngine,
  DEFAULT_BASE_METRICS,
  evaluateItem,
  type DemoItem,
  type EvaluationResult,
  type RpgConfig
} from '@/lib/rpg-sdk'
import { EvaluationResults } from './EvaluationResults'

export function PrebuiltExamples() {
  const [selectedExample, setSelectedExample] = useState<any>(null)
  const [evaluationResult, setEvaluationResult] = useState<any>(null)

  const examples: any[] = [
    {
      name: "Legendary Sword",
      description: "High-level weapon with enchantment bonuses and conditional modifiers",
      item: rpgEngine
        .builder("Excalibur")
        .set('ItemName', 'Excalibur')
        .set('Rarity', 'Legendary')
        .set('Tags', ['Weapon'])
        .set('Level', 80)
        .set('Enchanted', true)
        .set('Quality', 95)
        .set('Cursed', false)
        .set('SocketCount', 3)
        .increase('Damage').by(150)
        .increase('Strength').by(100)
        .when({ op: 'eq', attr: 'Enchanted', value: true })
        .multiply('Damage').by(1.25)
        .when({ op: 'eq', attr: 'Rarity', value: 'Legendary' })
        .increase('Health').by(200)
        .build(),
      expectedMetrics: { Damage: 197.5, Strength: 110, Health: 210 }
    },
    {
      name: "Cursed Ring",
      description: "Powerful accessory with mixed benefits and penalties",
      item: rpgEngine
        .builder("Ring of Power")
        .set('ItemName', 'Ring of Power')
        .set('Rarity', 'Epic')
        .set('Tags', ['Ring', 'Accessory'])
        .set('Level', 60)
        .set('Enchanted', true)
        .set('Quality', 80)
        .set('Cursed', true)
        .set('SocketCount', 1)
        .increase('Mana').by(200)
        .multiply('Mana').by(1.5)
        .when({ op: 'eq', attr: 'Cursed', value: true })
        .decrease('Health').by(50)
        .build(),
      expectedMetrics: { Mana: 310, Health: -40 }
    },
    {
      name: "Beginner Armor",
      description: "Simple armor with basic defense and level-based scaling",
      item: rpgEngine
        .builder("Leather Armor")
        .set('ItemName', 'Leather Armor')
        .set('Rarity', 'Common')
        .set('Tags', ['Armor'])
        .set('Level', 10)
        .set('Enchanted', false)
        .set('Quality', 60)
        .set('Cursed', false)
        .set('SocketCount', 0)
        .increase('Defense').by(25)
        .increase('Health').by(50)
        .when({ op: 'gte', attr: 'Level', value: 10 })
        .increase('Defense').by(10)
        .build(),
      expectedMetrics: { Defense: 45, Health: 60 }
    },
    {
      name: "Speed Boots",
      description: "Demonstrates percentage-based modifiers and stacking",
      item: rpgEngine
        .builder("Boots of Swiftness")
        .set('ItemName', 'Boots of Swiftness')
        .set('Rarity', 'Rare')
        .set('Tags', ['Armor', 'Accessory'])
        .set('Level', 35)
        .set('Enchanted', true)
        .set('Quality', 75)
        .set('Cursed', false)
        .set('SocketCount', 2)
        .increase('Speed').by(30)
        .multiply('Speed').by(1.2) // +20%
        .when({ op: 'includes', attr: 'Tags', value: ['Accessory'] })
        .increase('Speed').by(15)
        .build(),
      expectedMetrics: { Speed: 66 } // (10 + 30 + 15) * 1.2 = 66
    },
    {
      name: "Power Stacking Demo",
      description: "Shows complex operation precedence and unique stacking",
      item: rpgEngine
        .builder("Staff of Elements")
        .set('ItemName', 'Staff of Elements')
        .set('Rarity', 'Epic')
        .set('Tags', ['Weapon'])
        .set('Level', 70)
        .set('Enchanted', true)
        .set('Quality', 90)
        .set('Cursed', false)
        .set('SocketCount', 4)
        .increase('Mana').by(10)
        .multiply('Mana').by(10) // 10 * 10 = 100
        .with({ stacking: 'unique', source: 'elemental-power' })
        .increase('Damage').by(80)
        .with({ stacking: 'unique', source: 'elemental-power' })
        .increase('Damage').by(60) // Should not stack due to unique source
        .multiply('Damage').by(0.5) // Damage reduction instead of clamp
        .build(),
      expectedMetrics: { Mana: 200, Damage: 45 } // (10+10)*10=200, (10+80)*0.5=45
    }
  ]

  const runExample = (example: DemoItem) => {
    setSelectedExample(example)
    try {
      const result = rpgEngine.evaluate(example.item, { base: DEFAULT_BASE_METRICS })
      setEvaluationResult(result)
    } catch (error) {
      console.error('Error evaluating example:', error)
      setEvaluationResult(null)
    }
  }

  return (
    <div className="space-y-8">
      {/* Example List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {examples.map((example, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow p-6 cursor-pointer transition-all hover:shadow-lg border-2 ${selectedExample?.name === example.name
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
              }`}
            onClick={() => runExample(example)}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {example.name}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {example.description}
            </p>

            <div className="space-y-2">
              <div className="text-xs text-gray-500">Expected Metrics:</div>
              <div className="flex flex-wrap gap-1">
                {Object.entries(example.expectedMetrics).map(([metric, value]) => (
                  <span
                    key={metric}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {metric}: {String(value)}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 text-xs text-blue-600 font-medium">
              Click to evaluate →
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      {selectedExample && evaluationResult && (
        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Results for: {selectedExample.name}
          </h2>
          <EvaluationResults
            result={evaluationResult}
            initialMetrics={DEFAULT_BASE_METRICS}
          />
        </div>
      )}

      {selectedExample && !evaluationResult && (
        <div className="border-t pt-8">
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">
              Failed to evaluate {selectedExample.name}. Check the console for errors.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}