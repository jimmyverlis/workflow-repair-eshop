<template>
  <div class="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
    <h1 class="text-3xl font-bold mb-2">Κλείστε Επισκευή</h1>
    <p class="text-gray-500 mb-8">Επιλέξτε υπηρεσίες, διαλέξτε ραντεβού και ολοκληρώστε την κράτηση με πληρωμή.</p>

    <!-- Success state -->
    <div v-if="submitted" class="max-w-lg mx-auto">
      <div class="card">
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check class="w-8 h-8 text-green-600" />
          </div>
          <h2 class="text-2xl font-bold mb-2">Η κράτηση καταχωρήθηκε!</h2>
          <p v-if="result.paymentPending" class="text-gray-600 text-sm">Η πληρωμή σας εκκρεμεί. Αν ανακατευθυνθήκατε πίσω εδώ, ελέγξτε την κατάσταση παραγγελίας.</p>
          <p v-else class="text-gray-600 text-sm">Η κράτησή σας ολοκληρώθηκε επιτυχώς.</p>
        </div>

        <!-- Codes -->
        <div class="bg-gray-50 rounded-lg p-4 mb-5 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500 mb-0.5">Αριθμός Παραγγελίας</div>
              <div class="font-mono font-bold text-primary-600">{{ result.orderNumber }}</div>
            </div>
            <button type="button" @click="copyToClipboard(result.orderNumber)" class="text-gray-400 hover:text-gray-600 p-1 rounded" title="Αντιγραφή">
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <div class="border-t pt-3 flex items-center justify-between">
            <div>
              <div class="text-xs text-gray-500 mb-0.5">Κωδικός Επισκευής</div>
              <div class="font-mono font-bold text-xl text-primary-600">{{ result.deviceCode }}</div>
              <div class="text-xs text-gray-400 mt-0.5">Αποθηκεύστε αυτόν τον κωδικό για παρακολούθηση</div>
            </div>
            <button type="button" @click="copyToClipboard(result.deviceCode)" class="text-gray-400 hover:text-gray-600 p-1 rounded" title="Αντιγραφή">
              <Copy class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- Appointment confirmation -->
        <div v-if="result.appointmentDate && result.appointmentTime" class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
          <div class="flex items-center gap-2 text-blue-800 font-medium text-sm mb-1">
            <CalendarDays class="w-4 h-4" /> Ραντεβού επιβεβαιώθηκε
          </div>
          <div class="text-sm text-blue-700">{{ formatAppointmentDate(result.appointmentDate) }} στις {{ result.appointmentTime }}</div>
        </div>

        <!-- What happens next -->
        <div class="mb-6">
          <div class="text-sm font-semibold text-gray-700 mb-3">Τι γίνεται στη συνέχεια;</div>
          <ol class="space-y-3 text-sm text-gray-600">
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span v-if="result.deliveryMethod === 'courier'">Στείλτε μας τη συσκευή σας με courier. Θα λάβετε οδηγίες αποστολής στο email σας.</span>
              <span v-else>Φέρτε τη συσκευή σας στο κατάστημα{{ result.appointmentDate ? ` ${formatAppointmentDate(result.appointmentDate)}` : '' }}.</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Ο τεχνικός μας θα εξετάσει τη συσκευή και θα επικοινωνήσει μαζί σας με τη διάγνωση.</span>
            </li>
            <li class="flex gap-3">
              <span class="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Θα λάβετε προσφορά επισκευής για έγκριση πριν ξεκινήσει οποιαδήποτε εργασία.</span>
            </li>
          </ol>
        </div>

        <div class="flex gap-3 flex-wrap">
          <RouterLink
            :to="{ path: `/track-repair/${result.deviceId}`, query: { code: result.deviceCode } }"
            class="btn btn-primary flex-1 text-center"
          >
            Παρακολούθηση Επισκευής
          </RouterLink>
          <RouterLink to="/" class="btn btn-secondary">Αρχική</RouterLink>
        </div>
      </div>
    </div>

    <div v-else class="max-w-2xl mx-auto">
      <!-- Step indicator: desktop -->
      <div class="hidden sm:flex items-center mb-8 overflow-x-auto pb-2">
        <div v-for="(label, i) in stepLabels" :key="i" class="flex items-center flex-shrink-0">
          <div
            class="flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-colors"
            :class="step > i + 1 ? 'bg-green-500 text-white' : step === i + 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-500'"
          >
            <Check v-if="step > i + 1" class="w-4 h-4" />
            <span v-else>{{ i + 1 }}</span>
          </div>
          <span class="ml-2 text-sm font-medium whitespace-nowrap" :class="step === i + 1 ? 'text-primary-600' : 'text-gray-500'">{{ label }}</span>
          <div v-if="i < stepLabels.length - 1" class="w-6 md:w-12 h-0.5 mx-2 flex-shrink-0" :class="step > i + 1 ? 'bg-green-500' : 'bg-gray-200'"></div>
        </div>
      </div>

      <!-- Step indicator: mobile -->
      <div class="sm:hidden mb-6">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-semibold text-primary-600">{{ stepLabels[step - 1] }}</span>
          <span class="text-gray-400">Βήμα {{ step }} / {{ stepLabels.length }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-1.5">
          <div
            class="bg-primary-600 h-1.5 rounded-full transition-all duration-300"
            :style="{ width: `${(step / stepLabels.length) * 100}%` }"
          ></div>
        </div>
      </div>

      <!-- Error -->
      <div v-if="errorMsg" class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
        {{ errorMsg }}
      </div>

      <!-- STEP 1: Device -->
      <div v-if="step === 1" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <Smartphone class="w-5 h-5 text-primary-600" /> Στοιχεία Συσκευής
        </h2>
        <form @submit.prevent="goToStep2" class="space-y-4">

          <!-- Brand + Model (manual) — always visible at top -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Μάρκα</label>
              <input ref="brandInputRef" v-model="device.brand" type="text" class="input" placeholder="π.χ. Apple, Samsung" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Μοντέλο</label>
              <input v-model="device.modelCode" type="text" class="input" placeholder="π.χ. iPhone 15, S24" />
            </div>
          </div>

          <!-- Device model catalog search -->
          <div class="relative">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Αναζήτηση στον Κατάλογο
              <span class="text-gray-400 font-normal text-xs ml-1">(προαιρετικό)</span>
            </label>
            <div class="relative">
              <input
                v-model="deviceModelSearch"
                type="text"
                class="input"
                placeholder="Αναζήτηση μοντέλου (π.χ. iPhone 15, Galaxy S24)..."
                @input="onModelSearchInput"
                @blur="onModelSearchBlur"
                autocomplete="off"
              />
              <span v-if="imeiLookupLoading" class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <span class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></span>
              </span>
            </div>

            <!-- Suggestions dropdown -->
            <ul
              v-if="modelSuggestions.length && showModelDropdown"
              class="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg w-full mt-1 max-h-48 overflow-auto"
            >
              <li
                v-for="m in modelSuggestions"
                :key="m.id"
                class="px-4 py-2 hover:bg-primary-50 cursor-pointer text-sm"
                @mousedown.prevent="selectDeviceModel(m)"
              >
                <span class="font-medium">{{ m.brand }}</span> {{ m.name }}
                <span v-if="m.category" class="text-gray-400 text-xs ml-1">({{ m.category }})</span>
              </li>
            </ul>

            <!-- No results: prompt to add manually -->
            <div
              v-else-if="deviceModelSearch.length >= 2 && !modelSuggestions.length"
              class="mt-2 flex flex-wrap items-center justify-between gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm"
            >
              <span class="text-amber-700">Δεν βρέθηκε «{{ deviceModelSearch }}» στον κατάλογο.</span>
              <button
                type="button"
                @mousedown.prevent="addDeviceManually"
                class="text-primary-600 hover:text-primary-800 font-medium underline flex-shrink-0 text-xs"
              >
                Προσθήκη χειροκίνητα ↑
              </button>
            </div>
          </div>

          <!-- IMEI identified banner -->
          <div v-if="imeiIdentified" class="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm">
            <div class="flex items-center gap-2 text-green-800">
              <Check class="w-4 h-4 flex-shrink-0" />
              <span>Αναγνωρίστηκε από IMEI: <strong>{{ imeiIdentified }}</strong></span>
            </div>
            <button type="button" @click="imeiIdentified = ''" class="text-green-600 hover:text-green-800 ml-2 flex-shrink-0 text-lg leading-none">✕</button>
          </div>

          <!-- IMEI + Storage -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">IMEI / Serial (προαιρετικό)</label>
              <input
                v-model="device.imei"
                type="text"
                class="input"
                placeholder="15 ψηφία IMEI"
                maxlength="20"
                @input="onImeiInput"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Αποθηκευτικός χώρος</label>
              <input v-model="device.storage" type="text" class="input" placeholder="π.χ. 128GB" />
            </div>
          </div>

          <!-- Category — last -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Κατηγορία Συσκευής *</label>
            <select v-model="device.category" class="input" required>
              <option value="">Επιλέξτε κατηγορία</option>
              <option value="smartphone">Κινητό Τηλέφωνο</option>
              <option value="tablet">Tablet</option>
              <option value="laptop">Laptop</option>
              <option value="desktop">Desktop PC</option>
              <option value="smartwatch">Smartwatch</option>
              <option value="other">Άλλο</option>
            </select>
          </div>

          <div class="flex justify-end pt-2">
            <button type="submit" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 2: Services -->
      <div v-if="step === 2" class="card">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
          <Wrench class="w-5 h-5 text-primary-600" /> Επιλογή Υπηρεσιών
        </h2>
        <p class="text-sm text-gray-500 mb-4">Επιλέξτε τις υπηρεσίες που χρειάζεστε. Αν δεν είστε σίγουροι, επιλέξτε "Διάγνωση".</p>

        <!-- Category filter notice -->
        <div v-if="device.category && !showAllServices" class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-sm mb-4">
          <span class="text-blue-700">Υπηρεσίες για <strong>{{ categoryLabel(device.category) }}</strong></span>
          <button type="button" @click="loadAllServices" class="text-blue-600 hover:text-blue-800 text-xs underline ml-3 flex-shrink-0">Εμφάνιση όλων</button>
        </div>

        <div v-if="loadingServices" class="text-center py-8 text-gray-400">
          <span class="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mr-2"></span>
          Φόρτωση υπηρεσιών...
        </div>

        <div v-else-if="!services.length" class="text-center py-8 text-gray-400">
          Δεν βρέθηκαν διαθέσιμες υπηρεσίες.
        </div>

        <div v-else class="space-y-3 mb-6">
          <label
            v-for="svc in services"
            :key="svc.id"
            class="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors"
            :class="selectedServiceIds.includes(svc.id) ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
          >
            <input
              type="checkbox"
              :value="svc.id"
              v-model="selectedServiceIds"
              class="w-4 h-4 accent-primary-600"
            />
            <div class="flex-1">
              <div class="font-medium">{{ svc.name }}</div>
              <div v-if="svc.description" class="text-xs text-gray-500 mt-0.5">{{ svc.description }}</div>
            </div>
            <div class="font-bold text-primary-600">€{{ svc.price.toFixed(2) }}</div>
          </label>
        </div>

        <div v-if="selectedServiceIds.length" class="bg-gray-50 rounded-lg p-4 mb-4 flex justify-between items-center">
          <span class="text-sm text-gray-600">Σύνολο επιλεγμένων υπηρεσιών</span>
          <span class="font-bold text-lg text-primary-600">€{{ selectedServicesTotal.toFixed(2) }}</span>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Περιγραφή προβλήματος (προαιρετικό)</label>
          <textarea
            v-model="issue"
            class="input min-h-[80px] resize-y"
            placeholder="π.χ. Η οθόνη δεν ανάβει μετά από πτώση..."
          ></textarea>
        </div>

        <div class="flex justify-between pt-4">
          <button type="button" @click="step = 1" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <button type="button" @click="goToStep3" class="btn btn-primary" :disabled="!selectedServiceIds.length">
            Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
          </button>
        </div>
      </div>

      <!-- STEP 3: Appointment -->
      <div v-if="step === 3" class="card">
        <h2 class="text-xl font-bold mb-2 flex items-center gap-2">
          <CalendarDays class="w-5 h-5 text-primary-600" /> Ραντεβού (προαιρετικό)
        </h2>
        <p class="text-sm text-gray-500 mb-6">Επιλέξτε ημερομηνία και ώρα ή παραλείψτε για να επικοινωνήσουμε μαζί σας.</p>

        <!-- Date picker -->
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Ημερομηνία</label>
          <input
            v-model="appointmentDate"
            type="date"
            class="input"
            :min="minDate"
            :max="maxDate"
            @change="loadSlots"
          />
        </div>

        <!-- Slots -->
        <div v-if="appointmentDate">
          <div v-if="loadingSlots" class="text-center py-4 text-gray-400 text-sm">Φόρτωση διαθέσιμων ωρών...</div>
          <div v-else-if="!slots.length" class="text-sm text-gray-400 py-2">Δεν υπάρχουν διαθέσιμες ώρες για αυτή την ημέρα.</div>
          <div v-else>
            <label class="block text-sm font-medium text-gray-700 mb-2">Ώρα Ραντεβού</label>
            <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
              <button
                v-for="slot in slots"
                :key="slot.start"
                type="button"
                class="py-2 text-sm rounded-lg border-2 transition-colors"
                :class="appointmentTime === slot.start ? 'border-primary-500 bg-primary-50 font-medium text-primary-700' : 'border-gray-200 hover:border-gray-300'"
                @click="appointmentTime = slot.start"
              >
                {{ slot.start }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between pt-6">
          <button type="button" @click="step = 2" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <div class="flex gap-3">
            <button type="button" @click="clearAppointment(); step = 4" class="btn btn-secondary">
              Παράλειψη
            </button>
            <button type="button" @click="goToStep4FromAppointment" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </div>
      </div>

      <!-- STEP 4: Delivery & Contact -->
      <div v-if="step === 4" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <User class="w-5 h-5 text-primary-600" /> Στοιχεία & Παράδοση
        </h2>
        <form @submit.prevent="goToStep5" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Ονοματεπώνυμο *</label>
            <input v-model="customer.name" type="text" class="input" required placeholder="Γιώργης Παπαδόπουλος" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input v-model="customer.email" type="email" class="input" required placeholder="email@example.com" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Τηλέφωνο *</label>
            <input v-model="customer.phone" type="tel" class="input" required placeholder="6912345678" />
          </div>

          <div class="border-t pt-4">
            <label class="block text-sm font-medium text-gray-700 mb-3">Τρόπος Παράδοσης</label>
            <div class="space-y-3">
              <label
                class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
                :class="deliveryMethod === 'store_pickup' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" v-model="deliveryMethod" value="store_pickup" class="mt-1" />
                <div>
                  <div class="font-bold flex items-center gap-2"><Store class="w-4 h-4" /> Άμεση Προσέλευση</div>
                  <div class="text-sm text-gray-500 mt-1">Φέρτε τη συσκευή στο κατάστημα. Δωρεάν.</div>
                </div>
              </label>
              <label
                class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
                :class="deliveryMethod === 'courier' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
              >
                <input type="radio" v-model="deliveryMethod" value="courier" class="mt-1" />
                <div>
                  <div class="font-bold flex items-center gap-2"><Package class="w-4 h-4" /> Αποστολή με Courier</div>
                  <div class="text-sm text-gray-500 mt-1">Στείλτε μας τη συσκευή. Θα σας στείλουμε οδηγίες.</div>
                </div>
              </label>
            </div>
          </div>

          <!-- Courier address -->
          <div v-if="deliveryMethod === 'courier'" class="space-y-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Οδός & Αριθμός *</label>
              <input v-model="shippingAddress.street" type="text" class="input" required placeholder="Λεωφόρος Αθηνών 100" />
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Πόλη *</label>
                <input v-model="shippingAddress.city" type="text" class="input" required placeholder="Αθήνα" />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">ΤΚ *</label>
                <input v-model="shippingAddress.postalCode" type="text" class="input" required placeholder="10431" maxlength="5" />
              </div>
            </div>
          </div>

          <div class="flex justify-between pt-2">
            <button type="button" @click="step = 3" class="btn btn-secondary">
              <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
            </button>
            <button type="submit" class="btn btn-primary">
              Επόμενο <ArrowRight class="w-4 h-4 ml-1 inline" />
            </button>
          </div>
        </form>
      </div>

      <!-- STEP 5: Review & Payment -->
      <div v-if="step === 5" class="card">
        <h2 class="text-xl font-bold mb-6 flex items-center gap-2">
          <CreditCard class="w-5 h-5 text-primary-600" /> Επισκόπηση & Πληρωμή
        </h2>

        <!-- Summary -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6 text-sm space-y-2 border">
          <div class="font-semibold text-gray-700 mb-3">Σύνοψη Κράτησης</div>
          <div class="flex justify-between">
            <span class="text-gray-500">Συσκευή:</span>
            <span class="font-medium">{{ deviceLabel }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-500">Παράδοση:</span>
            <span>{{ deliveryMethod === 'store_pickup' ? 'Άμεση προσέλευση' : 'Courier' }}</span>
          </div>
          <div v-if="appointmentDate && appointmentTime" class="flex justify-between">
            <span class="text-gray-500">Ραντεβού:</span>
            <span>{{ appointmentDate }} {{ appointmentTime }}</span>
          </div>
          <div class="border-t pt-2 mt-2 space-y-1">
            <div v-for="svc in selectedServices" :key="svc.id" class="flex justify-between">
              <span class="text-gray-600">{{ svc.name }}</span>
              <span>€{{ svc.price.toFixed(2) }}</span>
            </div>
            <div class="flex justify-between font-bold text-primary-600 pt-1 border-t">
              <span>Σύνολο</span>
              <span>€{{ selectedServicesTotal.toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <!-- Payment method -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-3">Τρόπος Πληρωμής</label>
          <div class="space-y-3">
            <label
              v-for="pm in availablePaymentMethods"
              :key="pm.value"
              class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer"
              :class="paymentMethod === pm.value ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <input type="radio" v-model="paymentMethod" :value="pm.value" class="mt-1" />
              <div>
                <div class="font-medium">{{ pm.label }}</div>
                <div class="text-sm text-gray-500">{{ pm.description }}</div>
              </div>
            </label>
          </div>
        </div>

        <div class="flex justify-between">
          <button type="button" @click="step = 4" class="btn btn-secondary">
            <ArrowLeft class="w-4 h-4 mr-1 inline" /> Πίσω
          </button>
          <button type="button" @click="submitBooking" :disabled="submitting" class="btn btn-primary px-8">
            <span v-if="submitting" class="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            {{ paymentMethod === 'viva_wallet' ? 'Πληρωμή →' : 'Καταχώριση Κράτησης' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { repairsAPI } from '@/services/api/repairs'
import { paymentsAPI } from '@/services/api/payments'
import { appointmentsAPI } from '@/services/api/appointments'
import {
  Check, ArrowRight, ArrowLeft, Smartphone, Wrench,
  Store, Package, User, CreditCard, CalendarDays, Copy
} from 'lucide-vue-next'

const router = useRouter()
const appStore = useAppStore()

const step = ref(1)
const submitting = ref(false)
const errorMsg = ref('')
const submitted = ref(false)
const result = ref({
  deviceId: '', deviceCode: '', orderNumber: '',
  paymentPending: false, appointmentDate: '', appointmentTime: '', deliveryMethod: '',
})

// Step 1 — Device
const brandInputRef = ref(null)
const device = ref({ category: '', brand: '', modelCode: '', deviceModelId: null, imei: '', storage: '' })
const deviceModelSearch = ref('')
const deviceModels = ref([])
const showModelDropdown = ref(false)
const imeiLookupLoading = ref(false)
const imeiIdentified = ref('')
const modelSuggestions = computed(() => {
  if (!deviceModelSearch.value || deviceModelSearch.value.length < 2) return []
  const q = deviceModelSearch.value.toLowerCase()
  return deviceModels.value.filter(m =>
    m.name?.toLowerCase().includes(q) || m.brand?.toLowerCase().includes(q)
  ).slice(0, 8)
})

// Step 2 — Services
const services = ref([])
const loadingServices = ref(false)
const loadedForCategory = ref(null)
const showAllServices = ref(false)
const selectedServiceIds = ref([])
const issue = ref('')
const selectedServices = computed(() =>
  services.value.filter(s => selectedServiceIds.value.includes(s.id))
)
const selectedServicesTotal = computed(() =>
  selectedServices.value.reduce((sum, s) => sum + s.price, 0)
)

// Step 3 — Appointment
const appointmentDate = ref('')
const appointmentTime = ref('')
const slots = ref([])
const loadingSlots = ref(false)
const minDate = new Date().toISOString().split('T')[0]
const maxDate = (() => {
  const d = new Date(); d.setDate(d.getDate() + 14); return d.toISOString().split('T')[0]
})()

// Step 4 — Delivery & Contact
const deliveryMethod = ref('store_pickup')
const shippingAddress = ref({ street: '', city: '', postalCode: '' })
const customer = ref({ name: '', email: '', phone: '' })

// Step 5 — Payment
const paymentMethod = ref('viva_wallet')

const stepLabels = ['Συσκευή', 'Υπηρεσίες', 'Ραντεβού', 'Στοιχεία', 'Πληρωμή']

const deviceLabel = computed(() => {
  if (device.value.deviceModelId) return deviceModelSearch.value
  return [device.value.brand, device.value.modelCode].filter(Boolean).join(' ') || 'Συσκευή'
})

const availablePaymentMethods = computed(() => {
  const methods = appStore.repairPaymentMethods
  const all = [
    { value: 'viva_wallet', label: 'Κάρτα (Online)', description: 'Ασφαλής πληρωμή μέσω Viva Wallet' },
    { value: 'pay_at_store', label: 'Πληρωμή στο κατάστημα', description: 'Πληρώνετε όταν παραδώσετε τη συσκευή' },
    { value: 'pay_at_courier', label: 'Αντικαταβολή', description: 'Πληρωμή κατά την παράδοση' },
  ]
  return all.filter(m => methods.includes(m.value))
})

function categoryLabel(cat) {
  const map = {
    smartphone: 'Κινητό Τηλέφωνο', tablet: 'Tablet', laptop: 'Laptop',
    desktop: 'Desktop PC', smartwatch: 'Smartwatch', other: 'Άλλο',
  }
  return map[cat] || cat
}

function formatAppointmentDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('el-GR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {})
}

// ── LocalStorage draft persistence ──────────────────────────────────────────

function draftKey() {
  return `repair_booking_draft_${appStore.storeId}`
}

function saveDraft() {
  try {
    localStorage.setItem(draftKey(), JSON.stringify({
      step: step.value,
      device: device.value,
      deviceModelSearch: deviceModelSearch.value,
      selectedServiceIds: selectedServiceIds.value,
      issue: issue.value,
      appointmentDate: appointmentDate.value,
      appointmentTime: appointmentTime.value,
      deliveryMethod: deliveryMethod.value,
      shippingAddress: shippingAddress.value,
      customer: customer.value,
      paymentMethod: paymentMethod.value,
    }))
  } catch { /* non-critical */ }
}

function clearDraft() {
  try { localStorage.removeItem(draftKey()) } catch { /* non-critical */ }
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(draftKey())
    if (!raw) return false
    const draft = JSON.parse(raw)
    if (draft.device) Object.assign(device.value, draft.device)
    if (draft.deviceModelSearch) deviceModelSearch.value = draft.deviceModelSearch
    if (draft.selectedServiceIds?.length) selectedServiceIds.value = draft.selectedServiceIds
    if (draft.issue) issue.value = draft.issue
    if (draft.appointmentDate) appointmentDate.value = draft.appointmentDate
    if (draft.appointmentTime) appointmentTime.value = draft.appointmentTime
    if (draft.deliveryMethod) deliveryMethod.value = draft.deliveryMethod
    if (draft.shippingAddress) Object.assign(shippingAddress.value, draft.shippingAddress)
    if (draft.customer) Object.assign(customer.value, draft.customer)
    if (draft.paymentMethod) paymentMethod.value = draft.paymentMethod
    if (draft.step && draft.step > 1) step.value = draft.step
    return true
  } catch {
    return false
  }
}

// Auto-save whenever form state changes
const draftWatchables = computed(() => JSON.stringify({
  step: step.value, device: device.value, deviceModelSearch: deviceModelSearch.value,
  selectedServiceIds: selectedServiceIds.value, issue: issue.value,
  appointmentDate: appointmentDate.value, appointmentTime: appointmentTime.value,
  deliveryMethod: deliveryMethod.value, shippingAddress: shippingAddress.value,
  customer: customer.value, paymentMethod: paymentMethod.value,
}))
watch(draftWatchables, saveDraft)

// ── IMEI auto-lookup ─────────────────────────────────────────────────────────

async function onImeiInput() {
  const digits = device.value.imei.replace(/\D/g, '')
  if (digits.length !== 15 || imeiLookupLoading.value) return
  imeiLookupLoading.value = true
  try {
    const res = await repairsAPI.lookupDeviceByImei(appStore.storeId, digits)
    if (res.found) {
      device.value.deviceModelId = res.device_model_id
      device.value.brand = res.brand
      device.value.modelCode = res.model_name
      if (res.category && !device.value.category) device.value.category = res.category
      deviceModelSearch.value = `${res.brand} ${res.model_name}`
      imeiIdentified.value = `${res.brand} ${res.model_name}`
    }
  } catch { /* non-critical */ }
  finally { imeiLookupLoading.value = false }
}

// ── Device model autocomplete ─────────────────────────────────────────────────

function onModelSearchInput() {
  device.value.deviceModelId = null
  imeiIdentified.value = ''
  showModelDropdown.value = true
}

function onModelSearchBlur() {
  setTimeout(() => { showModelDropdown.value = false }, 150)
}

function selectDeviceModel(m) {
  device.value.deviceModelId = m.id
  device.value.brand = m.brand
  device.value.modelCode = m.name
  deviceModelSearch.value = `${m.brand} ${m.name}`
  showModelDropdown.value = false
}

function clearDeviceModel() {
  device.value.deviceModelId = null
  showModelDropdown.value = false
}

function addDeviceManually() {
  deviceModelSearch.value = ''
  device.value.deviceModelId = null
  showModelDropdown.value = false
  nextTick(() => brandInputRef.value?.focus())
}

// ── Services loading ──────────────────────────────────────────────────────────

async function loadServicesForCategory(category) {
  loadingServices.value = true
  loadedForCategory.value = category || null
  try {
    services.value = await repairsAPI.getRepairServices(appStore.storeId, category || null)
  } finally {
    loadingServices.value = false
  }
}

async function loadAllServices() {
  showAllServices.value = true
  await loadServicesForCategory(null)
}

async function goToStep2() {
  errorMsg.value = ''
  const cat = device.value.category || null
  const needsReload = !services.value.length || (
    !showAllServices.value && loadedForCategory.value !== cat
  )
  if (needsReload) {
    await loadServicesForCategory(showAllServices.value ? null : cat)
  }
  step.value = 2
}

// ── Navigation helpers ────────────────────────────────────────────────────────

function goToStep3() {
  errorMsg.value = ''
  if (!selectedServiceIds.value.length) {
    errorMsg.value = 'Παρακαλώ επιλέξτε τουλάχιστον μία υπηρεσία.'
    return
  }
  step.value = 3
}

async function loadSlots() {
  if (!appointmentDate.value) return
  loadingSlots.value = true
  slots.value = []
  appointmentTime.value = ''
  try {
    const res = await appointmentsAPI.getAvailableSlots(appStore.storeId, appointmentDate.value, 30)
    slots.value = res?.data?.available_slots || []
  } catch {
    slots.value = []
  } finally {
    loadingSlots.value = false
  }
}

function clearAppointment() {
  appointmentDate.value = ''
  appointmentTime.value = ''
  slots.value = []
}

function goToStep4FromAppointment() {
  if (appointmentDate.value && !appointmentTime.value) {
    errorMsg.value = 'Παρακαλώ επιλέξτε ώρα ραντεβού ή πατήστε "Παράλειψη".'
    return
  }
  errorMsg.value = ''
  step.value = 4
}

function goToStep5() {
  errorMsg.value = ''
  if (deliveryMethod.value === 'courier') {
    const a = shippingAddress.value
    if (!a.street || !a.city || !a.postalCode) {
      errorMsg.value = 'Παρακαλώ συμπληρώστε όλα τα πεδία διεύθυνσης.'
      return
    }
  }
  if (availablePaymentMethods.value.length && !availablePaymentMethods.value.find(m => m.value === paymentMethod.value)) {
    paymentMethod.value = availablePaymentMethods.value[0].value
  }
  step.value = 5
}

// ── Submit ────────────────────────────────────────────────────────────────────

async function submitBooking() {
  submitting.value = true
  errorMsg.value = ''
  try {
    const bookingData = {
      store_id: appStore.storeId,
      customer_id: appStore.currentUser?.id || null,
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
      },
      device: {
        category: device.value.category || null,
        brand: device.value.brand || null,
        model_code: device.value.modelCode || null,
        device_model_id: device.value.deviceModelId || null,
        imei: device.value.imei || null,
        storage: device.value.storage || null,
      },
      service_ids: selectedServiceIds.value,
      issue: issue.value || null,
      delivery_method: deliveryMethod.value,
      shipping_address: deliveryMethod.value === 'courier' ? shippingAddress.value : null,
      payment_method: paymentMethod.value,
      appointment: appointmentDate.value && appointmentTime.value
        ? { date: appointmentDate.value, start_time: appointmentTime.value }
        : null,
    }

    const res = await repairsAPI.createRepairBooking(bookingData)
    const { orderId, orderNumber, deviceId, deviceCode } = res

    if (!res.payment_required || paymentMethod.value !== 'viva_wallet') {
      clearDraft()
      result.value = {
        deviceId,
        deviceCode,
        orderNumber,
        paymentPending: false,
        appointmentDate: appointmentDate.value,
        appointmentTime: appointmentTime.value,
        deliveryMethod: deliveryMethod.value,
      }
      submitted.value = true
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    // Redirect to Viva Wallet
    const paymentResult = await paymentsAPI.createVivaPayment({
      orderId,
      orderNumber,
      amount: Math.round(selectedServicesTotal.value * 100),
      customer: {
        name: customer.value.name,
        email: customer.value.email,
        phone: customer.value.phone,
      },
      successUrl: `${window.location.origin}/order/${orderId}?status=success`,
      failUrl: `${window.location.origin}/order/${orderId}?status=fail`,
    })

    if (!paymentResult.paymentUrl) {
      throw new Error('Αποτυχία δημιουργίας συνεδρίας πληρωμής.')
    }

    clearDraft()
    window.location.href = paymentResult.paymentUrl
  } catch (err) {
    console.error('Repair booking error:', err)
    errorMsg.value = err.response?.data?.message || err.message || 'Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.'
  } finally {
    submitting.value = false
  }
}

// ── Mount ─────────────────────────────────────────────────────────────────────

onMounted(async () => {
  if (!appStore.repairBookingEnabled) {
    router.replace('/')
    return
  }

  if (appStore.requireAuthForRepairBooking && !appStore.isAuthenticated) {
    router.replace({ path: '/login', query: { redirect: '/repair-booking' } })
    return
  }

  // Restore draft before auth pre-fill
  restoreDraft()

  // Auth pre-fill overwrites saved customer data when logged in
  const u = appStore.currentUser
  if (u) {
    customer.value.name = `${u.first_name || ''} ${u.last_name || ''}`.trim()
    customer.value.email = u.email || ''
    customer.value.phone = u.phone || ''
  }

  // Preload device models for autocomplete
  try {
    deviceModels.value = await repairsAPI.getDeviceModels(appStore.storeId)
  } catch { /* non-critical */ }

  // If draft restored to step 2, reload the services list
  if (step.value === 2 && selectedServiceIds.value.length) {
    loadServicesForCategory(showAllServices.value ? null : device.value.category || null).catch(() => {})
  }
})
</script>
