<template>
  <div class="bg-slate-50">
    <div class="container mx-auto px-4 py-8">
      <div class="mx-auto max-w-6xl space-y-6">
        <section class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div class="text-2xl font-black text-slate-900">{{ appStore.userName || 'Λογαριασμός πελάτη' }}</div>
              <div class="text-sm text-slate-500">{{ appStore.userEmail }}</div>
            </div>
            <div class="flex flex-wrap gap-3">
              <div v-if="appStore.loyaltyEnabled" class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-600">Πόντοι</div>
                <div class="mt-1 text-xl font-black">{{ loyaltyBalance }}</div>
              </div>
              <button type="button" class="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-rose-200 hover:text-rose-600" @click="handleSignOut">Αποσύνδεση</button>
            </div>
          </div>
        </section>

        <section class="flex overflow-x-auto border-b border-slate-200">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            type="button"
            class="inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition"
            :class="activeTab === tab.key ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500 hover:text-slate-800'"
            @click="setTab(tab.key)"
          >
            <component :is="tab.icon" class="h-4 w-4" />
            {{ tab.label }}
            <span v-if="tab.count !== undefined" class="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{{ tab.count }}</span>
          </button>
        </section>

        <!-- Orders -->
        <section v-if="activeTab === 'orders'" class="space-y-4">
          <div v-if="loadingOrders" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm"><div class="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div></div>
          <div v-else-if="orders.length === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag class="mx-auto h-16 w-16 text-slate-300" />
            <h2 class="mt-4 text-2xl font-black text-slate-900">Δεν υπάρχουν παραγγελίες ακόμα</h2>
            <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Περιήγηση προϊόντων</RouterLink>
          </div>
          <article v-for="order in orders" :key="order.id" class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="font-mono text-sm font-bold text-primary-600">{{ order.orderNumber }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ formatDate(order.createdAt) }}</div>
              </div>
              <div class="text-right">
                <div class="rounded-full px-3 py-1 text-xs font-bold" :class="orderStatusClass(order.status)">{{ orderStatusLabel(order.status) }}</div>
                <div class="mt-2 text-lg font-black text-slate-900">EUR {{ Number(order.totalAmount || 0).toFixed(2) }}</div>
              </div>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <RouterLink :to="`/order/${order.id}`" class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700">Προβολή παραγγελίας</RouterLink>
              <button type="button" class="rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="reorder(order)">Επαναπαραγγελία</button>
              <button v-if="appStore.returnRequestsEnabled" type="button" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700" @click="openReturn(order)">Αίτηση επιστροφής</button>
            </div>
          </article>
        </section>

        <!-- Wishlist -->
        <section v-else-if="activeTab === 'wishlist'" class="space-y-4">
          <div v-if="wishlistStore.count === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Heart class="mx-auto h-16 w-16 text-slate-300" />
            <h2 class="mt-4 text-2xl font-black text-slate-900">Η λίστα επιθυμιών είναι κενή</h2>
            <RouterLink to="/products" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Περιήγηση προϊόντων</RouterLink>
          </div>
          <article v-for="item in wishlistStore.items" :key="item._uid" class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{{ item._productType }}</div>
                <div class="mt-2 text-lg font-bold text-slate-900">{{ item.name }}</div>
                <div class="mt-2 text-sm text-slate-500">EUR {{ Number(item.eshopPrice ?? item.price ?? 0).toFixed(2) }}</div>
              </div>
              <button type="button" class="text-sm font-semibold text-rose-600 hover:text-rose-700" @click="wishlistStore.removeProduct(item)">Αφαίρεση</button>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button type="button" class="rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="addWishlistItemToCart(item)">Προσθήκη στο καλάθι</button>
              <RouterLink :to="{ path: `/product/${item.id}`, query: { source: item._source || item.source || 'inventory' } }" class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700">Προβολή προϊόντος</RouterLink>
            </div>
          </article>
        </section>

        <!-- Saved carts -->
        <section v-else-if="activeTab === 'saved'" class="space-y-4">
          <div class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm flex items-center justify-between gap-3">
            <div>
              <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Διατήρηση</div>
              <h2 class="mt-2 text-2xl font-black text-slate-900">Αποθηκευμένα καλάθια</h2>
            </div>
            <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700" @click="loadSavedCarts">Ανανέωση</button>
          </div>
          <div v-if="savedCarts.length === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Archive class="mx-auto h-16 w-16 text-slate-300" />
            <h2 class="mt-4 text-2xl font-black text-slate-900">Δεν υπάρχουν αποθηκευμένα καλάθια</h2>
            <RouterLink to="/cart" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Άνοιγμα καλαθιού</RouterLink>
          </div>
          <article v-for="savedCart in savedCarts" :key="savedCart.id" class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-lg font-bold text-slate-900">{{ savedCart.name }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ savedCart.item_count }} είδη · EUR {{ Number(savedCart.subtotal || 0).toFixed(2) }}</div>
              </div>
              <button type="button" class="text-sm font-semibold text-rose-600 hover:text-rose-700" @click="deleteSavedCart(savedCart.id)">Διαγραφή</button>
            </div>
            <div class="mt-4 flex flex-wrap gap-3">
              <button type="button" class="rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="loadSavedCart(savedCart)">Φόρτωση στο καλάθι</button>
              <RouterLink to="/cart" class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700">Μετάβαση στο καλάθι</RouterLink>
            </div>
          </article>
        </section>

        <!-- Appointments -->
        <section v-else-if="activeTab === 'appointments'" class="space-y-4">
          <div v-if="loadingAppointments" class="rounded-[2rem] border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div class="inline-block h-10 w-10 animate-spin rounded-full border-b-2 border-primary-600"></div>
          </div>
          <div v-else-if="appointments.length === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Calendar class="mx-auto h-16 w-16 text-slate-300" />
            <h2 class="mt-4 text-2xl font-black text-slate-900">Δεν υπάρχουν κρατήσεις</h2>
            <RouterLink to="/repair-booking" class="mt-6 inline-flex rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700">Κράτηση επισκευής</RouterLink>
          </div>
          <article v-for="apt in appointments" :key="apt.id" class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div class="font-semibold text-slate-900">{{ apt.title }}</div>
                <div class="mt-1 text-sm text-slate-500">{{ formatAppointmentDate(apt.date) }} · {{ apt.start_time }}<span v-if="apt.end_time"> – {{ apt.end_time }}</span></div>
                <div v-if="apt.notes" class="mt-2 text-sm text-slate-500">{{ apt.notes }}</div>
              </div>
              <div class="rounded-full px-3 py-1 text-xs font-bold" :class="appointmentStatusClass(apt.status)">{{ appointmentStatusLabel(apt.status) }}</div>
            </div>
          </article>
        </section>

        <!-- Rewards -->
        <section v-else-if="activeTab === 'rewards'" class="grid gap-6 lg:grid-cols-2">
          <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Πρόγραμμα πιστότητας</div>
            <h2 class="mt-2 text-2xl font-black text-slate-900">Επισκόπηση ανταμοιβών</h2>
            <div class="mt-6 grid gap-4 sm:grid-cols-3">
              <div class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Υπόλοιπο</div><div class="mt-2 text-2xl font-black text-amber-900">{{ loyaltyBalance }}</div></div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Αποκτήθηκαν</div><div class="mt-2 text-2xl font-black text-slate-900">{{ loyaltyEarned }}</div></div>
              <div class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Εξαργυρώθηκαν</div><div class="mt-2 text-2xl font-black text-slate-900">{{ loyaltyRedeemed }}</div></div>
            </div>
            <p class="mt-4 text-sm text-slate-500">Οι πόντοι χορηγούνται μετά από πληρωμένες παραγγελίες. Ρύθμιση καταστήματος: {{ appStore.loyaltyPointsPerCurrency }} πόντος/πόντοι ανά μονάδα νομίσματος.</p>
          </article>
          <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Συστάσεις</div>
            <h2 class="mt-2 text-2xl font-black text-slate-900">Προσκαλέστε φίλους</h2>
            <template v-if="appStore.referralsEnabled">
              <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Κωδικός σύστασής σας</div>
                <div class="mt-2 flex flex-wrap items-center gap-3">
                  <div class="rounded-xl bg-white px-4 py-3 font-mono text-lg font-bold text-slate-900">{{ referralCode || 'Γίνεται δημιουργία...' }}</div>
                  <button type="button" class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700" @click="copyReferralCode">Αντιγραφή κωδικού</button>
                </div>
              </div>
              <p class="mt-4 text-sm text-slate-500">Ανταμοιβή ανά επιτυχημένη πρώτη παραγγελία: {{ appStore.referralRewardPoints }} πόντοι.</p>
              <div v-if="referralStatus" class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{{ referralStatus }}</div>
            </template>
            <p v-else class="mt-4 text-sm text-slate-500">Το πρόγραμμα συστάσεων δεν είναι ενεργό για αυτό το κατάστημα.</p>
          </article>
        </section>

        <!-- Returns -->
        <section v-else-if="activeTab === 'returns'" class="space-y-6">
          <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-3">
              <div>
                <div class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Μετά την πώληση</div>
                <h2 class="mt-2 text-2xl font-black text-slate-900">Αιτήματα επιστροφής</h2>
                <p class="mt-2 text-sm text-slate-500">{{ appStore.returnInstructions || 'Υποβάλετε αίτημα επιστροφής για επιλέξιμες παραγγελίες.' }}</p>
              </div>
              <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700" @click="loadReturnRequests">Ανανέωση</button>
            </div>
          </article>
          <article v-if="appStore.returnRequestsEnabled" class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div class="grid gap-4 md:grid-cols-2">
              <select v-model="returnForm.orderId" class="input">
                <option value="">Επιλέξτε παραγγελία</option>
                <option v-for="order in returnEligibleOrders" :key="order.id" :value="order.id">{{ order.orderNumber }} · EUR {{ Number(order.totalAmount || 0).toFixed(2) }}</option>
              </select>
              <select v-model="returnForm.reason" class="input">
                <option value="Κατεστραμμένο προϊόν">Κατεστραμμένο προϊόν</option>
                <option value="Λάθος προϊόν">Λάθος προϊόν</option>
                <option value="Δεν αντιστοιχεί στην περιγραφή">Δεν αντιστοιχεί στην περιγραφή</option>
                <option value="Άλλαξα γνώμη">Άλλαξα γνώμη</option>
              </select>
            </div>
            <div v-if="returnOrderItems.length" class="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <label v-for="item in returnOrderItems" :key="`${item.itemId}-${item.collection}`" class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <div class="flex items-start gap-3"><input v-model="item.selected" type="checkbox" class="mt-1 rounded border-slate-300 text-primary-600" /><div><div class="font-semibold text-slate-900">{{ item.name }}</div><div class="text-xs text-slate-500">Παραγγελθέντα: {{ item.maxQuantity }}</div></div></div>
                <input v-model.number="item.quantity" type="number" min="1" :max="item.maxQuantity" class="w-24 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none" />
              </label>
            </div>
            <textarea v-model.trim="returnForm.details" rows="4" class="input mt-4" placeholder="Περιγράψτε το πρόβλημα ή το αίτημα επιστροφής."></textarea>
            <div v-if="returnFormMessage" class="mt-4 rounded-2xl px-4 py-3 text-sm" :class="returnFormSuccess ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-rose-200 bg-rose-50 text-rose-700'">{{ returnFormMessage }}</div>
            <div class="mt-4 flex justify-end"><button type="button" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="returnSubmitting" @click="submitReturnRequest">{{ returnSubmitting ? 'Υποβολή...' : 'Υποβολή αιτήματος' }}</button></div>
          </article>
          <div v-if="returnRequests.length === 0" class="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm"><RotateCcw class="mx-auto h-16 w-16 text-slate-300" /><h2 class="mt-4 text-2xl font-black text-slate-900">Δεν υπάρχουν αιτήματα επιστροφής</h2></div>
          <article v-for="request in returnRequests" :key="request.id" class="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
            <div class="flex items-start justify-between gap-3"><div><div class="text-sm font-bold text-primary-600">{{ request.order_number || request.order_id }}</div><div class="mt-1 text-sm text-slate-500">{{ formatDate(request.created_at) }}</div><div class="mt-2 text-sm text-slate-700">{{ request.reason }}</div></div><div class="rounded-full px-3 py-1 text-xs font-bold" :class="returnStatusClass(request.status)">{{ humanizeStatus(request.status) }}</div></div>
          </article>
        </section>

        <!-- Profile -->
        <section v-else class="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 class="text-2xl font-black text-slate-900">Προφίλ</h2>
            <div v-if="profileMessage" class="mt-4 rounded-2xl px-4 py-3 text-sm" :class="profileSuccess ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-rose-200 bg-rose-50 text-rose-700'">{{ profileMessage }}</div>
            <form class="mt-6 space-y-4" @submit.prevent="saveProfile">
              <div class="grid gap-4 md:grid-cols-2">
                <input v-model.trim="profileForm.first_name" type="text" class="input" placeholder="Όνομα" required />
                <input v-model.trim="profileForm.last_name" type="text" class="input" placeholder="Επώνυμο" required />
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <input v-model.trim="profileForm.phone" type="tel" class="input" placeholder="Τηλέφωνο" />
                <input :value="appStore.userEmail" type="email" class="input bg-slate-100" disabled />
              </div>
              <input v-model.trim="profileForm.address" type="text" class="input" placeholder="Διεύθυνση" />
              <div class="grid gap-4 md:grid-cols-3">
                <input v-model.trim="profileForm.city" type="text" class="input" placeholder="Πόλη" />
                <input v-model.trim="profileForm.postal_code" type="text" class="input" placeholder="Ταχυδρομικός κώδικας" />
                <input v-model.trim="profileForm.country" type="text" class="input" placeholder="Χώρα" />
              </div>
              <label class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <input v-model="profileForm.marketing_opt_in" type="checkbox" class="mt-1 rounded border-slate-300 text-primary-600" />
                <span class="text-sm text-slate-600">Αποδέχομαι ενημερωτικά email και προσφορές από το κατάστημα.</span>
              </label>
              <div class="flex justify-end"><button type="submit" class="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60" :disabled="savingProfile">{{ savingProfile ? 'Αποθήκευση...' : 'Αποθήκευση προφίλ' }}</button></div>
            </form>
          </article>
          <div class="space-y-6">
            <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <h2 class="text-xl font-black text-slate-900">Αλλαγή κωδικού πρόσβασης</h2>
              <div v-if="passwordMessage" class="mt-4 rounded-2xl px-4 py-3 text-sm" :class="passwordSuccess ? 'border border-emerald-200 bg-emerald-50 text-emerald-800' : 'border border-rose-200 bg-rose-50 text-rose-700'">{{ passwordMessage }}</div>
              <form class="mt-5 space-y-4" @submit.prevent="changePassword">
                <input v-model="passwordForm.current_password" type="password" class="input" placeholder="Τρέχων κωδικός" required />
                <input v-model="passwordForm.password" type="password" class="input" placeholder="Νέος κωδικός" minlength="8" required />
                <input v-model="passwordForm.password_confirmation" type="password" class="input" placeholder="Επιβεβαίωση νέου κωδικού" minlength="8" required />
                <button type="submit" class="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60" :disabled="savingPassword">{{ savingPassword ? 'Ενημέρωση...' : 'Ενημέρωση κωδικού' }}</button>
              </form>
            </article>
            <article class="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <h2 class="text-xl font-black text-slate-900">Αποθηκευμένες διευθύνσεις</h2>
                <button type="button" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700" @click="startAddressCreate">Προσθήκη διεύθυνσης</button>
              </div>
              <div v-if="savedAddresses.length === 0" class="mt-4 text-sm text-slate-500">Δεν υπάρχουν αποθηκευμένες διευθύνσεις.</div>
              <div v-else class="mt-4 space-y-3">
                <div v-for="(address, index) in savedAddresses" :key="`${address.label || 'address'}-${index}`" class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="font-semibold text-slate-900">{{ address.label || `Διεύθυνση ${index + 1}` }}</div>
                      <div class="mt-1 text-sm text-slate-600">{{ [address.street, address.city, address.postal_code, address.country].filter(Boolean).join(', ') }}</div>
                    </div>
                    <button type="button" class="text-sm font-semibold text-rose-600 hover:text-rose-700" @click="removeAddress(index)">Αφαίρεση</button>
                  </div>
                </div>
              </div>
              <div v-if="showAddressForm" class="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <input v-model.trim="newAddress.label" type="text" class="input" placeholder="Ετικέτα (π.χ. Σπίτι)" />
                <input v-model.trim="newAddress.street" type="text" class="input" placeholder="Οδός και αριθμός" />
                <div class="grid gap-3 md:grid-cols-3">
                  <input v-model.trim="newAddress.city" type="text" class="input" placeholder="Πόλη" />
                  <input v-model.trim="newAddress.postal_code" type="text" class="input" placeholder="Τ.Κ." />
                  <input v-model.trim="newAddress.country" type="text" class="input" placeholder="Χώρα" />
                </div>
                <div class="flex justify-end gap-3">
                  <button type="button" class="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-primary-200 hover:text-primary-700" @click="showAddressForm = false">Ακύρωση</button>
                  <button type="button" class="rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="saveAddress">Αποθήκευση</button>
                </div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { Archive, Calendar, Gift, Heart, RotateCcw, Settings, ShoppingBag, User, Wrench } from 'lucide-vue-next';
