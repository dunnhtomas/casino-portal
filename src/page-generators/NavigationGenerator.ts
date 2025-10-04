import * as fs from 'fs-extra';
import * as path from 'path';

export class NavigationGenerator {
  constructor(private projectPath: string) {}

  async generate() {
    const headerPath = path.join(this.projectPath, 'src/components/Layout/HeaderNavigation.astro');
    const headerContent = `---
import { NavigationCoordinator } from '../../coordinators/NavigationCoordinator';

const navigationCoordinator = new NavigationCoordinator();
const mainNavigation = navigationCoordinator.generateMainNavigation();
---

<header class="bg-white shadow-lg sticky top-0 z-50">
  <nav class="container mx-auto px-6">
    <div class="flex items-center justify-between h-16">
      <!-- Logo -->
      <div class="flex-shrink-0">
        <a href="/" class="text-2xl font-bold text-gold-600">
          🎰 Casino Portal
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          {mainNavigation.map((item) => (
            <div class="relative group">
              <a
                href={item.href}
                class="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gold-600 hover:bg-gold-50 transition-all duration-200 flex items-center"
              >
                {item.label}
                {item.badge && (
                  <span class="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
                {item.children && (
                  <svg class="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </a>
              
              {item.children && (
                <div class="absolute left-0 mt-2 w-56 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                  <div class="py-2">
                    {item.children.map((child) => (
                      <a
                        href={child.href}
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gold-50 hover:text-gold-600 transition-colors"
                      >
                        {child.label}
                        {child.description && (
                          <div class="text-xs text-gray-500 mt-1">{child.description}</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <!-- Mobile menu button -->
      <div class="md:hidden">
        <button id="mobile-menu-button" class="text-gray-700 hover:text-gold-600 focus:outline-none">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    <div id="mobile-menu" class="md:hidden hidden border-t border-gray-200">
      <div class="px-2 pt-2 pb-3 space-y-1 bg-white">
        {mainNavigation.map((item) => (
          <div>
            <a 
              href={item.href} 
              class="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gold-600 hover:bg-gold-50 rounded-md"
            >
              {item.label}
              {item.badge && (
                <span class="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </a>
            {item.children && (
              <div class="pl-4 pb-2">
                {item.children.map((child) => (
                  <a 
                    href={child.href} 
                    class="block px-3 py-2 text-sm text-gray-600 hover:text-gold-600 hover:bg-gold-50 rounded-md"
                  >
                    {child.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  </nav>
</header>

<script>
  document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    mobileMenuButton?.addEventListener('click', function() {
      mobileMenu?.classList.toggle('hidden');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
      const target = event.target as Element;
      if (!mobileMenuButton?.contains(target) && !mobileMenu?.contains(target)) {
        mobileMenu?.classList.add('hidden');
      }
    });
  });
</script>

<style>
  /* Smooth dropdown animations */
  .group:hover .group-hover\\:opacity-100 {
    animation: slideDown 0.3s ease-out;
  }
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>`;
    await fs.ensureDir(path.dirname(headerPath));
    await fs.writeFile(headerPath, headerContent);
  }
}
