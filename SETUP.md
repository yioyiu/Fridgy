# Ingredient Manager - Setup Guide

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS development) or Android Studio (for Android development)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ingredient-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Supabase Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Note down your project URL and anon key

2. **Set up the database schema**
   Run the following SQL in your Supabase SQL editor:

   ```sql
   -- Enable necessary extensions
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

   -- Create tables (see docs/CONTEXT.md for complete schema)
   -- Users table
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

   -- Categories table
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

   -- Units table
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

   -- Locations table
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

   -- Ingredients table
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

   -- Create indexes
   CREATE INDEX idx_ingredients_user_id ON ingredients(user_id);
   CREATE INDEX idx_ingredients_expiration_date ON ingredients(expiration_date);
   CREATE INDEX idx_ingredients_status ON ingredients(status);
   CREATE INDEX idx_ingredients_category_id ON ingredients(category_id);
   CREATE INDEX idx_ingredients_location_id ON ingredients(location_id);
   CREATE INDEX idx_ingredients_barcode ON ingredients(barcode);

   -- Enable Row Level Security
   ALTER TABLE users ENABLE ROW LEVEL SECURITY;
   ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;
   ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
   ALTER TABLE units ENABLE ROW LEVEL SECURITY;
   ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

   -- Create RLS policies
   CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
   CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
   CREATE POLICY "Users can manage own ingredients" ON ingredients FOR ALL USING (auth.uid() = user_id);
   CREATE POLICY "Public read access to categories" ON categories FOR SELECT USING (true);
   CREATE POLICY "Public read access to units" ON units FOR SELECT USING (true);
   CREATE POLICY "Public read access to locations" ON locations FOR SELECT USING (true);
   ```

3. **Configure authentication**
   - In your Supabase dashboard, go to Authentication > Settings
   - Enable email/password authentication
   - Optionally enable social providers (Google, Apple, etc.)

## Running the App

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## Development

### Project Structure
```
src/
├── app/                    # Expo Router screens
├── components/             # Reusable UI components
├── services/              # API and external services
├── store/                 # Zustand state management
└── utils/                 # Helper functions and constants
```

### Key Features Implemented
- ✅ Ingredient management (CRUD operations)
- ✅ Barcode scanning
- ✅ Statistics and analytics
- ✅ Settings and preferences
- ✅ Supabase integration
- ✅ Offline-first architecture
- ✅ TypeScript support

### Next Steps
- [ ] Implement authentication flow
- [ ] Add push notifications
- [ ] Implement data export/import
- [ ] Add advanced charts and analytics
- [ ] Implement recipe suggestions
- [ ] Add shopping list functionality

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **TypeScript errors**
   ```bash
   npm run type-check
   ```

3. **Supabase connection issues**
   - Verify your environment variables
   - Check your Supabase project status
   - Ensure RLS policies are correctly configured

### Getting Help

- Check the [Expo documentation](https://docs.expo.dev/)
- Review the [Supabase documentation](https://supabase.com/docs)
- See the detailed specification in `docs/CONTEXT.md`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
