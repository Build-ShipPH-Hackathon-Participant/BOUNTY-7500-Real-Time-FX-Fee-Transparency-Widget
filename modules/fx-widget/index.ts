// Main widget export
export { FxWidget, FxWidget as RipeFxWidget } from './FxWidget'

// Types
export type { FxWidgetProps, CalculationResult, FxConfig, ThemeClasses } from './types'
export { CURRENCY_SYMBOLS } from './types'

// Constants
export { FX_CONFIG, PERCENTAGE_POINTS, CONTAINER_VARIANTS, ITEM_VARIANTS } from './constants'

// Hooks
export { useDebounce, useFxCalculation, useThemeClasses, useExchangeRate } from './hooks'

// Utils
export * from './utils'

// Components (for customization)
export {
  WidgetHeader,
  DirectionToggle,
  WithdrawalAddressInput,
  AmountInput,
  PercentageSlider,
  CurrencySelector,
  ResultDisplay,
  FeeBreakdown,
  EmptyState,
  ReceivePanel,
  ExchangeRateDisplay,
  SendConfirmation,
} from './components'

