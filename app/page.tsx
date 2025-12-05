import { RipeFxWidget } from "@/components/ripe-fx-widget"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Ripe FX Widget</h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Transparent stablecoin to fiat conversion with itemized fees
          </p>
        </div>

        {/* Light Theme Widget */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Light Theme</h2>
          <div className="flex justify-center">
            <RipeFxWidget
              initialAmount={100}
              supportedCurrencies={["PHP", "THB", "SGD"]}
              theme="light"
              onNetAmountChange={(amount) => {
                console.log("Net amount:", amount)
              }}
            />
          </div>
        </div>

        {/* Dark Theme Widget */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Dark Theme</h2>
          <div className="flex justify-center">
            <RipeFxWidget
              initialAmount={50}
              supportedCurrencies={["PHP", "THB", "SGD"]}
              theme="dark"
              onNetAmountChange={(amount) => {
                console.log("Net amount (dark):", amount)
              }}
            />
          </div>
        </div>

        {/* Test Cases Section */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Test Cases</h2>
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-1">Test 1: 100 USDC → PHP</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input: 100 USDC | Expected: Gross ₱5,850 → Ripe fee -₱29.25 → Network fee -₱117 → Net ₱5,703.75
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Test 2: 10 USDC → THB</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input: 10 USDC | Expected: Gross ฿340 → Ripe fee -฿1.70 → Network fee -฿66.80 → Net ฿271.50
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Test 3: 500 USDC → SGD</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input: 500 USDC | Expected: Gross $665 → Ripe fee -$3.33 → Network fee -$2.66 → Net $659.01
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Test 4: 0 USDC</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input: 0 USDC | Expected: Empty state with prompt to enter amount
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Test 5: 1 USDC → PHP</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Input: 1 USDC | Expected: Gross ₱58.50 → Ripe fee -₱0.29 → Network fee -₱117 → Net -₱58.79 (shows fee
                impact on small amounts)
              </p>
            </div>
          </div>
        </div>

        {/* Embedding Guidance */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Embedding Guide</h2>
          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <p>
              <strong>1. Import the component:</strong>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                import {"{RipeFxWidget}"} from '@/components/ripe-fx-widget'
              </code>
            </p>
            <p>
              <strong>2. Use with custom props:</strong>
              <code className="block bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                {"<RipeFxWidget initialAmount={50} supportedCurrencies={['PHP', 'THB']} theme=\"dark\" />"}
              </code>
            </p>
            <p>
              <strong>3. Customize rates in MOCK_CONFIG:</strong> Edit the `interbankRates`, `customerRates`,
              `ripeFeePercent`, and `networkFeeUsd` constants at the top of the component file.
            </p>
            <p>
              <strong>4. Optional: Connect to live rates:</strong> Replace the mock rates with API calls in the
              calculation logic.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
