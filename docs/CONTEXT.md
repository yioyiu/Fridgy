# Pantry — Developer Specification

> **Purpose:** This document describes the functional and technical design for a mobile-first productivity app that helps users manage home ingredients, avoid spoilage, and reduce waste. It is written for application developers (frontend, backend, mobile, QA) so they can implement the product reliably.

---
## Tech Stack:
Frontend: React Native with TypeScript, Expo, and Expo Router
Backend/Database: Supabase
UI Framework: React Native Paper
AI Processing: DeepSeek



## Table of Contents

1. [Overview](#overview)
2. [Goals & Success Metrics](#goals--success-metrics)
3. [User Stories & Epics](#user-stories--epics)
4. [Primary User Flows](#primary-user-flows)
5. [Screens & UI Components](#screens--ui-components)
6. [Data Model & Schemas](#data-model--schemas)
7. [Complete Database Schema](#complete-database-schema)
8. [Application Folder Structure](#application-folder-structure)
9. [Core Algorithms & Rules](#core-algorithms--rules)
10. [APIs & Endpoints](#apis--endpoints)
11. [Syncing, Offline & Background Work](#syncing-offline--background-work)
12. [Notifications & Reminders](#notifications--reminders)
13. [Statistics & Charts](#statistics--charts)
14. [Integrations & Optional Features](#integrations--optional-features)
15. [Security, Privacy & Compliance](#security-privacy--compliance)
16. [Testing, Monitoring & QA](#testing-monitoring--qa)
17. [Performance & Scalability Considerations](#performance--scalability-considerations)
18. [Implementation Recommendations](#implementation-recommendations)
19. [Appendix: Examples & Snippets](#appendix-examples--snippets)

---

## Overview

When the user opens the app they see a clean welcome screen and, after onboarding, a main dashboard with an inventory list of ingredients. Ingredients are automatically sorted and highlighted by freshness and expiration date. Users can add items quickly (name, quantity, expiration date), edit details, mark items used, and see inventory analytics. The app also sends a daily morning reminder of items nearing expiration and provides charts showing inventory distribution and items that need attention.

This app must be **offline-first**, provide **fast scanning/quick-add**, be reliable across devices (sync), and keep notifications friendly and actionable.

---

## Goals & Success Metrics

- **Reduce food waste for active users** (primary product metric): *% reduction in expired items per user per month*
- **Engagement**: daily active users (DAU) / weekly active users (WAU)
- **Retention**: 7-day, 30-day retention
- **Time-to-save**: average time for user to add first ingredient (goal: < 60s)
- **Notification CTR for morning reminders** (goal: > 20%)

---

## User Stories & Epics

### Epic — Inventory Management
- As a user I want to add ingredients quickly so I can remember what I bought
- As a user I want to see which ingredients are about to expire so I can use them

### Epic — Smart Reminders
- As a user I want daily reminders of soon-to-expire items

### Epic — Analytics
- As a user I want to see charts of categories and near-expiry counts

### Epic — Import & Scan
- As a user I want to scan barcodes or receipts to auto-fill items

### Epic — Sync & Multi-Device
- As a user I want my inventory synced across my devices

---

## Primary User Flows

Each flow includes acceptance criteria and edge-case notes.

### 1. Onboarding

- Show welcome screen → request notification permission → optional sign-in (device: optional anonymous then convert to account)
- **Acceptance**: user completes Quick Add within first session
- **Edge**: user declines notifications — still provide in-app reminders and manual scheduling

### 2. Quick Add (Primary Flow)

**Steps:**
1. User taps **Quick Add**
2. Modal opens with fields: `name`, `quantity`, `unit`, `category`, `expiration_date`, `location` (fridge/freezer/pantry), optional `barcode` and `notes`
3. The app suggests default expiration based on `category` and purchase date
4. User saves — item appears in dashboard & local DB; background sync enqueues

**Acceptance**: item appears in list, sorted by days-to-expiry

### 3. Dashboard / Inventory View

- Default sort: freshness (soonest expiry first). Secondary sort: category or alphabetical
- Items near-expiry (configurable threshold, default: ≤3 days) are highlighted (color strip / badge)
- Actions on each card: *edit*, *mark used*, *consume partial quantity*, *delete*

### 4. Ingredient Detail

- Show item's history, images, barcode lookup, change quantity, add reminders for this item

### 5. Mark Used / Partial Use

- Decrement quantity; if quantity → 0, mark as `used` and optionally log to 'consumed history'

### 6. Statistics & Charts

- Show category distribution (pie), near-expiry trend (bar), waste history (line)

---

## Screens & UI Components

Breakdown of screens and recommended components (React Native / React naming shown for guidance):

### Screens

- `WelcomeScreen` — simple copy, feature highlights, sign in or continue guest
- `DashboardScreen` — shows quick add button and ingredient list
- `IngredientDetailScreen` — full item view & edit
- `QuickAddModal` — floating modal used anywhere
- `StatisticsScreen` — charts and filters
- `SettingsScreen` — thresholds, sync, privacy

### Reusable Components

- `IngredientCard` — small card showing name, qty, days-to-expiry, highlight bar, quick actions
- `Badge` — for statuses: `near-expiry`, `expired`, `fresh`
- `DatePicker`, `QuantityInput`, `LocationPicker`
- `NotificationBanner` — top-of-screen actionable reminder

**UI Behavior Rules:**
- Use color + icon for `near-expiry` but also provide non-color indicator (accessibility)
- Cards must be tappable and have swipe actions (left swipe: edit, right swipe: mark used)

---

## Data Model & Schemas

### Ingredient (JSON Representation)

```json
{
  "id": "uuid-v4",
  "user_id": "uuid-v4",
  "name": "Whole Milk",
  "category": "Dairy",
  "quantity": 1.5,
  "unit": "L",
  "purchase_date": "2025-08-15T10:00:00Z",
  "expiration_date": "2025-08-25",
  "location": "Fridge",
  "barcode": "0123456789012",
  "images": ["/path/to/photo1.jpg"],
  "notes": "Organic",
  "status": "fresh",
  "freshness_score": 0.78,
  "reminders": [
    {
      "id": "r1",
      "type": "push",
      "when": "2025-08-23T08:00:00Z",
      "actioned": false
    }
  ],
  "created_at": "2025-08-15T10:02:00Z",
  "updated_at": "2025-08-15T10:05:00Z"
}
```

**Status Enum Values:**
- `fresh` - Item is fresh and not near expiration
- `near_expiry` - Item is approaching expiration date
- `expired` - Item has passed expiration date
- `used` - Item has been consumed

### SQL Table Schema

```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  quantity REAL DEFAULT 1,
  unit TEXT,
  purchase_date TIMESTAMP,
  expiration_date DATE,
  location TEXT,
  barcode TEXT,
  images JSONB,
  notes TEXT,
  status TEXT,
  freshness_score REAL,
  reminders JSONB,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX idx_user_expiration ON ingredients(user_id, expiration_date);
CREATE INDEX idx_user_category ON ingredients(user_id, category);
CREATE INDEX idx_user_status ON ingredients(user_id, status);
```

---

## Complete Database Schema

### Core Tables

#### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  anonymous_id TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  notification_preferences JSONB DEFAULT '{"daily_reminder": true, "near_expiry_alert": true, "expired_alert": false}',
  settings JSONB DEFAULT '{"default_near_expiry_days": 3, "auto_suggest_expiry": true}',
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_anonymous_id ON users(anonymous_id);
```

#### 2. Categories Table
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#666666',
  default_shelf_life_days INTEGER DEFAULT 7,
  near_expiry_threshold_days INTEGER DEFAULT 3,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default categories
INSERT INTO categories (name, icon, color, default_shelf_life_days, near_expiry_threshold_days, sort_order) VALUES
('Dairy', 'milk', '#87CEEB', 10, 2, 1),
('Meat', 'food-steak', '#FF6B6B', 5, 1, 2),
('Fish', 'fish', '#4ECDC4', 3, 1, 3),
('Vegetables', 'food-apple', '#51CF66', 7, 2, 4),
('Fruits', 'food-apple', '#FFD93D', 5, 2, 5),
('Bread', 'bread-slice', '#D4A574', 7, 1, 6),
('Eggs', 'egg', '#F8F9FA', 28, 5, 7),
('Pantry', 'food-variant', '#6C757D', 365, 30, 8);
```

#### 3. Units Table
```sql
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  abbreviation TEXT,
  is_weight BOOLEAN DEFAULT false,
  is_volume BOOLEAN DEFAULT false,
  is_count BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default units
INSERT INTO units (name, abbreviation, is_weight, is_volume, is_count) VALUES
('Kilogram', 'kg', true, false, false),
('Gram', 'g', true, false, false),
('Pound', 'lb', true, false, false),
('Liter', 'L', false, true, false),
('Milliliter', 'ml', false, true, false),
('Piece', 'pc', false, false, true),
('Pack', 'pack', false, false, true),
('Bottle', 'bottle', false, false, true);
```

#### 4. Locations Table
```sql
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  color TEXT DEFAULT '#666666',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default locations
INSERT INTO locations (name, icon, color, sort_order) VALUES
('Fridge', 'fridge', '#87CEEB', 1),
('Freezer', 'snowflake', '#4ECDC4', 2),
('Pantry', 'cupboard', '#D4A574', 3),
('Counter', 'counter', '#FFD93D', 4);
```

#### 5. Ingredients Table (Enhanced)
```sql
CREATE TABLE ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  quantity REAL DEFAULT 1,
  unit_id UUID REFERENCES units(id),
  purchase_date TIMESTAMP WITH TIME ZONE,
  expiration_date DATE NOT NULL,
  location_id UUID REFERENCES locations(id),
  barcode TEXT,
  images JSONB DEFAULT '[]',
  notes TEXT,
  status TEXT DEFAULT 'fresh' CHECK (status IN ('fresh', 'near_expiry', 'expired', 'used')),
  freshness_score REAL DEFAULT 1.0,
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
CREATE INDEX idx_ingredients_expiration_date ON ingredients(expiration_date);
CREATE INDEX idx_ingredients_status ON ingredients(status);
CREATE INDEX idx_ingredients_category_id ON ingredients(category_id);
CREATE INDEX idx_ingredients_location_id ON ingredients(location_id);
CREATE INDEX idx_ingredients_barcode ON ingredients(barcode);
```

### Supporting Tables

#### 6. Reminders Table
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('daily_summary', 'item_specific', 'custom')),
  title TEXT NOT NULL,
  message TEXT,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  is_actioned BOOLEAN DEFAULT false,
  actioned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_reminders_user_id ON reminders(user_id);
CREATE INDEX idx_reminders_ingredient_id ON reminders(ingredient_id);
CREATE INDEX idx_reminders_scheduled_for ON reminders(scheduled_for);
CREATE INDEX idx_reminders_is_sent ON reminders(is_sent);
```

#### 7. Consumption History Table
```sql
CREATE TABLE consumption_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  quantity_consumed REAL NOT NULL,
  consumption_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  consumption_type TEXT DEFAULT 'used' CHECK (consumption_type IN ('used', 'wasted', 'donated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_consumption_history_user_id ON consumption_history(user_id);
CREATE INDEX idx_consumption_history_ingredient_id ON consumption_history(ingredient_id);
CREATE INDEX idx_consumption_history_consumption_date ON consumption_history(consumption_date);
```

#### 8. Products Table (Barcode Database)
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barcode TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  brand TEXT,
  category_id UUID REFERENCES categories(id),
  default_unit_id UUID REFERENCES units(id),
  default_shelf_life_days INTEGER,
  image_url TEXT,
  nutrition_info JSONB,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category_id ON products(category_id);
```

#### 9. Sync Queue Table
```sql
CREATE TABLE sync_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
  data JSONB,
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  is_processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_is_processed ON sync_queue(is_processed);
CREATE INDEX idx_sync_queue_priority ON sync_queue(priority);
```

### Database Views

#### 1. Ingredient Status View
```sql
CREATE VIEW ingredient_status_view AS
SELECT 
  i.id,
  i.user_id,
  i.name,
  i.category_id,
  c.name as category_name,
  i.quantity,
  i.unit_id,
  u.name as unit_name,
  i.expiration_date,
  i.status,
  i.freshness_score,
  CASE 
    WHEN i.expiration_date < CURRENT_DATE THEN 'expired'
    WHEN i.expiration_date <= CURRENT_DATE + INTERVAL '3 days' THEN 'near_expiry'
    ELSE 'fresh'
  END as calculated_status,
  EXTRACT(DAY FROM (i.expiration_date - CURRENT_DATE)) as days_to_expiry
FROM ingredients i
LEFT JOIN categories c ON i.category_id = c.id
LEFT JOIN units u ON i.unit_id = u.id
WHERE i.is_archived = false;
```

#### 2. User Statistics View
```sql
CREATE VIEW user_statistics_view AS
SELECT 
  u.id as user_id,
  COUNT(i.id) as total_ingredients,
  COUNT(CASE WHEN i.status = 'fresh' THEN 1 END) as fresh_count,
  COUNT(CASE WHEN i.status = 'near_expiry' THEN 1 END) as near_expiry_count,
  COUNT(CASE WHEN i.status = 'expired' THEN 1 END) as expired_count,
  COUNT(CASE WHEN i.status = 'used' THEN 1 END) as used_count,
  AVG(i.freshness_score) as avg_freshness_score
FROM users u
LEFT JOIN ingredients i ON u.id = i.user_id AND i.is_archived = false
GROUP BY u.id;
```

### Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE consumption_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can manage own ingredients" ON ingredients FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own consumption history" ON consumption_history FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own sync queue" ON sync_queue FOR ALL USING (auth.uid() = user_id);

-- Public read access for categories, units, locations, and products
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read access to units" ON units FOR SELECT USING (true);
CREATE POLICY "Public read access to locations" ON locations FOR SELECT USING (true);
CREATE POLICY "Public read access to products" ON products FOR SELECT USING (true);
```

---

## Application Folder Structure

### Root Directory Structure

```
pantry/
├── app/                          # Expo Router app directory
├── src/                          # Source code
├── assets/                       # Static assets
├── docs/                         # Documentation
├── tests/                        # Test files
├── .expo/                        # Expo configuration
├── .github/                      # GitHub workflows
├── android/                      # Android specific files
├── ios/                          # iOS specific files
├── app.json                      # Expo configuration
├── app.config.ts                 # Expo configuration (TypeScript)
├── babel.config.js               # Babel configuration
├── metro.config.js               # Metro bundler configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── .env.example                  # Environment variables template
├── .gitignore                    # Git ignore rules
└── README.md                     # Project documentation
```

### Detailed Source Code Structure

```
src/
├── app/                          # Expo Router app directory
│   ├── (auth)/                   # Authentication routes
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── index.tsx             # Dashboard screen
│   │   ├── ingredients/          # Ingredient management
│   │   │   ├── index.tsx         # Ingredients list
│   │   │   ├── [id].tsx          # Ingredient detail
│   │   │   ├── add.tsx           # Add ingredient
│   │   │   └── edit.tsx          # Edit ingredient
│   │   ├── statistics/           # Analytics & charts
│   │   │   ├── index.tsx
│   │   │   ├── waste.tsx
│   │   │   └── consumption.tsx
│   │   ├── scan/                 # Barcode scanning
│   │   │   ├── index.tsx
│   │   │   └── result.tsx
│   │   ├── settings/             # App settings
│   │   │   ├── index.tsx
│   │   │   ├── notifications.tsx
│   │   │   ├── categories.tsx
│   │   │   └── sync.tsx
│   │   └── _layout.tsx
│   ├── _layout.tsx               # Root layout
│   ├── +not-found.tsx            # 404 page
│   └── +splash.tsx               # Splash screen
├── components/                   # Reusable UI components
│   ├── ui/                       # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Badge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navigation.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterChip.tsx
│   │   ├── DatePicker.tsx
│   │   ├── TimePicker.tsx
│   │   ├── ImagePicker.tsx
│   │   ├── Camera.tsx
│   │   └── index.ts              # Export all UI components
│   ├── ingredients/              # Ingredient-specific components
│   │   ├── IngredientCard.tsx
│   │   ├── IngredientList.tsx
│   │   ├── QuickAddModal.tsx
│   │   ├── IngredientForm.tsx
│   │   ├── ExpiryBadge.tsx
│   │   ├── QuantityInput.tsx
│   │   ├── CategoryPicker.tsx
│   │   ├── LocationPicker.tsx
│   │   ├── UnitPicker.tsx
│   │   ├── IngredientActions.tsx
│   │   ├── IngredientImage.tsx
│   │   ├── BarcodeInput.tsx
│   │   └── index.ts
│   ├── charts/                   # Chart components
│   │   ├── CategoryPieChart.tsx
│   │   ├── ExpiryTrendChart.tsx
│   │   ├── WasteHistoryChart.tsx
│   │   ├── ConsumptionChart.tsx
│   │   ├── InventoryOverview.tsx
│   │   ├── ChartContainer.tsx
│   │   └── index.ts
│   ├── scanner/                  # Barcode scanning components
│   │   ├── BarcodeScanner.tsx
│   │   ├── ScannerOverlay.tsx
│   │   ├── ScannerResult.tsx
│   │   ├── ProductLookup.tsx
│   │   └── index.ts
│   ├── notifications/            # Notification components
│   │   ├── NotificationBanner.tsx
│   │   ├── ReminderCard.tsx
│   │   ├── NotificationSettings.tsx
│   │   └── index.ts
│   ├── settings/                 # Settings components
│   │   ├── SettingsSection.tsx
│   │   ├── SettingsItem.tsx
│   │   ├── ToggleSwitch.tsx
│   │   ├── ColorPicker.tsx
│   │   └── index.ts
│   └── common/                   # Common components
│       ├── Layout.tsx
│       ├── SafeArea.tsx
│       ├── StatusBar.tsx
│       ├── KeyboardAvoidingView.tsx
│       ├── ScrollView.tsx
│       ├── RefreshControl.tsx
│       ├── PullToRefresh.tsx
│       ├── InfiniteScroll.tsx
│       ├── OfflineIndicator.tsx
│       ├── SyncIndicator.tsx
│       └── index.ts
├── hooks/                        # Custom React hooks
│   ├── useIngredients.ts         # Ingredient management
│   ├── useAuth.ts                # Authentication
│   ├── useNotifications.ts       # Push notifications
│   ├── useScanner.ts             # Barcode scanning
│   ├── useSync.ts                # Data synchronization
│   ├── useStatistics.ts          # Analytics data
│   ├── useOffline.ts             # Offline functionality
│   ├── useCamera.ts              # Camera functionality
│   ├── useImagePicker.ts         # Image picker
│   ├── usePermissions.ts         # Permission handling
│   ├── useLocation.ts            # Location services
│   ├── useBiometrics.ts          # Biometric authentication
│   ├── useTheme.ts               # Theme management
│   ├── useLocalization.ts        # Internationalization
│   ├── useAnalytics.ts           # Analytics tracking
│   ├── useErrorBoundary.ts       # Error handling
│   └── index.ts                  # Export all hooks
├── services/                     # API and external services
│   ├── api/                      # API client and endpoints
│   │   ├── client.ts             # Supabase client
│   │   ├── ingredients.ts        # Ingredient API
│   │   ├── auth.ts               # Authentication API
│   │   ├── statistics.ts         # Statistics API
│   │   ├── sync.ts               # Sync API
│   │   ├── products.ts           # Product lookup API
│   │   ├── notifications.ts      # Notification API
│   │   ├── upload.ts             # File upload API
│   │   ├── types.ts              # API response types
│   │   └── index.ts
│   ├── supabase/                 # Supabase configuration
│   │   ├── client.ts
│   │   ├── types.ts              # Generated types
│   │   ├── schema.ts             # Database schema types
│   │   ├── auth.ts               # Auth helpers
│   │   ├── realtime.ts           # Realtime subscriptions
│   │   └── index.ts
│   ├── notifications/            # Push notification service
│   │   ├── index.ts
│   │   ├── scheduler.ts
│   │   ├── handlers.ts
│   │   ├── permissions.ts
│   │   ├── local.ts              # Local notifications
│   │   ├── push.ts               # Push notifications
│   │   └── types.ts
│   ├── scanner/                  # Barcode scanning service
│   │   ├── index.ts
│   │   ├── camera.ts
│   │   ├── barcode.ts
│   │   ├── product-lookup.ts
│   │   ├── ocr.ts                # OCR for receipts
│   │   └── types.ts
│   ├── storage/                  # Local storage service
│   │   ├── index.ts
│   │   ├── database.ts           # Local SQLite database
│   │   ├── cache.ts              # Memory cache
│   │   ├── secure.ts             # Secure storage
│   │   ├── files.ts              # File storage
│   │   └── types.ts
│   ├── sync/                     # Data synchronization
│   │   ├── index.ts
│   │   ├── queue.ts              # Sync queue
│   │   ├── conflict.ts           # Conflict resolution
│   │   ├── offline.ts            # Offline handling
│   │   └── types.ts
│   ├── analytics/                # Analytics service
│   │   ├── index.ts
│   │   ├── events.ts
│   │   ├── metrics.ts
│   │   └── types.ts
│   └── external/                 # External service integrations
│       ├── openfoodfacts.ts      # OpenFoodFacts API
│       ├── deepseek.ts           # DeepSeek AI integration
│       ├── maps.ts               # Maps integration
│       └── types.ts
├── utils/                        # Utility functions
│   ├── constants/                # App constants
│   │   ├── categories.ts
│   │   ├── units.ts
│   │   ├── locations.ts
│   │   ├── colors.ts
│   │   ├── icons.ts
│   │   ├── limits.ts
│   │   ├── validation.ts
│   │   └── index.ts
│   ├── helpers/                  # Helper functions
│   │   ├── date.ts               # Date utilities
│   │   ├── validation.ts         # Form validation
│   │   ├── formatting.ts         # Data formatting
│   │   ├── calculations.ts       # Business logic calculations
│   │   ├── storage.ts            # Storage helpers
│   │   ├── permissions.ts        # Permission helpers
│   │   ├── network.ts            # Network utilities
│   │   ├── device.ts             # Device information
│   │   ├── platform.ts           # Platform-specific helpers
│   │   ├── accessibility.ts      # Accessibility helpers
│   │   └── index.ts
│   ├── types/                    # TypeScript type definitions
│   │   ├── ingredient.ts
│   │   ├── user.ts
│   │   ├── api.ts
│   │   ├── navigation.ts
│   │   ├── database.ts
│   │   ├── notifications.ts
│   │   ├── scanner.ts
│   │   ├── charts.ts
│   │   ├── settings.ts
│   │   └── index.ts
│   ├── config/                   # Configuration files
│   │   ├── app.config.ts
│   │   ├── theme.ts
│   │   ├── environment.ts
│   │   ├── api.config.ts
│   │   ├── storage.config.ts
│   │   └── index.ts
│   └── index.ts                  # Export all utilities
├── store/                        # State management (Zustand)
│   ├── ingredients/
│   │   ├── slice.ts
│   │   ├── selectors.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── auth/
│   │   ├── slice.ts
│   │   ├── selectors.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── notifications/
│   │   ├── slice.ts
│   │   ├── selectors.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── sync/
│   │   ├── slice.ts
│   │   ├── selectors.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── settings/
│   │   ├── slice.ts
│   │   ├── selectors.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── scanner/
│   │   ├── slice.ts
│   │   ├── selectors.ts
│   │   ├── actions.ts
│   │   └── types.ts
│   ├── index.ts                  # Store configuration
│   ├── middleware.ts             # Store middleware
│   └── types.ts                  # Global store types
├── assets/                       # Static assets
│   ├── images/
│   │   ├── icons/
│   │   │   ├── categories/
│   │   │   ├── locations/
│   │   │   ├── actions/
│   │   │   └── ui/
│   │   ├── illustrations/
│   │   │   ├── empty-states/
│   │   │   ├── onboarding/
│   │   │   └── errors/
│   │   ├── logos/
│   │   ├── backgrounds/
│   │   └── placeholders/
│   ├── fonts/
│   │   ├── regular/
│   │   ├── medium/
│   │   ├── bold/
│   │   └── icons/
│   ├── sounds/
│   │   ├── notifications/
│   │   ├── feedback/
│   │   └── ambient/
│   ├── animations/
│   │   ├── lottie/
│   │   └── json/
│   └── data/
│       ├── default-categories.json
│       ├── default-units.json
│       ├── default-locations.json
│       └── sample-data.json
├── styles/                       # Global styles
│   ├── theme.ts                  # Theme configuration
│   ├── global.ts                 # Global styles
│   ├── components.ts             # Component-specific styles
│   ├── animations.ts             # Animation styles
│   ├── typography.ts             # Typography styles
│   ├── spacing.ts                # Spacing system
│   ├── colors.ts                 # Color palette
│   └── index.ts
└── tests/                        # Test files
    ├── unit/
    │   ├── components/
    │   ├── hooks/
    │   ├── utils/
    │   └── services/
    ├── integration/
    │   ├── api/
    │   ├── database/
    │   └── sync/
    ├── e2e/
    │   ├── flows/
    │   ├── screens/
    │   └── scenarios/
    ├── __mocks__/
    │   ├── components/
    │   ├── services/
    │   └── utils/
    ├── setup.ts
    ├── helpers.ts
    └── fixtures/
        ├── ingredients.json
        ├── users.json
        └── responses.json
```

### Key Configuration Files

#### `app.config.ts` (Expo Configuration)
```typescript
import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Pantry',
  slug: 'pantry',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'automatic',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.yourapp.ingredientmanager',
    infoPlist: {
      NSCameraUsageDescription: 'This app uses the camera to scan barcodes and take photos of ingredients.',
      NSPhotoLibraryUsageDescription: 'This app accesses your photo library to add ingredient images.',
      NSLocationWhenInUseUsageDescription: 'This app uses location to suggest nearby stores.'
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.yourapp.ingredientmanager',
    permissions: [
      'CAMERA',
      'READ_EXTERNAL_STORAGE',
      'WRITE_EXTERNAL_STORAGE',
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'VIBRATE',
      'RECEIVE_BOOT_COMPLETED',
      'WAKE_LOCK'
    ]
  },
  plugins: [
    'expo-router',
    'expo-notifications',
    'expo-camera',
    'expo-barcode-scanner',
    'expo-sqlite',
    'expo-image-picker',
    'expo-file-system',
    'expo-device',
    'expo-constants',
    'expo-location',
    'expo-secure-store',
    'expo-haptics'
  ],
  scheme: 'fridgy',
  experiments: {
    typedRoutes: true
  }
});
```

#### `package.json` Dependencies
```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "expo-sqlite": "~13.2.0",
    "expo-notifications": "~0.27.0",
    "expo-camera": "~14.0.0",
    "expo-barcode-scanner": "~12.9.0",
    "expo-device": "~5.9.0",
    "expo-constants": "~15.4.0",
    "expo-image-picker": "~14.7.0",
    "expo-file-system": "~16.0.0",
    "expo-location": "~16.5.0",
    "expo-secure-store": "~12.8.0",
    "expo-haptics": "~12.8.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "react-native-paper": "^5.12.0",
    "react-native-safe-area-context": "4.8.0",
    "react-native-screens": "~3.29.0",
    "@supabase/supabase-js": "^2.39.0",
    "zustand": "^4.4.0",
    "date-fns": "^2.30.0",
    "react-native-chart-kit": "^6.12.0",
    "react-native-svg": "14.1.0",
    "react-native-reanimated": "~3.6.0",
    "react-native-gesture-handler": "~2.14.0",
    "react-native-vector-icons": "^10.0.0",
    "react-native-async-storage": "^1.21.0",
    "react-native-netinfo": "^11.2.0",
    "react-native-permissions": "^4.1.0",
    "react-native-image-crop-picker": "^0.40.0",
    "react-native-qrcode-scanner": "^1.5.5",
    "react-native-sound": "^0.11.2",
    "react-native-vibration": "^0.2.0",
    "react-native-background-timer": "^2.4.1",
    "react-native-push-notification": "^8.1.1",
    "react-native-local-notifications": "^1.0.0",
    "react-native-calendar-events": "^2.2.0",
    "react-native-share": "^10.0.2",
    "react-native-fs": "^2.20.0",
    "react-native-zip-archive": "^6.1.0",
    "react-native-email": "^1.1.0",
    "react-native-sms": "^1.12.0",
    "react-native-phone-call": "^1.1.0",
    "react-native-maps": "1.10.0",
    "react-native-geolocation-service": "^5.3.1",
    "react-native-google-places-autocomplete": "^2.5.6",
    "react-native-google-signin": "^10.1.1",
    "react-native-apple-signin": "^1.1.2",
    "react-native-biometrics": "^3.0.1",
    "react-native-keychain": "^8.1.3",
    "react-native-device-info": "^10.11.0",
    "react-native-app-version": "^1.0.0",
    "react-native-splash-screen": "^3.3.0",
    "react-native-orientation-locker": "^1.4.0",
    "react-native-keep-awake": "^4.0.1",
    "react-native-bluetooth-escpos-printer": "^0.2.0",
    "react-native-thermal-receipt-printer": "^1.0.0",
    "react-native-print": "^0.2.0",
    "react-native-html-to-pdf": "^0.12.0",
    "react-native-view-shot": "^3.7.0",
    "react-native-share-menu": "^4.0.0",
    "react-native-document-picker": "^9.0.1",
    "react-native-pdf": "^6.7.4",
    "react-native-blob-util": "^0.19.6",
    "react-native-image-resizer": "^1.4.5",
    "react-native-image-cache": "^1.0.0",
    "react-native-fast-image": "^8.6.3",
    "react-native-super-grid": "^4.8.1",
    "react-native-flatlist-slider": "^1.0.0",
    "react-native-snap-carousel": "^4.0.0-beta.6",
    "react-native-swipe-list-view": "^3.2.9",
    "react-native-draggable-flatlist": "^4.0.1",
    "react-native-sortable-list": "^0.0.22",
    "react-native-collapsible": "^1.6.1",
    "react-native-accordion": "^1.0.0",
    "react-native-modal": "^13.0.1",
    "react-native-popup-menu": "^0.15.12",
    "react-native-action-sheet": "^0.1.0",
    "react-native-bottom-sheet": "^4.4.0",
    "react-native-sheet": "^1.0.0",
    "react-native-tooltip": "^0.0.1",
    "react-native-tooltips": "^1.0.0",
    "react-native-tooltip-menu": "^1.0.0",
    "react-native-tooltip-overlay": "^1.0.0",
    "react-native-tooltip-popup": "^1.0.0",
    "react-native-tooltip-text": "^1.0.0",
    "react-native-tooltip-view": "^1.0.0",
    "react-native-tooltip-wrapper": "^1.0.0",
    "react-native-tooltip-container": "^1.0.0",
    "react-native-tooltip-content": "^1.0.0",
    "react-native-tooltip-item": "^1.0.0",
    "react-native-tooltip-list": "^1.0.0",
    "react-native-tooltip-menu": "^1.0.0",
    "react-native-tooltip-overlay": "^1.0.0",
    "react-native-tooltip-popup": "^1.0.0",
    "react-native-tooltip-text": "^1.0.0",
    "react-native-tooltip-view": "^1.0.0",
    "react-native-tooltip-wrapper": "^1.0.0",
    "react-native-tooltip-container": "^1.0.0",
    "react-native-tooltip-content": "^1.0.0",
    "react-native-tooltip-item": "^1.0.0",
    "react-native-tooltip-list": "^1.0.0"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@types/react": "~18.2.45",
    "@types/react-native": "~0.72.0",
    "typescript": "^5.1.3",
    "jest": "^29.0.0",
    "@testing-library/react-native": "^12.0.0",
    "@testing-library/jest-native": "^5.4.0",
    "jest-expo": "~50.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0",
    "eslint-config-expo": "^7.0.0",
    "prettier": "^3.0.0",
    "husky": "^8.0.0",
    "lint-staged": "^15.0.0"
  }
}
```

#### `tsconfig.json` (TypeScript Configuration)
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/services/*": ["src/services/*"],
      "@/utils/*": ["src/utils/*"],
      "@/store/*": ["src/store/*"],
      "@/assets/*": ["src/assets/*"],
      "@/types/*": ["src/utils/types/*"],
      "@/constants/*": ["src/utils/constants/*"],
      "@/helpers/*": ["src/utils/helpers/*"]
    },
    "types": ["react-native", "jest", "node"],
    "allowSyntheticDefaultImports": true,
    "esModuleInterop": true,
    "jsx": "react-jsx",
    "lib": ["dom", "esnext"],
    "moduleResolution": "node",
    "noEmit": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowJs": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".expo/types/**/*.ts",
    "expo-env.d.ts"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

---

## Core Algorithms & Rules

### 1. Days-to-Expiry Calculation

```javascript
const daysToExpiry = (expirationDate - today).inDays;

// Status determination
if (daysToExpiry <= 0) {
  status = 'expired';
} else if (daysToExpiry <= nearExpiryThreshold) {
  status = 'near_expiry';
} else {
  status = 'fresh';
}
```

- `days_to_expiry <= 0` → status `expired`
- `days_to_expiry <= near_expiry_threshold` → status `near_expiry` (default threshold = 3 days but configurable per-category)

### 2. Freshness Score (0..1)

A normalized score used for sorting and UI intensity.

```javascript
const freshnessScore = Math.max(0, Math.min(1, 
  1 - (now - purchaseDate) / shelfLifeEstimate
));
```

- `shelf_life_estimate` derived by category (e.g., milk 10 days, eggs 28 days)
- Combine two inputs: time-to-expiry and category perishability weight

**Example:** `score = 0.6 * time_based + 0.4 * category_based`

### 3. Auto-Suggestions for Expiration

When Quick Add lacks expiration date, suggest `purchase_date + default_shelf_life[category]` or present a small picker with 3 options.

### 4. Highlighting Rules

- `expired` items: red badge + high priority in the list (top section) / or hidden depending on settings
- `near_expiry` items: orange/yellow gradient; attach reminder suggestions

---

## APIs & Endpoints

Prefer GraphQL for flexible front-end queries. REST examples shown.

### Authentication

```http
POST /auth/signup
POST /auth/login  
POST /auth/anonymous
```

### Ingredients Management

```http
GET    /v1/ingredients?user_id={}&category={}&status={}&location={}&search={}
POST   /v1/ingredients
PUT    /v1/ingredients/{id}
PATCH  /v1/ingredients/{id}
DELETE /v1/ingredients/{id}
```

**Query Parameters:**
- `user_id` (required): User identifier
- `category`: Filter by ingredient category
- `status`: Filter by freshness status
- `location`: Filter by storage location
- `search`: Text search in ingredient names

### Statistics

```http
GET /v1/stats/inventory?range=30d
```

### Import & Barcode

```http
POST /v1/ingredients/import
GET  /v1/products/{barcode}
```

**Notes:**
- Responses should return `etag` or `updated_at` to help sync conflict resolution
- Support pagination for large result sets

---

## Syncing, Offline & Background Work

### Local Storage Strategy

- Use a local DB (SQLite/Realm/Room/WatermelonDB) to store ingredients and mutation queue
- Keep UI responsive with local reads/writes; sync in background

### Sync Strategy

- **Offline-first**: write locally and enqueue mutations
- Background sync tries to send mutations to server; server responds with authoritative record (with `updated_at` & `version`)
- **Conflict resolution policy**: CRDT/merge preferred, otherwise last-write-wins (LWW) with version numbers and manual conflict resolution UI for ambiguous edits

### Background Tasks

- Daily job to compute `near-expiry` and schedule local notifications for that user's timezone
- Periodic sync: when network available, attempt immediate sync

---

## Notifications & Reminders

### Notification Types

- **Daily Morning Summary** (default at 08:00 local time) — lists top 3 items to use
- **Item-specific reminder** — scheduled per item (e.g., 1 day before expiry)
- **Actionable notifications** — allow `Snooze 1 day`, `Mark used`, `Open app` actions

### Payload Example (FCM/APNs)

```json
{
  "title": "Morning: 3 items near expiry",
  "body": "Milk (exp in 2 days), Spinach (exp in 1 day)...",
  "data": {
    "type": "daily_summary",
    "ids": ["uuid1", "uuid2"]
  }
}
```

### Scheduling Rules

- Respect user timezone; schedule locally if user declined server push tokens
- If an item is edited or deleted, cancel its pending reminders

---

## Statistics & Charts

### Key Metrics to Expose

- Inventory distribution by category (pie chart)
- Near-expiry count (number & percent)
- Weekly consumption vs waste (bar/line chart)
- Most-wasted items (top N)

### Endpoints

```http
GET /v1/stats/inventory?range=30d
```

Returns aggregated counts per category and expiry buckets.

### Frontend Behavior

- Provide filters (time range, category)
- Chart data should be pre-aggregated on server for large datasets but computed on-device for real-time small sets

---

## Integrations & Optional Features

- **Barcode lookup** — integrate with OpenFoodFacts or a commercial product database to auto-fill name & category
- **OCR / Receipt parsing** — allow bulk import from receipts
- **Recipe suggestions** — suggest recipes using soon-to-expire items (requires recipe DB & matcher)
- **Shopping list sync** — create shopping lists from depleted categories
- **Siri Shortcuts / Widgets** — Quick Add from iOS home screen; Android widgets likewise

---

## Security, Privacy & Compliance

- **TLS** for all network traffic
- **Encrypt sensitive data** at rest (if storing photos or personal notes)
- **Local-only mode** option (no cloud sync)
- **Minimal data retention** for analytics; provide export/delete account endpoints
- **Comply with GDPR/CCPA** basics: data export & delete

---

## Testing, Monitoring & QA

### Testing Strategy

- **Unit Tests**: freshness algorithms, sorting, reminder scheduling
- **Integration Tests**: sync & conflict cases
- **E2E Tests**: add/edit/delete flows, notification actions

### Monitoring

- **Crash Reporting**: Sentry/Datadog for crashes
- **Analytics**: events for retention/engagement metrics
- **Performance**: sync timing, notification delivery rates

---

## Performance & Scalability Considerations

- Index `expiration_date`, `user_id`, `category` on database
- For large inventories (>2000 items) paginate and lazy-load photos
- Batch server updates during sync to reduce requests
- Implement caching for frequently accessed data

---

## Implementation Recommendations

### Technology Stack

**Mobile:**
- React Native + TypeScript (Expo or bare)
- Alternatives: SwiftUI (iOS) / Kotlin (Android)

**Local Database:**
- Realm or SQLite (with WatermelonDB for React Native for high-performance sync scenarios)

**Backend:**
- Node.js + PostgreSQL + optional Redis for job scheduling
- Or Firebase (Firestore + Cloud Functions) for faster MVP

**Notifications:**
- FCM (Android) + APNs (iOS)
- Use a server scheduler to send morning summaries or rely on local scheduled notifications

**Barcode/OCR:**
- ML Kit or ZXing + Tesseract (or platform-native frameworks)

**Charting:**
- Recharts / Victory / Chart.js (web)
- Victory Native / react-native-svg-charts (mobile)

---

## Appendix: Examples & Snippets

### Example Near-Expiry Configuration

```json
{
  "default_near_expiry_days": 3,
  "category_overrides": {
    "Dairy": 2,
    "Bread": 1,
    "Eggs": 5
  }
}
```

### Sample Sync Conflict Scenario (Recommended Resolution)

1. Device A edits quantity to 0 (mark used) at `t1`
2. Device B edits quantity to 2 at `t2` (offline) and then syncs

**Resolution:**
- Server receives t1 then t2. If `t2 > t1`, server applies t2
- App should present a conflict resolution action: *"This item changed on another device — accept remote or keep local"*

### Sample CSV Import Format

```csv
name,category,quantity,unit,purchase_date,expiration_date,location,notes
Milk,Dairy,1,L,2025-08-15,2025-08-25,Fridge,Organic
Spinach,Vegetables,200,g,2025-08-16,2025-08-20,Fridge,Fresh
```

### Shelf Life Defaults by Category

```json
{
  "Dairy": 10,
  "Meat": 5,
  "Fish": 3,
  "Vegetables": 7,
  "Fruits": 5,
  "Bread": 7,
  "Eggs": 28,
  "Pantry": 365
}
```

---

## Deliverables Checklist

### For Implementation Teams

- [ ] Design comps for each screen (mobile & tablet)
- [ ] Component library with `IngredientCard`, `QuickAddModal`, `Badge` etc.
- [ ] Local DB model + server DB schema
- [ ] API spec + tests (contract testing)
- [ ] Background sync & queue implementation
- [ ] Notification scheduler (server and local)
- [ ] Barcode/OCR integration
- [ ] Charts and analytics endpoints
- [ ] QA test plans and automated test suites

---

## Next Steps & Notes for Developers

### Priority Decisions

- Define category shelf-life defaults and make them editable by product managers
- Choose sync conflict policy early — CRDTs are safer but costlier to implement
- Prototype Quick Add with barcode fallback to manual entry to ensure rapid MVP

### Development Phases

1. **Phase 1**: Core inventory management (add, edit, delete, basic dashboard)
2. **Phase 2**: Notifications and reminders
3. **Phase 3**: Analytics and charts
4. **Phase 4**: Advanced features (barcode, OCR, recipe suggestions)

---

*Document version: 1.0 — created 2025-08-31*
*Last updated: 2025-08-31*
