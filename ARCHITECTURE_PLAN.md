/**
 * Architecture Refactoring Plan
 * Following strict architectural principles for modularity and maintainability
 */

## Current Analysis
- **NavigationCoordinator.ts**: 206 lines - Acceptable but monitor
- **IndexPageViewModel.ts**: 101 lines - Good size
- Need to audit large Astro components and extract business logic

## Refactoring Principles

### 1. File Length & Structure Rules
- **Maximum 500 lines** - Split at 400 lines
- **Never exceed 1000 lines** even temporarily
- Use folders and naming for logical grouping

### 2. OOP-First Design
- Every functionality in dedicated class/struct/protocol
- Favor composition over inheritance
- Build for reuse, not just functionality

### 3. Single Responsibility Principle
- One file = One responsibility
- One class = One concern
- Split immediately when multiple responsibilities emerge

### 4. Manager & Coordinator Patterns
- **ViewModel**: UI logic and state
- **Manager**: Business logic and operations
- **Coordinator**: Navigation and flow control
- **Service**: External integrations and data access

### 5. Modular Design (Lego Architecture)
- Interchangeable components
- Testable in isolation
- Loose coupling via dependency injection

## Proposed Architecture Structure

```
src/
├── core/
│   ├── interfaces/           # Protocols and contracts
│   ├── types/               # Shared type definitions
│   └── constants/           # Application constants
├── managers/                # Business logic
│   ├── casino/             # Casino-specific managers
│   ├── content/            # Content management
│   ├── rating/             # Rating and scoring
│   └── data/               # Data operations
├── coordinators/           # Navigation and flow
│   ├── navigation/         # Route coordination
│   ├── page/              # Page flow management
│   └── user/              # User experience flow
├── viewmodels/            # UI logic and state
│   ├── pages/             # Page-specific ViewModels
│   ├── components/        # Component ViewModels
│   └── shared/            # Reusable ViewModels
├── services/              # External integrations
│   ├── api/               # API communications
│   ├── data/              # Data fetching services
│   └── external/          # Third-party integrations
├── components/            # UI Components (< 200 lines each)
│   ├── ui/                # Pure UI components
│   ├── business/          # Business logic components
│   └── layout/            # Layout components
└── utils/                 # Small, focused utilities
    ├── formatters/        # Data formatting
    ├── validators/        # Input validation
    └── helpers/           # Pure functions
```

## Implementation Strategy

### Phase 1: Extract Large Components
1. Identify components > 400 lines
2. Split into focused sub-components
3. Extract business logic to managers

### Phase 2: Create Manager Classes
1. BusinessLogicManager for complex operations
2. DataManager for data operations
3. UIStateManager for component states

### Phase 3: Implement Coordinator Pattern
1. PageCoordinator for page transitions
2. ComponentCoordinator for component interactions
3. DataFlowCoordinator for data management

### Phase 4: Modularize Utilities
1. Split utility functions into focused classes
2. Implement dependency injection
3. Create reusable protocols

## Benefits
- **Maintainable**: Small, focused files
- **Testable**: Isolated components
- **Scalable**: Modular architecture
- **Readable**: Clear naming and structure
- **Reusable**: Composition-based design