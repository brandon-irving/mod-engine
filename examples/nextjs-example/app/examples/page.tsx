import { PrebuiltExamples } from '@/components/PrebuiltExamples'

export default function ExamplesPage() {
    return (
        <div className="space-y-8">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    📋 Prebuilt Examples
                </h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Explore common patterns and use cases with these prebuilt examples.
                    Click any example to see its configuration and evaluation results.
                </p>
            </div>

            <PrebuiltExamples />
        </div>
    )
}