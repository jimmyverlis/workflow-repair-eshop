<template>
  <div class="bg-slate-50 py-14">
    <div class="container mx-auto px-4">
      <div class="mx-auto max-w-4xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 bg-gradient-to-br from-primary-700 via-primary-600 to-slate-900 px-8 py-10 text-white">
          <div class="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em]">
            {{ pageLabel }}
          </div>
          <h1 class="mt-5 text-4xl font-black">{{ page.title }}</h1>
          <p v-if="pageSubtitle" class="mt-3 max-w-2xl text-base text-white/80">
            {{ pageSubtitle }}
          </p>
        </div>

        <div class="px-8 py-10">
          <div v-if="page.body" class="prose prose-slate max-w-none whitespace-pre-line">
            {{ page.body }}
          </div>
          <div v-else class="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
            This page has not been customized yet in ERP E-Shop settings.
          </div>

          <div v-if="pageKey === 'contact'" class="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 class="text-lg font-bold text-slate-900">Contact Details</h2>
              <div class="mt-4 space-y-3 text-sm text-slate-600">
                <div v-if="appStore.storeDetails?.phone" class="flex items-center gap-2">
                  <Phone class="h-4 w-4 text-primary-600" />
                  <a :href="`tel:${appStore.storeDetails.phone}`" class="hover:text-primary-700">{{ appStore.storeDetails.phone }}</a>
                </div>
                <div v-if="appStore.storeDetails?.email" class="flex items-center gap-2">
                  <Mail class="h-4 w-4 text-primary-600" />
                  <a :href="`mailto:${appStore.storeDetails.email}`" class="hover:text-primary-700">{{ appStore.storeDetails.email }}</a>
                </div>
                <div v-if="appStore.storeDetails?.address" class="flex items-start gap-2">
                  <MapPin class="mt-0.5 h-4 w-4 text-primary-600" />
                  <span>{{ appStore.storeDetails.address }}</span>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <h2 class="text-lg font-bold text-slate-900">Store Hours</h2>
              <div class="mt-4 space-y-3">
                <div
                  v-for="entry in appStore.storeHours"
                  :key="`${entry.label}-${entry.hours}`"
                  class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm"
                >
                  <div class="flex items-center gap-2 text-slate-600">
                    <Clock3 class="h-4 w-4 text-primary-600" />
                    <span>{{ entry.label }}</span>
                  </div>
                  <span class="font-medium text-slate-900">{{ entry.hours }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue';
import { Clock3, Mail, MapPin, Phone } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import { useSeo } from '@/composables/useSeo';

const props = defineProps({
  pageKey: {
    type: String,
    required: true,
  },
});

const appStore = useAppStore();
const seo = useSeo();

const page = computed(() => appStore.pageContent[props.pageKey] || { title: 'Page', body: '' });

watch(page, (p) => {
  if (p.title) seo.apply({ title: p.title, description: p.body?.replace(/<[^>]*>/g, '').slice(0, 160) })
}, { immediate: true });

const pageLabel = computed(() => (
  {
    about: 'About',
    contact: 'Contact',
    shipping: 'Shipping',
    returns: 'Returns',
    privacy: 'Privacy',
    terms: 'Terms',
  }[props.pageKey] || 'Page'
));

const pageSubtitle = computed(() => (
  {
    about: 'Tell customers who you are and why they should trust the store.',
    contact: 'Help customers reach the store through the channels you support.',
    shipping: 'Explain delivery methods, timings and thresholds.',
    returns: 'Describe return windows, conditions and the support path.',
    privacy: 'Set expectations around customer data and communications.',
    terms: 'Publish the operating terms for orders and services.',
  }[props.pageKey] || ''
));
</script>
