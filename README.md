# Pantry

A mobile-first productivity app that helps users manage home ingredients, avoid spoilage, and reduce waste.

## 🚀 Current Status

**Phase 1 Complete**: Core inventory management functionality
- ✅ Project setup and configuration
- ✅ TypeScript configuration with path aliases
- ✅ Core types and constants
- ✅ Helper functions (date, validation, formatting)
- ✅ State management with Zustand
- ✅ Basic UI components (Button, Card, Badge)
- ✅ Ingredient Card component with status indicators
- ✅ Quick Add Modal for adding ingredients
- ✅ Main Dashboard screen with ingredient list
- ✅ Tab navigation structure
- ✅ Sample data for testing

## 📱 Features Implemented

### Core Functionality
- **Ingredient Management**: Add, edit, delete, and mark ingredients as used
- **Status Tracking**: Automatic status calculation (fresh, near expiry, expired, used)
- **Quick Add**: Modal for quickly adding new ingredients
- **Search & Filter**: Basic search functionality and filter chips
- **Responsive UI**: Clean, modern interface with proper status indicators

### UI Components
- **IngredientCard**: Displays ingredient information with status badges
- **QuickAddModal**: Form for adding new ingredients
- **Dashboard**: Main screen with ingredient list and FAB
- **Tab Navigation**: Ingredients, Statistics, Scan, Settings

## 🛠 Tech Stack

- **Frontend**: React Native with TypeScript
- **Navigation**: Expo Router
- **UI Framework**: React Native Paper
- **State Management**: Zustand
- **Database**: Supabase (configured, not yet connected)
- **Date Handling**: date-fns
- **Icons**: React Native Vector Icons

## 📁 Project Structure

```
src/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Main tab navigation
│   │   ├── index.tsx      # Dashboard screen
│   │   ├── statistics/    # Statistics screen
│   │   ├── overview/      # Storage overview screen
│   │   ├── settings/      # Settings screen
│   │   └── _layout.tsx    # Tab layout
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   └── ingredients/      # Ingredient-specific components
├── store/                # State management
│   └── ingredients/      # Ingredient store
├── services/             # API and external services
│   └── supabase/         # Supabase configuration
├── utils/                # Utility functions
│   ├── constants/        # App constants
│   ├── helpers/          # Helper functions
│   └── types/            # TypeScript types
└── assets/               # Static assets
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pantry
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone

## 📋 Next Steps (Phase 2)

### Planned Features
- [ ] **Supabase Integration**: Connect to real database
- [ ] **Authentication**: User signup/login
- [ ] **Barcode Scanning**: Scan product barcodes
- [ ] **Notifications**: Expiry reminders
- [ ] **Statistics**: Charts and analytics
- [ ] **Offline Support**: Local storage and sync
- [ ] **Image Upload**: Add photos to ingredients
- [ ] **Categories Management**: Custom categories
- [ ] **Export/Import**: Data backup and restore

### Technical Improvements
- [ ] **API Layer**: Complete Supabase integration
- [ ] **Error Handling**: Better error boundaries
- [ ] **Testing**: Unit and integration tests
- [ ] **Performance**: Optimize rendering and data loading
- [ ] **Accessibility**: Screen reader support
- [ ] **Internationalization**: Multi-language support

## 🎯 Key Features from Specification

### ✅ Implemented
- Ingredient CRUD operations
- Status calculation (fresh/near expiry/expired/used)
- Quick add functionality
- Basic search and filtering
- Responsive UI with status indicators
- Tab-based navigation

### 🔄 In Progress
- Database integration
- Real-time sync
- Offline support

### 📋 Planned
- Barcode scanning
- Push notifications
- Analytics and charts
- Advanced filtering
- Image support
- Export/import functionality

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions, please open an issue in the GitHub repository.
