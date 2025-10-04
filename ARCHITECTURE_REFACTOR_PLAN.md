# 🏗️ Architecture Refactor Plan
## Compliance with OOP-First & Single Responsibility Principles

### 📋 **Current Issues Identified**

#### **File Length Violations**
- Multiple auto-generated casino pages (~72-73 lines each)
- Need template-based generation system

#### **Single Responsibility Violations**
- `IndexPageViewModel` handling too many concerns
- `SEOManager` mixing different SEO responsibilities

#### **OOP Structure Issues**
- Missing abstraction layers
- Direct imports instead of dependency injection
- Tight coupling between components

#### **Modular Design Issues**
- Hard-coded data in ViewModels
- No clear separation of concerns

---

## 🎯 **Refactoring Strategy**

### **Phase 1: Core Architecture (Single Responsibility)**
1. **Split IndexPageViewModel** into focused classes
2. **Extract Data Providers** from ViewModels  
3. **Create Specialized Managers** for different SEO concerns
4. **Implement Factory Patterns** for dynamic content

### **Phase 2: OOP Structure (Composition over Inheritance)**
1. **Create Interface Contracts** for all managers
2. **Implement Dependency Injection** patterns
3. **Extract Service Layer** for data operations
4. **Build Coordinator Pattern** for complex workflows

### **Phase 3: Modular Design (Loose Coupling)**
1. **Create Template System** for repetitive pages
2. **Implement Strategy Pattern** for different casino types
3. **Build Plugin Architecture** for extensions
4. **Extract Configuration Objects** for all settings

### **Phase 4: File Size Management**
1. **Template-based Page Generation** 
2. **Dynamic Component Factory**
3. **Configuration-driven Architecture**
4. **Automated Code Generation**

---

## 📁 **New Directory Structure**

```
src/
├── core/
│   ├── interfaces/           # All interface contracts
│   ├── types/               # Type definitions
│   ├── constants/           # Application constants
│   └── enums/              # Enumeration types
├── services/
│   ├── data/               # Data access services
│   ├── seo/                # SEO-specific services
│   ├── content/            # Content management services
│   └── navigation/         # Navigation services
├── managers/
│   ├── seo/                # Specialized SEO managers
│   ├── content/            # Content managers
│   ├── casino/             # Casino-specific managers
│   └── page/               # Page management
├── factories/
│   ├── page/               # Page factory classes
│   ├── seo/                # SEO factory classes
│   └── content/            # Content factory classes
├── templates/
│   ├── casino/             # Casino page templates
│   ├── game/               # Game page templates
│   └── bonus/              # Bonus page templates
├── coordinators/
│   ├── page/               # Page coordination
│   ├── seo/                # SEO coordination
│   └── navigation/         # Navigation coordination
├── providers/
│   ├── data/               # Data providers
│   ├── content/            # Content providers
│   └── configuration/      # Configuration providers
└── generators/
    ├── page/               # Page generators
    ├── seo/                # SEO generators
    └── sitemap/            # Sitemap generators
```

---

## 🔧 **Implementation Plan**

### **Step 1: Extract Data Providers**
```typescript
// services/data/ExpertTeamDataProvider.ts
export class ExpertTeamDataProvider implements IDataProvider<ExpertTeam[]> {
  provide(): ExpertTeam[] { /* implementation */ }
}

// services/data/SupportChannelsDataProvider.ts  
export class SupportChannelsDataProvider implements IDataProvider<SupportChannel[]> {
  provide(): SupportChannel[] { /* implementation */ }
}
```

### **Step 2: Split SEO Manager**
```typescript
// managers/seo/HomepageSEOManager.ts
export class HomepageSEOManager implements ISEOManager {
  generateMetadata(): SEOMetadata { /* implementation */ }
}

// managers/seo/CasinoSEOManager.ts
export class CasinoSEOManager implements ISEOManager {
  generateMetadata(casino: Casino): SEOMetadata { /* implementation */ }
}
```

### **Step 3: Create Page Factory**
```typescript
// factories/page/CasinoPageFactory.ts
export class CasinoPageFactory implements IPageFactory {
  createPage(casino: Casino, template: PageTemplate): CasinoPage {
    /* implementation */
  }
}
```

### **Step 4: Template System**
```typescript
// templates/casino/CasinoDetailTemplate.ts
export class CasinoDetailTemplate implements IPageTemplate {
  render(data: CasinoData): string { /* implementation */ }
}
```

---

## ✅ **Compliance Checklist**

### **File Length & Structure**
- [ ] All files under 500 lines
- [ ] Break up files at 400 lines
- [ ] Use folders for logical grouping
- [ ] Template-based generation for repetitive content

### **OOP-First**
- [ ] Every functionality in dedicated class
- [ ] Composition over inheritance
- [ ] Built for reuse, not just "make it work"

### **Single Responsibility**
- [ ] One concern per file/class/function
- [ ] Split multi-responsibility classes
- [ ] Laser-focused components

### **Modular Design**
- [ ] Lego-like interchangeable components
- [ ] Testable and isolated modules
- [ ] Dependency injection patterns
- [ ] Reduced tight coupling

### **Manager & Coordinator Patterns**
- [ ] UI logic → ViewModel
- [ ] Business logic → Manager  
- [ ] Navigation/state flow → Coordinator
- [ ] No direct view-business logic mixing

### **Function & Class Size**
- [ ] Functions under 30-40 lines
- [ ] Classes under 200 lines
- [ ] Split large classes into helpers

### **Naming & Readability**
- [ ] Descriptive, intention-revealing names
- [ ] No vague names (data, info, helper, temp)

### **Scalability Mindset**
- [ ] Extension points from day one
- [ ] Protocol conformance
- [ ] Dependency injection ready

### **Avoid God Classes**
- [ ] No massive files holding everything
- [ ] Split into UI, State, Handlers, Networking

---

## 🚀 **Implementation Priority**

1. **Immediate** (This Week)
   - Extract data providers from ViewModels
   - Split SEOManager into specialized classes
   - Create basic template system

2. **Short Term** (Next Week)
   - Implement factory patterns
   - Build coordinator architecture
   - Create interface contracts

3. **Medium Term** (Following Week)
   - Template-based page generation
   - Plugin architecture
   - Configuration extraction

4. **Long Term** (Ongoing)
   - Automated testing framework
   - Performance optimization
   - Documentation completion