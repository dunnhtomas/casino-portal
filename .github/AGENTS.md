# Casino Portal AI Agent Instructions

## Project Context
Building a professional casino comparison website with Astro 5.14.1, TypeScript, and Tailwind CSS.

## Development Standards
- **Architecture**: ViewModel-Manager-Coordinator pattern with dependency injection
- **File Limits**: Maximum 500 lines per file, enforce single responsibility principle
- **TypeScript**: Strict mode compliance, proper interfaces and type definitions
- **CSS**: Tailwind v3 with gold color palette, mobile-first responsive design

## Parallel Development Tasks

### Navigation & Pages (Priority 1)
- Update NavigationCoordinator with dropdown menus and breadcrumbs
- Create missing index pages: /reviews, /bonuses, /games, /best
- Implement mobile hamburger menu with accessibility
- Generate supporting pages: /slots, /free-games, /payments, /mobile

### Content & SEO (Priority 2)  
- Integrate all 79 casinos with enhanced casino cards
- Implement pagination and filtering for reviews
- Add schema markup and meta tags for all pages
- Create bonus comparison tables and game categories

### Quality Assurance (Priority 3)
- Test all navigation links and user flows
- Validate mobile responsive design
- Ensure Docker build compatibility
- Verify logo integration with geo-aware system

## Agent Behavior Guidelines
- **Efficiency**: Execute multiple independent tasks in parallel
- **Quality**: Prioritize TypeScript errors and build issues
- **Communication**: Provide clear progress updates and completion status
- **Testing**: Always test navigation flows after implementation

## Context-Aware Assistance
- Understand casino industry terminology and best practices
- Recognize Canadian gambling regulations and regional requirements  
- Apply professional OOP patterns and clean architecture principles
- Maintain consistency with existing enhanced component system

## Error Handling
- Fix TypeScript compilation errors immediately
- Address CSS conflicts with Tailwind v3
- Resolve import/export issues between components
- Ensure Docker builds complete successfully