<template>
  <footer class="mt-auto border-t border-slate-200 bg-slate-950 text-white">
    <div class="container mx-auto px-4 py-12">
      <div class="grid grid-cols-1 gap-10 lg:grid-cols-[1.2fr_1.8fr_1fr]">
        <div class="space-y-5">
          <div class="flex items-center gap-3">
            <img :src="appStore.branding.logo" :alt="appStore.storeName" class="h-12 w-auto rounded-xl bg-white/5 p-1" />
            <div>
              <div class="text-lg font-black">{{ appStore.storeName }}</div>
              <div class="text-xs uppercase tracking-[0.22em] text-white/45">Ηλεκτρονικό κατάστημα</div>
            </div>
          </div>

          <p class="max-w-md text-sm leading-6 text-white/65">
            {{ appStore.footerDescription }}
          </p>

          <div class="space-y-2 text-sm text-white/70">
            <a v-if="appStore.storeDetails?.phone" :href="`tel:${appStore.storeDetails.phone}`" class="flex items-center gap-2 hover:text-white">
              <Phone class="h-4 w-4" />
              <span>{{ appStore.storeDetails.phone }}</span>
            </a>
            <a v-if="appStore.storeDetails?.email" :href="`mailto:${appStore.storeDetails.email}`" class="flex items-center gap-2 hover:text-white">
              <Mail class="h-4 w-4" />
              <span>{{ appStore.storeDetails.email }}</span>
            </a>
            <div v-if="appStore.storeDetails?.address" class="flex items-start gap-2">
              <MapPin class="mt-0.5 h-4 w-4 flex-shrink-0" />
              <span>{{ appStore.storeDetails.address }}</span>
            </div>
          </div>

          <div v-if="appStore.socialLinks.length" class="flex flex-wrap gap-2">
            <a
              v-for="link in appStore.socialLinks"
              :key="`${link.label}-${link.url}`"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              {{ link.label }}
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
          <div v-for="column in appStore.footerColumns" :key="column.title" class="space-y-3">
            <h3 class="text-sm font-bold uppercase tracking-[0.18em] text-white/55">{{ column.title }}</h3>
            <div class="space-y-2">
              <button
                v-for="link in column.links"
                :key="`${column.title}-${link.label}-${link.url}`"
                type="button"
                class="block text-left text-sm text-white/70 hover:text-white"
                @click="navigateTo(link.url, link.openInNewTab)"
              >
                {{ link.label }}
              </button>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-bold uppercase tracking-[0.18em] text-white/55">Ώρες λειτουργίας</h3>
            <div class="mt-3 space-y-2">
              <div
                v-for="entry in appStore.storeHours"
                :key="`${entry.label}-${entry.hours}`"
                class="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm"
              >
                <div class="flex items-center gap-2 text-white/70">
                  <Clock3 class="h-4 w-4" />
                  <span>{{ entry.label }}</span>
                </div>
                <span class="font-medium text-white">{{ entry.hours }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-10 border-t border-white/10 pt-6 text-sm text-white/45">
        <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {{ new Date().getFullYear() }} {{ appStore.storeName }}. Με επιφύλαξη παντός δικαιώματος.</p>
          <p>Διαμορφώνεται από τις ρυθμίσεις ERP.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { Clock3, Mail, MapPin, Phone } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';

const router = useRouter();
const appStore = useAppStore();

function navigateTo(url, openInNewTab = false) {
  if (!url) return;

  if (/^https?:\/\//i.test(url)) {
    if (openInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    window.location.href = url;
    return;
  }

  router.push(url);
}
</script>
