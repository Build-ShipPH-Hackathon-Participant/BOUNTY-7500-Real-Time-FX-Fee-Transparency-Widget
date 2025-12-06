"use client"

import { FxWidget } from "@/modules/fx-widget"

export default function Home() {
  return (
    <main className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 py-8 px-4 transition-colors duration-500">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center">
          <FxWidget
            initialAmount={0}
            supportedCurrencies={["PHP", "THB", "IDR", "MYR"]}
            onNetAmountChange={(amount) => {
              console.log("Net amount:", amount)
            }}
          />
        </div>
      </div>
    </main>
  )
}
