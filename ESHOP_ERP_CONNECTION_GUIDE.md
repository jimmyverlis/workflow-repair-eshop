# E-Shop to ERP Connection Guide

## Overview

The e-shop and ERP are connected through a **shared Firebase Firestore database**. Both systems read and write to the same collections, allowing real-time synchronization.

## How the Connection Works

### 1. Shared Firebase Project
Both systems use the same Firebase project: `repairshoperp`

**ERP Firebase Config:** `c:\Users\jimmy\repair-shop\src\firebase\config.js`
**E-Shop Firebase Config:** `c:\Users\jimmy\repair-shop-eshop\src\firebase\config.js`

Both are configured with identical Firebase credentials.

### 2. Store ID Matching
Each store in your ERP has a unique 10-digit Store ID. The e-shop connects to a specific store by matching this ID.

**E-Shop Store ID:** Set in `c:\Users\jimmy\repair-shop-eshop\.env.local`
```env
VITE_STORE_ID=1234567890  # Change this to your actual store ID
```

### 3. Shared Firestore Collections

The e-shop reads from these Firestore collections:

| Collection | What E-Shop Uses | What ERP Manages |
|------------|------------------|------------------|
| `stores` | Store info (name, address, contact) | Create/edit stores |
| `inventory` | Products to sell online | Stock levels, pricing |
| `settings` | Store settings, VAT, currency | Business configuration |
| `clients` | Customer information | Customer management |
| `devices` | Repair statuses (for tracking) | Repair workflows |
| `appointments` | Available time slots | Appointment calendar |

### 4. Data Flow

```
┌─────────────┐                    ┌──────────────┐
β"‚     ERP     β"‚ ◄──────────────► β"‚   Firestore  β"‚
β"‚  (Admin)    β"‚   Add Products   β"‚   Database   β"‚
└─────────────┘   Update Stock     └──────────────┘
                                           β–²
                                           β"‚
                                           β"‚ Read Products
                                           β"‚ Create Orders
                                           β–Ό
                                   ┌──────────────┐
                                   β"‚    E-Shop    β"‚
                                   β"‚  (Customer)  β"‚
                                   └──────────────┘
```

## Step-by-Step Connection Setup

### Step 1: Find Your Store ID

**Option A: Through ERP Web Interface**
1. Open your ERP at http://localhost:5173 (or your deployed URL)
2. Login as admin
3. Go to Settings β†' Store Management
4. Copy your 10-digit Store ID

**Option B: Through Firebase Console**
1. Go to https://console.firebase.google.com/project/repairshoperp/firestore
2. Navigate to the `stores` collection
3. Click on your store document
4. Copy the Document ID (this is your Store ID)

### Step 2: Configure E-Shop

Edit: `c:\Users\jimmy\repair-shop-eshop\.env.local`

```env
# Replace 1234567890 with your actual Store ID from Step 1
VITE_STORE_ID=1234567890
VITE_STORE_NAME=My Repair Shop
VITE_STORE_DOMAIN=localhost  # Or your actual domain
VITE_ENVIRONMENT=demo        # Use 'production' when live

# Firebase config (already configured, same as ERP)
VITE_FIREBASE_API_KEY=AIzaSyBLle51e-7dl3BoVL2rJu3rwT0SmHvmTJo
VITE_FIREBASE_AUTH_DOMAIN=repairshoperp.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=repairshoperp
# ... rest of Firebase config
```

### Step 3: Add Products to Inventory (via ERP)

1. Open ERP admin panel
2. Go to **Inventory** section
3. Click **Add New Item**
4. Fill in product details:
   - Name
   - SKU
   - Description
   - Price
   - Stock quantity
   - Category
   - Type: Select "product" (not "part" or "service")
   - **Important:** Set `storeId` to match your store ID
5. Save the product

### Step 4: Restart E-Shop Dev Server

```bash
cd c:/Users/jimmy/repair-shop-eshop
# Kill existing server (Ctrl+C or use task manager)
npm run dev
```

### Step 5: Verify Connection

1. Open e-shop at http://localhost:5175
2. Go to **Product Catalog** page
3. You should see products from your ERP inventory
4. Check browser console for any Firebase errors

## Troubleshooting

### Products Not Showing in E-Shop

**Check 1: Store ID Mismatch**
```javascript
// In browser console on e-shop:
console.log(import.meta.env.VITE_STORE_ID)
```
Compare this with your store ID in Firebase.

**Check 2: Product Type**
Products must have `type: 'product'` in Firestore. Services and parts won't show.

**Check 3: Firebase Permissions**
```javascript
// Test Firestore connection in browser console:
import { collection, getDocs } from 'firebase/firestore'
import { db } from './src/firebase/config'

const snapshot = await getDocs(collection(db, 'inventory'))
console.log('Products:', snapshot.docs.map(d => d.data()))
```

### Orders Not Creating

Check Cloud Functions are deployed:
```bash
cd c:/Users/jimmy/repair-shop/functions
firebase deploy --only functions
```

### Payment Integration Not Working

1. Verify Viva Wallet credentials in ERP Settings
2. Check Cloud Functions logs:
```bash
firebase functions:log --project repairshoperp
```

## Multi-Store Setup

To set up multiple e-shops for different stores:

1. **Create a new store in ERP**
   - Each store gets a unique 10-digit ID

2. **Clone the e-shop codebase**
   ```bash
   cp -r repair-shop-eshop repair-shop-eshop-store2
   ```

3. **Update `.env.local` with new Store ID**
   ```env
   VITE_STORE_ID=9876543210  # New store's ID
   VITE_STORE_NAME=Store 2 Name
   ```

4. **Deploy to different domain**
   - Store 1: shop1.example.com
   - Store 2: shop2.example.com

Both e-shops share the same Firebase backend but show different products/settings based on `storeId`.

## Testing Checklist

- [ ] E-shop loads without errors
- [ ] Products appear in catalog
- [ ] Can add products to cart
- [ ] Store info displays correctly (name, contact)
- [ ] Checkout page loads
- [ ] Repair booking form loads
- [ ] Firebase auth works (customer login)

## Need Help?

1. Check browser console for errors
2. Check Network tab for failed Firebase requests
3. Verify Firestore rules allow read/write
4. Check that inventory items have correct `storeId` field