import { useAppStore } from '@/stores/app';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { ordersAPI } from '@/services/api/orders';
import { appointmentsAPI } from '@/services/api/appointments';
import { retentionAPI } from '@/services/api/retention';

const router = useRouter();
const route = useRoute();
const appStore = useAppStore();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const allowedTabs = ['orders', 'wishlist', 'saved', 'appointments', 'rewards', 'returns', 'profile'];
const activeTab = ref(allowedTabs.includes(route.query.tab) ? route.query.tab : 'orders');
const orders = ref([]); const appointments = ref([]); const savedCarts = ref([]); const returnRequests = ref([]);
const loadingOrders = ref(false); const loadingAppointments = ref(false);
const profileForm = ref(profileFromUser()); const passwordForm = ref({ current_password: '', password: '', password_confirmation: '' });
const savingProfile = ref(false); const savingPassword = ref(false); const profileMessage = ref(''); const passwordMessage = ref(''); const profileSuccess = ref(false); const passwordSuccess = ref(false);
const savedAddresses = ref([]); const showAddressForm = ref(false); const newAddress = ref(blankAddress()); const referralStatus = ref('');
const returnSubmitting = ref(false); const returnFormSuccess = ref(false); const returnFormMessage = ref(''); const returnForm = ref({ orderId: '', reason: 'Κατεστραμμένο προϊόν', details: '' }); const returnOrderItems = ref([]);
const tabs = computed(() => [
  { key: 'orders', label: 'Παραγγελίες', icon: ShoppingBag, count: orders.value.length || undefined },
  { key: 'wishlist', label: 'Λίστα επιθυμιών', icon: Heart, count: wishlistStore.count || undefined },
  { key: 'saved', label: 'Αποθηκευμένα καλάθια', icon: Archive, count: savedCarts.value.length || undefined },
  { key: 'appointments', label: 'Κρατήσεις', icon: Calendar, count: appointments.value.length || undefined },
  { key: 'rewards', label: 'Ανταμοιβές', icon: Gift },
  { key: 'returns', label: 'Επιστροφές', icon: RotateCcw, count: returnRequests.value.length || undefined },
  { key: 'profile', label: 'Προφίλ', icon: Settings },
]);
const loyaltyBalance = computed(() => Number(appStore.loyaltyPointsBalance || 0));
const loyaltyEarned = computed(() => Number(appStore.loyaltyPointsEarned || 0));
const loyaltyRedeemed = computed(() => Number(appStore.currentUser?.loyalty_points_redeemed || 0));
const referralCode = computed(() => appStore.referralCode || '');
const returnEligibleOrders = computed(() => orders.value.filter(order => Array.isArray(order.items) && order.items.length));
watch(() => route.query.tab, value => { if (allowedTabs.includes(value)) activeTab.value = value; });
watch(activeTab, value => { router.replace({ query: { ...route.query, tab: value } }); });
watch(() => appStore.currentUser, () => { profileForm.value = profileFromUser(); savedAddresses.value = Array.isArray(appStore.currentUser?.saved_addresses) ? [...appStore.currentUser.saved_addresses] : []; }, { immediate: true });
watch(() => returnForm.value.orderId, orderId => {
  const order = orders.value.find(entry => entry.id === orderId);
  returnOrderItems.value = order ? (order.items || []).map(item => ({ itemId: item.itemId || item.inventoryId || item.item_id, collection: item.collection || 'inventory', name: item.name || 'Προϊόν παραγγελίας', quantity: Number(item.quantity || 1), maxQuantity: Number(item.quantity || 1), selected: true })) : [];
});
onMounted(async () => { await Promise.all([loadOrders(), loadAppointments(), loadRetentionData(), wishlistStore.loadWishlist(true)]); });
function profileFromUser() { return { first_name: appStore.currentUser?.first_name || '', last_name: appStore.currentUser?.last_name || '', phone: appStore.currentUser?.phone || '', address: appStore.currentUser?.address || '', city: appStore.currentUser?.city || '', postal_code: appStore.currentUser?.postal_code || '', country: appStore.currentUser?.country || '', marketing_opt_in: Boolean(appStore.currentUser?.marketing_opt_in) }; }
function blankAddress() { return { label: '', street: '', city: '', postal_code: '', country: '' }; }
function setTab(tab) { activeTab.value = tab; }
function formatDate(value) { return value ? new Date(value).toLocaleDateString('el-GR', { day: '2-digit', month: 'short', year: 'numeric' }) : ''; }
function formatAppointmentDate(value) { return value ? new Date(value).toLocaleDateString('el-GR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }) : ''; }
function orderStatusLabel(status) {
  return ({
    pending_payment: 'Αναμονή πληρωμής',
    paid: 'Πληρωμένη',
    processing: 'Σε επεξεργασία',
    shipped: 'Απεστάλη',
    delivered: 'Παραδόθηκε',
    cancelled: 'Ακυρώθηκε',
    ready_for_pickup: 'Έτοιμη για παραλαβή',
    completed: 'Ολοκληρώθηκε',
  }[status] || status || 'Άγνωστη');
}
function orderStatusClass(status) { return ({ pending_payment: 'bg-amber-100 text-amber-800', paid: 'bg-sky-100 text-sky-800', processing: 'bg-violet-100 text-violet-800', shipped: 'bg-indigo-100 text-indigo-800', delivered: 'bg-emerald-100 text-emerald-800', cancelled: 'bg-rose-100 text-rose-800', ready_for_pickup: 'bg-teal-100 text-teal-800', completed: 'bg-emerald-100 text-emerald-800' }[status] || 'bg-slate-100 text-slate-700'); }
function returnStatusClass(status) { return ({ pending: 'bg-amber-100 text-amber-800', approved: 'bg-sky-100 text-sky-800', received: 'bg-violet-100 text-violet-800', refunded: 'bg-emerald-100 text-emerald-800', rejected: 'bg-rose-100 text-rose-800', closed: 'bg-slate-100 text-slate-700' }[status] || 'bg-slate-100 text-slate-700'); }
function appointmentStatusLabel(status) {
  return ({
    scheduled: 'Προγραμματισμένη',
    confirmed: 'Επιβεβαιωμένη',
    completed: 'Ολοκληρώθηκε',
    cancelled: 'Ακυρώθηκε',
  }[status] || status || 'Άγνωστη');
}
function appointmentStatusClass(status) {
  return ({
    scheduled: 'bg-sky-100 text-sky-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    completed: 'bg-slate-100 text-slate-700',
    cancelled: 'bg-rose-100 text-rose-800',
  }[status] || 'bg-slate-100 text-slate-700');
}
function humanizeStatus(status) { return String(status || '').replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()); }
async function loadOrders() { loadingOrders.value = true; try { orders.value = await ordersAPI.getCustomerOrders(appStore.storeId); } catch { orders.value = []; } finally { loadingOrders.value = false; } }
async function loadAppointments() { loadingAppointments.value = true; try { appointments.value = await appointmentsAPI.getCustomerAppointments(appStore.userEmail, appStore.storeId); } catch { appointments.value = []; } finally { loadingAppointments.value = false; } }
async function loadRetentionData() { try { savedCarts.value = appStore.savedCartsEnabled ? await retentionAPI.getSavedCarts(appStore.storeId) : []; returnRequests.value = appStore.returnRequestsEnabled ? await retentionAPI.getReturnRequests(appStore.storeId) : []; } catch { savedCarts.value = []; returnRequests.value = []; } }
async function saveProfile() { savingProfile.value = true; profileMessage.value = ''; try { await appStore.updateProfile({ ...profileForm.value, saved_addresses: savedAddresses.value }); profileSuccess.value = true; profileMessage.value = 'Το προφίλ ενημερώθηκε.'; } catch (error) { profileSuccess.value = false; profileMessage.value = error.response?.data?.message || 'Αδύνατη η ενημέρωση του προφίλ.'; } finally { savingProfile.value = false; } }
async function changePassword() { if (passwordForm.value.password !== passwordForm.value.password_confirmation) { passwordSuccess.value = false; passwordMessage.value = 'Η επιβεβαίωση κωδικού δεν ταιριάζει.'; return; } savingPassword.value = true; passwordMessage.value = ''; try { await appStore.updateProfile({ ...passwordForm.value }); passwordSuccess.value = true; passwordMessage.value = 'Ο κωδικός ενημερώθηκε.'; passwordForm.value = { current_password: '', password: '', password_confirmation: '' }; } catch (error) { passwordSuccess.value = false; passwordMessage.value = error.response?.data?.message || 'Αδύνατη η ενημέρωση του κωδικού.'; } finally { savingPassword.value = false; } }
function startAddressCreate() { newAddress.value = blankAddress(); showAddressForm.value = true; }
async function saveAddress() { if (!newAddress.value.street) return; savedAddresses.value = [...savedAddresses.value, { ...newAddress.value }]; showAddressForm.value = false; await saveProfile(); }
async function removeAddress(index) { savedAddresses.value = savedAddresses.value.filter((_, currentIndex) => currentIndex !== index); await saveProfile(); }
function normalizeOrderItemsToCartItems(items = []) { return items.map(item => { const quantity = Number(item.quantity || 1); const unitPrice = Number(item.unitPrice ?? item.price ?? (quantity > 0 ? Number(item.subtotal || 0) / quantity : 0)); const collection = item.collection || 'inventory'; const inventoryId = item.itemId || item.inventoryId || item.item_id; if (!inventoryId) return null; return { inventoryId, collection, type: item.type || 'general_product', isService: Boolean(item.isService || item.type === 'service' || collection === 'services'), name: item.name || 'Προϊόν παραγγελίας', quantity, unitPrice, image: item.image || null, sku: item.sku || '', stock: item.stock ?? quantity }; }).filter(Boolean); }
function reorder(order) { cartStore.replaceCart(normalizeOrderItemsToCartItems(order.items || [])); router.push('/cart'); }
function addWishlistItemToCart(item) { cartStore.addItem({ ...item, eshopPrice: item.eshopPrice ?? item.price, sellPrice: item.sellPrice ?? item.price, _collection: item._source }, 1); }
async function loadSavedCarts() { savedCarts.value = await retentionAPI.getSavedCarts(appStore.storeId); }
async function loadSavedCart(savedCart) { const payload = await retentionAPI.loadSavedCart(appStore.storeId, savedCart.id); cartStore.replaceCart(payload.items || []); router.push('/cart'); }
async function deleteSavedCart(savedCartId) { await retentionAPI.deleteSavedCart(appStore.storeId, savedCartId); await loadSavedCarts(); }
function openReturn(order) { activeTab.value = 'returns'; returnForm.value.orderId = order.id; }
async function submitReturnRequest() { const items = returnOrderItems.value.filter(item => item.selected && item.quantity > 0).map(item => ({ itemId: item.itemId, collection: item.collection, quantity: item.quantity, name: item.name })); if (!returnForm.value.orderId || !items.length) { returnFormSuccess.value = false; returnFormMessage.value = 'Επιλέξτε παραγγελία και τουλάχιστον ένα προϊόν.'; return; } returnSubmitting.value = true; returnFormMessage.value = ''; try { await retentionAPI.createReturnRequest(appStore.storeId, { order_id: returnForm.value.orderId, reason: returnForm.value.reason, details: returnForm.value.details, items }); returnFormSuccess.value = true; returnFormMessage.value = 'Το αίτημα επιστροφής υποβλήθηκε.'; returnForm.value = { orderId: '', reason: 'Κατεστραμμένο προϊόν', details: '' }; returnOrderItems.value = []; await loadReturnRequests(); } catch (error) { returnFormSuccess.value = false; returnFormMessage.value = error.response?.data?.message || 'Αδύνατη η υποβολή του αιτήματος επιστροφής.'; } finally { returnSubmitting.value = false; } }
async function loadReturnRequests() { returnRequests.value = await retentionAPI.getReturnRequests(appStore.storeId); }
async function copyReferralCode() { if (!referralCode.value) return; await navigator.clipboard.writeText(referralCode.value); referralStatus.value = 'Ο κωδικός σύστασης αντιγράφηκε.'; }
async function handleSignOut() { await appStore.signOut(); wishlistStore.clear(); router.push('/'); }
</script>
