import { ItemBuilder } from '@/components/ItemBuilder'

export default function HomePage() {
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    🛡️ Mod-Engine Interactive Demo
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Explore the power of the mod-engine library with this interactive RPG item builder.
                    Create items, apply modifiers with conditions, and see real-time evaluation results.
                </p>
            </div>

            {/* Quick Start Guide */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-blue-900 mb-3">🚀 Quick Start Guide</h2>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                        <div>
                            <h3 className="font-medium text-blue-900">Configure Item</h3>
                            <p className="text-blue-700">Set item name, rarity, level, and attributes</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                        <div>
                            <h3 className="font-medium text-blue-900">Add Modifiers</h3>
                            <p className="text-blue-700">Create modifiers with operations, conditions, and priorities</p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-2">
                        <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                        <div>
                            <h3 className="font-medium text-blue-900">Evaluate</h3>
                            <p className="text-blue-700">See the final metrics and applied modifiers</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-green-500">
                    <h3 className="font-semibold text-gray-900 mb-2">⚡ Type Safety</h3>
                    <p className="text-sm text-gray-600">Full TypeScript support with autocomplete and validation</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                    <h3 className="font-semibold text-gray-900 mb-2">🔧 Custom Operations</h3>
                    <p className="text-sm text-gray-600">Build with core operations: sum, subtract, multiply</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-purple-500">
                    <h3 className="font-semibold text-gray-900 mb-2">🎯 Conditional Logic</h3>
                    <p className="text-sm text-gray-600">Apply modifiers based on item attributes</p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500">
                    <h3 className="font-semibold text-gray-900 mb-2">📊 Deterministic</h3>
                    <p className="text-sm text-gray-600">Predictable evaluation with priority ordering</p>
                </div>
            </div>

            {/* Main Demo */}
            <ItemBuilder />

            {/* Additional Resources */}
            <div className="bg-gray-50 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Learn More</h2>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Example Use Cases</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• RPG item systems with enchantments</li>
                            <li>• Equipment upgrade mechanics</li>
                            <li>• Buff/debuff systems in games</li>
                            <li>• Configuration-driven rule engines</li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Key Concepts</h3>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>• <strong>Metrics:</strong> The values being modified</li>
                            <li>• <strong>Operations:</strong> How modifications are applied</li>
                            <li>• <strong>Conditions:</strong> When modifiers should apply</li>
                            <li>• <strong>Stacking:</strong> How multiple modifiers combine</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}