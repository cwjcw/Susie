<template>
  <main class="h-full overflow-y-auto">
    <div class="mx-auto flex min-h-full w-full max-w-6xl flex-col px-8 py-10 lg:px-12">
      <section class="rounded-3xl border border-border/70 bg-card px-8 py-10 shadow-sm">
        <div class="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div class="max-w-2xl">
            <div class="mb-5 flex items-center gap-3">
              <img :src="logo" :alt="`${productBrand.appName} logo`" class="size-11 rounded-xl" />
              <span class="text-sm font-medium text-muted-foreground">{{
                productBrand.companyName
              }}</span>
            </div>
            <h1 class="text-4xl font-semibold tracking-tight text-foreground">
              {{ productBrand.appName }}
            </h1>
            <p class="mt-3 text-lg text-muted-foreground">
              {{ t('common.productHome.tagline') }}
            </p>
            <Button size="lg" class="mt-7 gap-2" @click="startNewConversation">
              <Icon icon="lucide:message-square-plus" class="size-4" />
              {{ t('common.productHome.startConversation') }}
            </Button>
          </div>
          <div
            class="grid w-full max-w-md grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3"
          >
            <button
              v-for="shortcut in shortcuts"
              :key="shortcut.key"
              type="button"
              class="flex min-h-28 flex-col items-start justify-between rounded-xl border border-border/60 bg-background p-4 text-left transition-colors hover:border-primary/40 hover:bg-accent"
              @click="shortcut.action"
            >
              <Icon :icon="shortcut.icon" class="size-5 text-primary" />
              <span class="text-sm font-medium text-foreground">{{ t(shortcut.labelKey) }}</span>
            </button>
          </div>
        </div>
      </section>

      <section class="mt-10">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-foreground">
              {{ t('common.productHome.recentTitle') }}
            </h2>
            <p class="mt-1 text-sm text-muted-foreground">
              {{ t('common.productHome.recentDescription') }}
            </p>
          </div>
          <Button variant="ghost" class="gap-2" @click="openHistory">
            {{ t('common.productHome.viewAll') }}
            <Icon icon="lucide:arrow-right" class="size-4" />
          </Button>
        </div>

        <div
          v-if="recentSessions.length > 0"
          class="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          <button
            v-for="session in recentSessions"
            :key="session.id"
            type="button"
            class="group rounded-2xl border border-border/70 bg-card p-5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-sm"
            @click="openSession(session.id)"
          >
            <div class="flex items-start justify-between gap-4">
              <Icon icon="lucide:message-square" class="mt-0.5 size-4 text-muted-foreground" />
              <span class="text-xs text-muted-foreground">{{ formatTime(session.updatedAt) }}</span>
            </div>
            <h3 class="mt-5 line-clamp-2 text-sm font-medium text-foreground">
              {{ session.title || t('common.productHome.untitledConversation') }}
            </h3>
          </button>
        </div>

        <div
          v-else
          class="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-center"
        >
          <Icon icon="lucide:messages-square" class="size-6 text-muted-foreground" />
          <p class="mt-3 text-sm font-medium text-foreground">
            {{ t('common.productHome.noRecent') }}
          </p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ t('common.productHome.noRecentDescription') }}
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { Button } from '@shadcn/components/ui/button'
import { createConfigClient } from '@api/ConfigClient'
import { productBrand } from '@shared/product'
import { useSessionStore } from '@/stores/ui/session'
import logo from '@/assets/logo.png'

const { t, locale } = useI18n()
const router = useRouter()
const sessionStore = useSessionStore()
const configClient = createConfigClient()

const recentSessions = computed(() =>
  [...sessionStore.sessions]
    .filter((session) => session.sessionKind === 'regular')
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 6)
)

const startNewConversation = async () => {
  await router.push({ name: 'chat' })
  await sessionStore.startNewConversation({ refresh: true })
}

const openHistory = async () => {
  await router.push({ name: 'chat' })
}

const openSession = async (sessionId: string) => {
  await router.push({ name: 'chat' })
  await sessionStore.selectSession(sessionId)
}

const openModels = async () => {
  await configClient.openSettings({ routeName: 'settings-provider' })
}

const openLocalModels = async () => {
  await configClient.openSettings({
    routeName: 'settings-provider',
    params: { providerId: 'ollama' }
  })
}

const shortcuts = [
  {
    key: 'new',
    icon: 'lucide:message-square-plus',
    labelKey: 'common.productHome.shortcuts.newConversation',
    action: startNewConversation
  },
  {
    key: 'history',
    icon: 'lucide:history',
    labelKey: 'common.productHome.shortcuts.history',
    action: openHistory
  },
  {
    key: 'models',
    icon: 'lucide:boxes',
    labelKey: 'common.productHome.shortcuts.models',
    action: openModels
  },
  {
    key: 'local-models',
    icon: 'lucide:hard-drive',
    labelKey: 'common.productHome.shortcuts.localModels',
    action: openLocalModels
  }
] as const

const formatTime = (timestamp: number) =>
  new Intl.DateTimeFormat(locale.value, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp))
</script>
