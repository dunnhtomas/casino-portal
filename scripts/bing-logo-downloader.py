#!/usr/bin/env python3

"""
Bing Casino Logo Downloader 2025
Downloads real casino logos using Bing Image Search for our 79 cleaned casino brands
"""

import json
import os
import shutil
from pathlib import Path
import time

# Import bing image downloader
try:
    from bing_image_downloader import downloader
except ImportError:
    print("❌ bing-image-downloader not installed. Run: pip install bing-image-downloader")
    exit(1)

class BingCasinoLogoDownloader:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.search_list_file = self.project_root / 'data' / 'casino-search-list.json'
        self.logos_dir = self.project_root / 'public' / 'images' / 'casinos'
        self.temp_dir = self.project_root / 'temp-bing-downloads'
        self.results_file = self.project_root / 'data' / 'bing-logo-results.json'
        
        self.casinos = []
        self.results = []
        
        self.stats = {
            'total_casinos': 0,
            'attempted': 0,
            'successful': 0,
            'failed': 0,
            'logos_downloaded': 0,
            'start_time': time.time()
        }
        
    def load_casino_data(self):
        """Load our cleaned casino brand data"""
        try:
            with open(self.search_list_file, 'r', encoding='utf-8') as f:
                self.casinos = json.load(f)
            
            self.stats['total_casinos'] = len(self.casinos)
            print(f"🎰 Loaded {self.stats['total_casinos']} casinos for logo downloading")
            
        except FileNotFoundError:
            print(f"❌ Casino search list not found: {self.search_list_file}")
            return False
        except Exception as e:
            print(f"❌ Error loading casino data: {e}")
            return False
            
        return True
    
    def setup_directories(self):
        """Create necessary directories"""
        self.logos_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📁 Logos will be saved to: {self.logos_dir}")
        print(f"📁 Temp downloads: {self.temp_dir}")
        
    def download_casino_logos(self):
        """Download logos for all casinos using Bing Image Search"""
        print("\n🔍 Starting Bing Image Search for casino logos...")
        print("=" * 50)
        
        for i, casino in enumerate(self.casinos, 1):
            print(f"\n[{i}/{len(self.casinos)}] Processing: {casino['brand']}")
            
            self.stats['attempted'] += 1
            
            # Try multiple search queries for better results
            search_queries = self.build_search_queries(casino)
            
            success = False
            for query in search_queries:
                try:
                    print(f"  🔍 Searching: '{query}'")
                    
                    # Use Bing Image Downloader
                    downloader.download(query, 
                                      limit=5,  # Download 5 images to choose from
                                      output_dir=str(self.temp_dir),
                                      adult_filter_off=True,
                                      force_replace=False,
                                      timeout=15)
                    
                    # Process downloaded images
                    if self.process_downloaded_images(casino, query):
                        success = True
                        self.stats['successful'] += 1
                        self.stats['logos_downloaded'] += 1
                        print(f"  ✅ Logo downloaded successfully!")
                        break
                        
                except Exception as e:
                    print(f"  ⚠️  Search failed for '{query}': {e}")
                    continue
                    
                # Small delay between searches
                time.sleep(1)
            
            if not success:
                self.stats['failed'] += 1
                print(f"  ❌ No suitable logo found for {casino['brand']}")
                
                # Add to results with failure info
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'status': 'failed',
                    'searched_queries': search_queries,
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
            
            # Progress report every 10 casinos
            if i % 10 == 0:
                self.print_progress()
                
            # Respectful delay between casinos
            time.sleep(2)
    
    def build_search_queries(self, casino):
        """Build effective search queries for casino logos"""
        brand = casino['brand']
        
        queries = [
            f"{brand} casino logo",
            f"{brand} casino",
            f"{brand} logo",
            f"{brand} gambling logo",
            f"{brand} betting logo"
        ]
        
        # Add search variations if available
        if 'searchVariations' in casino:
            for variation in casino['searchVariations'][:2]:  # Use first 2 variations
                if variation and variation != brand.lower():
                    queries.append(f"{variation} casino logo")
        
        return queries[:3]  # Limit to 3 queries per casino
    
    def process_downloaded_images(self, casino, query):
        """Process and select the best downloaded image"""
        try:
            # Find the downloaded folder
            query_folder = self.temp_dir / query
            
            if not query_folder.exists():
                return False
                
            # Look for downloaded images
            image_files = []
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
                image_files.extend(query_folder.glob(ext))
            
            if not image_files:
                return False
            
            # Select the first valid image (Bing usually returns best matches first)
            best_image = None
            for image_file in image_files:
                # Check file size (skip very small images)
                if image_file.stat().st_size > 5000:  # At least 5KB
                    best_image = image_file
                    break
            
            if not best_image:
                return False
            
            # Copy to our logos directory
            destination = self.logos_dir / f"{casino['slug']}.png"
            
            # Convert to PNG if needed (using basic copy for now)
            shutil.copy2(best_image, destination)
            
            # Clean up temp folder
            shutil.rmtree(query_folder, ignore_errors=True)
            
            # Add to results
            self.results.append({
                'slug': casino['slug'],
                'brand': casino['brand'],
                'status': 'success',
                'search_query': query,
                'logo_file': f"{casino['slug']}.png",
                'original_file': str(best_image),
                'file_size': best_image.stat().st_size,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            })
            
            return True
            
        except Exception as e:
            print(f"    ⚠️  Error processing images: {e}")
            return False
    
    def print_progress(self):
        """Print current progress"""
        duration = time.time() - self.stats['start_time']
        
        print("\n📊 PROGRESS UPDATE")
        print("=" * 20)
        print(f"🎰 Total Casinos: {self.stats['total_casinos']}")
        print(f"✅ Attempted: {self.stats['attempted']}")
        print(f"🎯 Successful: {self.stats['successful']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"🖼️  Logos Downloaded: {self.stats['logos_downloaded']}")
        print(f"⏱️  Runtime: {int(duration // 60)}m {int(duration % 60)}s")
        
        if self.stats['attempted'] > 0:
            success_rate = (self.stats['successful'] / self.stats['attempted']) * 100
            print(f"📈 Success Rate: {success_rate:.1f}%")
        print()
    
    def save_results(self):
        """Save final results"""
        try:
            final_results = {
                'stats': self.stats,
                'results': self.results,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                'total_runtime': time.time() - self.stats['start_time']
            }
            
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(final_results, f, indent=2, ensure_ascii=False)
                
            print(f"💾 Results saved to: {self.results_file}")
            
        except Exception as e:
            print(f"⚠️  Error saving results: {e}")
    
    def cleanup(self):
        """Clean up temporary files"""
        try:
            if self.temp_dir.exists():
                shutil.rmtree(self.temp_dir)
            print("🧹 Cleaned up temporary files")
        except Exception as e:
            print(f"⚠️  Cleanup warning: {e}")
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        duration = time.time() - self.stats['start_time']
        success_rate = (self.stats['successful'] / self.stats['total_casinos']) * 100 if self.stats['total_casinos'] > 0 else 0
        
        print("\n🏆 BING LOGO DOWNLOAD COMPLETE!")
        print("=" * 40)
        print(f"⏱️  Total Duration: {int(duration // 60)}m {int(duration % 60)}s")
        print(f"🎰 Target Casinos: {self.stats['total_casinos']}")
        print(f"✅ Successfully Downloaded: {self.stats['successful']}")
        print(f"❌ Failed Downloads: {self.stats['failed']}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"🖼️  Total Logos Downloaded: {self.stats['logos_downloaded']}")
        
        if self.stats['successful'] > 0:
            print(f"\n✅ SUCCESSFULLY DOWNLOADED LOGOS:")
            print("=" * 35)
            successful_casinos = [r for r in self.results if r['status'] == 'success']
            for i, casino in enumerate(successful_casinos[:10], 1):  # Show first 10
                print(f"{i:2d}. {casino['brand']} -> {casino['logo_file']}")
            
            if len(successful_casinos) > 10:
                print(f"    ... and {len(successful_casinos) - 10} more!")
        
        if self.stats['failed'] > 0:
            print(f"\n❌ FAILED DOWNLOADS ({self.stats['failed']} casinos):")
            failed_casinos = [r for r in self.results if r['status'] == 'failed']
            for casino in failed_casinos[:5]:  # Show first 5 failures
                print(f"  • {casino['brand']}")
            if len(failed_casinos) > 5:
                print(f"  ... and {len(failed_casinos) - 5} more")
        
        print(f"\n💾 Complete results saved to: {self.results_file.name}")
        print(f"📁 Logos saved to: public/images/casinos/")
        
        print(f"\n🚀 NEXT STEPS:")
        print("1. Review downloaded logos")
        print("2. npm run build")
        print("3. docker build -t casino-with-bing-logos .")
        print("4. Your casino portal now has real logos from Bing!")

def main():
    downloader_tool = BingCasinoLogoDownloader()
    
    try:
        # Initialize
        if not downloader_tool.load_casino_data():
            return
            
        downloader_tool.setup_directories()
        
        # Download logos
        downloader_tool.download_casino_logos()
        
        # Generate report
        downloader_tool.generate_final_report()
        
        # Save results
        downloader_tool.save_results()
        
    except KeyboardInterrupt:
        print("\n⚠️  Download interrupted by user")
        downloader_tool.print_progress()
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
    finally:
        downloader_tool.cleanup()

if __name__ == '__main__':
    main()