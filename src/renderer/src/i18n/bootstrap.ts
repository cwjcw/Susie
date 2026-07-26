import { createI18n } from 'vue-i18n'

import {
  FALLBACK_LOCALE,
  loadLocaleMessages,
  resolveSupportedLocale,
  type RendererLocaleMessages,
  type SupportedLocale
} from '.'
import { pluralRules } from './pluralRules'
import { productBrand } from '@shared/product'

export type RendererLanguageState = {
  requestedLanguage: string
  locale: string
  direction: 'auto' | 'rtl' | 'ltr'
}

type BootstrapOptions = {
  getLanguageState: () => Promise<RendererLanguageState>
  loadMessages?: (locale: string) => Promise<RendererLocaleMessages>
  onError?: (message: string, error: unknown) => void
}

const fallbackLanguageState: RendererLanguageState = {
  requestedLanguage: FALLBACK_LOCALE,
  locale: FALLBACK_LOCALE,
  direction: 'auto'
}

function applyProductBrand(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replaceAll(productBrand.legacyAppName, productBrand.appName)
  }
  if (Array.isArray(value)) {
    return value.map(applyProductBrand)
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, applyProductBrand(nestedValue)])
    )
  }
  return value
}

export async function createRendererI18n({
  getLanguageState,
  loadMessages = loadLocaleMessages,
  onError = (message, error) => console.error(message, error)
}: BootstrapOptions) {
  let languageState = fallbackLanguageState

  try {
    languageState = await getLanguageState()
  } catch (error) {
    onError('Failed to read the renderer language state:', error)
  }

  const requestedLocale = resolveSupportedLocale(languageState.locale)
  const fallbackMessagesPromise = loadMessages(FALLBACK_LOCALE)
  const requestedMessagesPromise =
    requestedLocale === FALLBACK_LOCALE ? fallbackMessagesPromise : loadMessages(requestedLocale)

  let fallbackMessages: RendererLocaleMessages = {}
  try {
    fallbackMessages = applyProductBrand(await fallbackMessagesPromise) as RendererLocaleMessages
  } catch (error) {
    onError(`Failed to load fallback locale ${FALLBACK_LOCALE}:`, error)
  }

  let locale: SupportedLocale = requestedLocale
  let requestedMessages = fallbackMessages
  if (requestedLocale !== FALLBACK_LOCALE) {
    try {
      requestedMessages = applyProductBrand(
        await requestedMessagesPromise
      ) as RendererLocaleMessages
    } catch (error) {
      locale = FALLBACK_LOCALE
      onError(`Failed to load locale ${requestedLocale}:`, error)
    }
  }

  const messages: Record<string, RendererLocaleMessages> = {
    [FALLBACK_LOCALE]: fallbackMessages
  }
  if (locale !== FALLBACK_LOCALE) {
    messages[locale] = requestedMessages
  }

  const i18n = createI18n({
    locale,
    fallbackLocale: FALLBACK_LOCALE,
    legacy: false,
    pluralRules,
    messages
  })

  return {
    i18n,
    languageState: {
      ...languageState,
      locale,
      direction: locale === requestedLocale ? languageState.direction : 'auto'
    } satisfies RendererLanguageState
  }
}
