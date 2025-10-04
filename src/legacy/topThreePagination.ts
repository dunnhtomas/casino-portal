/**
 * TopThree Pagination Manager (Client-side)
 * Single Responsibility: Handle pagination logic and UI
 */

export class TopThreePaginationManager {
  private currentPage = 1;
  private totalPages = 2;
  private itemsPerPage = 5;
  private totalItems = 10;
  private touchStartX = 0;
  private touchEndX = 0;

  initialize(): void {
    this.attachEventListeners();
    this.showPage(1);
  }

  private attachEventListeners(): void {
    this.attachPageButtons();
    this.attachNavigationButtons();
    this.attachTouchSupport();
    this.attachKeyboardNavigation();
    this.attachIntersectionObserver();
  }

  private attachPageButtons(): void {
    const buttons = document.querySelectorAll('.pagination-btn') as NodeListOf<HTMLButtonElement>;
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const page = parseInt(btn.getAttribute('data-page') || '1');
        this.showPage(page);
      });
    });
  }

  private attachNavigationButtons(): void {
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.previousPage());
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextPage());
    }
  }

  private attachTouchSupport(): void {
    const grid = document.getElementById('casino-grid');
    if (grid) {
      grid.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
      grid.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }
  }

  private attachKeyboardNavigation(): void {
    document.addEventListener('keydown', (e) => this.handleKeyDown(e));
  }

  private attachIntersectionObserver(): void {
    if (!('IntersectionObserver' in window)) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.trackCasinoView(entry.target as HTMLElement);
        }
      });
    }, { threshold: 0.5 });
    
    document.querySelectorAll('[data-casino]').forEach(card => {
      observer.observe(card);
    });
  }

  showPage(page: number): void {
    this.hideAllPages();
    this.showTargetPage(page);
    this.updatePaginationButtons(page);
    this.updateNavigationButtons(page);
    this.updatePageIndicator(page);
    this.scrollToTop();
    this.trackPageView(page);
    this.currentPage = page;
  }

  private hideAllPages(): void {
    const allPages = document.querySelectorAll('.casino-page') as NodeListOf<HTMLElement>;
    allPages.forEach(pageEl => {
      pageEl.style.display = 'none';
      pageEl.classList.remove('active');
      pageEl.setAttribute('aria-hidden', 'true');
    });
  }

  private showTargetPage(page: number): void {
    const targetPage = document.querySelector(`[data-page="${page}"]`) as HTMLElement;
    if (targetPage) {
      targetPage.style.display = 'block';
      targetPage.classList.add('active');
      targetPage.removeAttribute('aria-hidden');
    }
  }

  private updatePaginationButtons(page: number): void {
    const buttons = document.querySelectorAll('.pagination-btn') as NodeListOf<HTMLButtonElement>;
    buttons.forEach(btn => {
      const isActive = btn.getAttribute('data-page') === page.toString();
      this.toggleButtonActive(btn, isActive);
    });
  }

  private toggleButtonActive(btn: HTMLButtonElement, isActive: boolean): void {
    if (isActive) {
      btn.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gold-50', 'hover:text-gold-700', 'shadow-sm', 'border', 'border-gray-200');
      btn.classList.add('bg-gold-500', 'text-white', 'shadow-md');
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.classList.remove('bg-gold-500', 'text-white', 'shadow-md');
      btn.classList.add('bg-white', 'text-gray-700', 'hover:bg-gold-50', 'hover:text-gold-700', 'shadow-sm', 'border', 'border-gray-200');
      btn.removeAttribute('aria-current');
    }
  }

  private updateNavigationButtons(page: number): void {
    this.updatePrevButton(page);
    this.updateNextButton(page);
  }

  private updatePrevButton(page: number): void {
    const prevBtn = document.getElementById('prev-btn') as HTMLButtonElement;
    if (!prevBtn) return;

    if (page === 1) {
      prevBtn.disabled = true;
      prevBtn.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');
      prevBtn.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gold-50', 'hover:text-gold-700', 'shadow-sm', 'border', 'border-gray-200');
      prevBtn.setAttribute('aria-disabled', 'true');
    } else {
      prevBtn.disabled = false;
      prevBtn.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');
      prevBtn.classList.add('bg-white', 'text-gray-700', 'hover:bg-gold-50', 'hover:text-gold-700', 'shadow-sm', 'border', 'border-gray-200');
      prevBtn.removeAttribute('aria-disabled');
    }
  }

  private updateNextButton(page: number): void {
    const nextBtn = document.getElementById('next-btn') as HTMLButtonElement;
    if (!nextBtn) return;

    if (page === this.totalPages) {
      nextBtn.disabled = true;
      nextBtn.classList.add('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');
      nextBtn.classList.remove('bg-white', 'text-gray-700', 'hover:bg-gold-50', 'hover:text-gold-700', 'shadow-sm', 'border', 'border-gray-200');
      nextBtn.setAttribute('aria-disabled', 'true');
    } else {
      nextBtn.disabled = false;
      nextBtn.classList.remove('bg-gray-200', 'text-gray-400', 'cursor-not-allowed');
      nextBtn.classList.add('bg-white', 'text-gray-700', 'hover:bg-gold-50', 'hover:text-gold-700', 'shadow-sm', 'border', 'border-gray-200');
      nextBtn.removeAttribute('aria-disabled');
    }
  }

  private updatePageIndicator(page: number): void {
    const indicator = document.getElementById('page-indicator');
    if (!indicator) return;

    const startIndex = (page - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(page * this.itemsPerPage, this.totalItems);
    indicator.textContent = `Showing ${startIndex}-${endIndex} of ${this.totalItems} top-rated casinos`;
  }

  private scrollToTop(): void {
    if (window.innerWidth < 768) {
      const section = document.getElementById('top-three');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  private previousPage(): void {
    if (this.currentPage > 1) {
      this.showPage(this.currentPage - 1);
    }
  }

  private nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.showPage(this.currentPage + 1);
    }
  }

  private handleTouchStart(e: TouchEvent): void {
    this.touchStartX = e.changedTouches[0].screenX;
  }

  private handleTouchEnd(e: TouchEvent): void {
    this.touchEndX = e.changedTouches[0].screenX;
    this.handleSwipe();
  }

  private handleSwipe(): void {
    const swipeThreshold = 50;
    const swipeDistance = this.touchStartX - this.touchEndX;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && this.currentPage < this.totalPages) {
        this.showPage(this.currentPage + 1);
      } else if (swipeDistance < 0 && this.currentPage > 1) {
        this.showPage(this.currentPage - 1);
      }
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (e.target && (e.target as HTMLElement).classList.contains('pagination-btn')) {
      if (e.key === 'ArrowLeft' && this.currentPage > 1) {
        e.preventDefault();
        this.previousPage();
      } else if (e.key === 'ArrowRight' && this.currentPage < this.totalPages) {
        e.preventDefault();
        this.nextPage();
      }
    }
  }

  private trackPageView(page: number): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        event_category: 'casino_pagination',
        event_label: `page_${page}`,
        value: page
      });
    }
  }

  private trackCasinoView(element: HTMLElement): void {
    const casinoSlug = element.dataset.casino;
    if (casinoSlug && typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'casino_view', {
        event_category: 'casino_interaction',
        event_label: casinoSlug
      });
    }
  }
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = new TopThreePaginationManager();
    manager.initialize();
  });
}
