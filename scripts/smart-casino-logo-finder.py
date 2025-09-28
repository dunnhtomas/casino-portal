#!/usr/bin/env python3

"""
Smart Casino Logo Finder 2025 - Enhanced Version
Advanced Bing Image Search with intelligent processing and multiple fallback strategies
"""

import json
import os
import shutil
from pathlib import Path
import time
import requests
from PIL import Image
import io
import hashlib

# Import bing image downloader
try:
    from bing_image_downloader import downloader
except ImportError:
    print("❌ bing-image-downloader not installed. Run: pip install bing-image-downloader")
    exit(1)

class SmartCasinoLogoFinder:
    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.search_list_file = self.project_root / 'data' / 'casino-search-list.json'
        self.logos_dir = self.project_root / 'public' / 'images' / 'casinos'
        self.temp_dir = self.project_root / 'temp-smart-downloads'
        self.results_file = self.project_root / 'data' / 'smart-logo-results.json'
        
        self.casinos = []
        self.results = []
        
        # Quality thresholds
        self.min_file_size = 2000  # 2KB minimum
        self.min_dimensions = (50, 50)  # 50x50 pixels minimum
        self.max_dimensions = (2000, 2000)  # 2000x2000 pixels maximum
        self.preferred_formats = ['.png', '.jpg', '.jpeg', '.webp']
        
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
            print(f"🎰 Loaded {self.stats['total_casinos']} casinos for smart logo finding")
            
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
        
        # Clean temp directory
        if self.temp_dir.exists():
            shutil.rmtree(self.temp_dir)
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        print(f"📁 Logos will be saved to: {self.logos_dir}")
        print(f"📁 Smart temp downloads: {self.temp_dir}")
    
    def build_smart_search_queries(self, casino):
        """Build intelligent search queries with multiple strategies"""
        brand = casino['brand']
        original_brand = casino.get('originalBrand', brand)
        
        # Priority-ordered search strategies
        queries = [
            # Strategy 1: Direct brand logo searches
            f'"{brand}" casino logo site:casino.com OR site:playcasino.com OR site:casino.guru',
            f'"{brand}" logo png high quality',
            f'"{brand}" casino official logo',
            
            # Strategy 2: Brand variations
            f'"{original_brand}" casino logo',
            f'{brand.lower()} casino logo transparent',
            
            # Strategy 3: Generic but targeted
            f'{brand} gambling logo vector',
            f'{brand} casino brand logo',
        ]
        
        # Add search variations if available
        if 'searchVariations' in casino:
            for variation in casino['searchVariations'][:2]:
                if variation and variation != brand.lower():
                    queries.append(f'"{variation}" casino logo')
        
        # Limit to 4 best queries
        return queries[:4]
    
    def download_with_smart_bing(self, query, limit=8):
        """Download images using Bing with enhanced error handling"""
        try:
            print(f"    🔍 Smart search: '{query}' (limit: {limit})")
            
            # Create unique folder name to avoid conflicts
            query_hash = hashlib.md5(query.encode()).hexdigest()[:8]
            search_folder = f"search_{query_hash}"
            
            downloader.download(query, 
                              limit=limit,
                              output_dir=str(self.temp_dir),
                              adult_filter_off=True,
                              force_replace=True,
                              timeout=20)
            
            # Find downloaded images
            query_path = self.temp_dir / query
            if query_path.exists():
                return self.process_downloaded_images(query_path)
            else:
                # Try alternative folder names that Bing might create
                try:
                    for folder in self.temp_dir.iterdir():
                        if folder.is_dir() and query.lower().replace('"', '').replace(' ', '') in folder.name.lower():
                            return self.process_downloaded_images(folder)
                except Exception as e:
                    print(f"      ⚠️  Error searching folders: {e}")
                        
        except Exception as e:
            print(f"      ⚠️  Search failed: {e}")
            
        return []
    
    def process_downloaded_images(self, folder_path):
        """Process and validate downloaded images with smart filtering"""
        valid_images = []
        
        try:
            # Find all image files recursively
            image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.bmp', '.gif']
            image_files = []
            
            # Get all files in the directory and subdirectories
            for file_path in folder_path.rglob('*'):
                if file_path.is_file():
                    if any(file_path.suffix.lower() == ext for ext in image_extensions):
                        image_files.append(file_path)
            
            print(f"      📁 Found {len(image_files)} potential images")
            
            for img_file in image_files:
                if self.validate_image(img_file):
                    valid_images.append(img_file)
                    
            # Sort by quality score (size, dimensions, format preference)
            valid_images.sort(key=self.calculate_image_quality_score, reverse=True)
            
        except Exception as e:
            print(f"      ⚠️  Error processing folder {folder_path}: {e}")
            
        return valid_images[:3]  # Return top 3 best images
    
    def validate_image(self, image_path):
        """Validate image quality and suitability"""
        try:
            # Check file size
            if image_path.stat().st_size < self.min_file_size:
                print(f"        ❌ Too small: {image_path.name} ({image_path.stat().st_size} bytes)")
                return False
            
            # Try to open and validate the image
            with Image.open(image_path) as img:
                width, height = img.size
                
                # Check dimensions
                if width < self.min_dimensions[0] or height < self.min_dimensions[1]:
                    print(f"        ❌ Dimensions too small: {image_path.name} ({width}x{height})")
                    return False
                
                if width > self.max_dimensions[0] or height > self.max_dimensions[1]:
                    print(f"        ⚠️  Large image: {image_path.name} ({width}x{height})")
                    # Don't reject, but note it
                
                # Check if it's a valid image format
                img_format = img.format.lower() if img.format else 'unknown'
                if img_format not in ['png', 'jpeg', 'jpg', 'webp']:
                    print(f"        ⚠️  Unusual format: {image_path.name} ({img_format})")
                
                print(f"        ✅ Valid: {image_path.name} ({width}x{height}, {img.format}, {image_path.stat().st_size} bytes)")
                return True
                
        except Exception as e:
            print(f"        ❌ Invalid image {image_path.name}: {e}")
            return False
    
    def calculate_image_quality_score(self, image_path):
        """Calculate quality score for image ranking"""
        score = 0
        
        try:
            file_size = image_path.stat().st_size
            
            with Image.open(image_path) as img:
                width, height = img.size
                
                # Size score (prefer medium to large sizes)
                if 100000 < file_size < 500000:  # 100KB - 500KB is good
                    score += 20
                elif file_size > 50000:  # At least 50KB
                    score += 10
                
                # Dimension score (prefer square-ish logos, reasonable size)
                if 100 <= width <= 800 and 100 <= height <= 800:
                    score += 15
                
                # Aspect ratio score (prefer logos that aren't too wide/tall)
                ratio = max(width, height) / min(width, height)
                if ratio <= 3:  # Not too stretched
                    score += 10
                
                # Format preference
                ext = image_path.suffix.lower()
                if ext == '.png':
                    score += 15  # PNG usually best for logos
                elif ext in ['.jpg', '.jpeg']:
                    score += 10
                elif ext == '.webp':
                    score += 12
                
                # File name hints
                name_lower = image_path.name.lower()
                if 'logo' in name_lower:
                    score += 10
                if 'casino' in name_lower:
                    score += 5
                if 'icon' in name_lower:
                    score += 8
                
        except Exception as e:
            score = 0
            
        return score
    
    def save_best_logo(self, casino, image_path):
        """Save the best logo with proper naming and optimization"""
        try:
            destination = self.logos_dir / f"{casino['slug']}.png"
            
            # Open, process, and save as PNG
            with Image.open(image_path) as img:
                # Convert to RGBA for PNG with transparency support
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Resize if too large (keep aspect ratio)
                max_size = 800
                if img.width > max_size or img.height > max_size:
                    img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
                
                # Save as high-quality PNG
                img.save(destination, 'PNG', optimize=True)
                
            print(f"        💾 Saved logo: {destination.name}")
            return True
            
        except Exception as e:
            print(f"        ❌ Error saving logo: {e}")
            return False
    
    def smart_casino_logo_search(self):
        """Main smart search function for all casinos"""
        print("\n🧠 Starting Smart Casino Logo Search...")
        print("=" * 50)
        
        for i, casino in enumerate(self.casinos, 1):
            print(f"\n[{i}/{len(self.casinos)}] 🎯 Processing: {casino['brand']}")
            
            self.stats['attempted'] += 1
            
            # Build smart search queries
            search_queries = self.build_smart_search_queries(casino)
            
            best_images = []
            success = False
            
            # Try each query until we find good images
            for query in search_queries:
                images = self.download_with_smart_bing(query, limit=8)
                
                if images:
                    best_images.extend(images)
                    
                    # Try to save the best one
                    for img in images[:2]:  # Try top 2 images
                        if self.save_best_logo(casino, img):
                            success = True
                            self.stats['successful'] += 1
                            self.stats['logos_downloaded'] += 1
                            
                            # Record success
                            self.results.append({
                                'slug': casino['slug'],
                                'brand': casino['brand'],
                                'status': 'success',
                                'search_query': query,
                                'logo_file': f"{casino['slug']}.png",
                                'source_image': str(img),
                                'image_score': self.calculate_image_quality_score(img),
                                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                            })
                            
                            print(f"    ✅ SUCCESS: Found perfect logo for {casino['brand']}!")
                            break
                    
                    if success:
                        break
                
                # Clean up temp files after each query
                self.cleanup_temp_files()
                
                # Respectful delay between queries
                time.sleep(1.5)
            
            if not success:
                self.stats['failed'] += 1
                print(f"    ❌ No suitable logo found for {casino['brand']}")
                
                # Record failure
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'status': 'failed',
                    'searched_queries': search_queries,
                    'images_found': len(best_images),
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
            
            # Progress report every 10 casinos
            if i % 10 == 0:
                self.print_progress()
            
            # Respectful delay between casinos
            time.sleep(2)
    
    def cleanup_temp_files(self):
        """Clean up temporary downloaded files"""
        try:
            if self.temp_dir.exists():
                # Remove all contents
                shutil.rmtree(self.temp_dir, ignore_errors=True)
                # Recreate empty directory
                self.temp_dir.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            print(f"      ⚠️  Cleanup warning: {e}")
    
    def print_progress(self):
        """Print current progress with enhanced stats"""
        duration = time.time() - self.stats['start_time']
        
        print(f"\n📊 SMART PROGRESS UPDATE")
        print("=" * 25)
        print(f"🎰 Total Casinos: {self.stats['total_casinos']}")
        print(f"✅ Attempted: {self.stats['attempted']}")
        print(f"🎯 Successful: {self.stats['successful']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"🖼️  Logos Downloaded: {self.stats['logos_downloaded']}")
        print(f"⏱️  Runtime: {int(duration // 60)}m {int(duration % 60)}s")
        
        if self.stats['attempted'] > 0:
            success_rate = (self.stats['successful'] / self.stats['attempted']) * 100
            print(f"📈 Success Rate: {success_rate:.1f}%")
            
            if self.stats['successful'] > 0:
                avg_time = duration / self.stats['successful']
                print(f"⚡ Avg Time/Logo: {avg_time:.1f}s")
        print()
    
    def save_results(self):
        """Save comprehensive results"""
        try:
            final_results = {
                'stats': self.stats,
                'results': self.results,
                'session_info': {
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'total_runtime': time.time() - self.stats['start_time'],
                    'version': 'Smart Casino Logo Finder v2.0',
                    'success_rate': (self.stats['successful'] / self.stats['total_casinos']) * 100 if self.stats['total_casinos'] > 0 else 0
                }
            }
            
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(final_results, f, indent=2, ensure_ascii=False)
                
            print(f"💾 Smart results saved to: {self.results_file}")
            
        except Exception as e:
            print(f"⚠️  Error saving results: {e}")
    
    def generate_final_report(self):
        """Generate comprehensive final report"""
        duration = time.time() - self.stats['start_time']
        success_rate = (self.stats['successful'] / self.stats['total_casinos']) * 100 if self.stats['total_casinos'] > 0 else 0
        
        print("\n🏆 SMART CASINO LOGO FINDER COMPLETE!")
        print("=" * 45)
        print(f"⏱️  Total Duration: {int(duration // 60)}m {int(duration % 60)}s")
        print(f"🎰 Target Casinos: {self.stats['total_casinos']}")
        print(f"✅ Successfully Downloaded: {self.stats['successful']}")
        print(f"❌ Failed Downloads: {self.stats['failed']}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        print(f"🖼️  Total High-Quality Logos: {self.stats['logos_downloaded']}")
        
        if self.stats['successful'] > 0:
            print(f"\n✅ SUCCESSFULLY DOWNLOADED LOGOS:")
            print("=" * 35)
            successful_casinos = [r for r in self.results if r['status'] == 'success']
            for i, casino in enumerate(successful_casinos[:15], 1):
                score = casino.get('image_score', 0)
                print(f"{i:2d}. {casino['brand']} -> {casino['logo_file']} (score: {score})")
            
            if len(successful_casinos) > 15:
                print(f"    ... and {len(successful_casinos) - 15} more!")
        
        if self.stats['failed'] > 0:
            print(f"\n❌ FAILED DOWNLOADS ({self.stats['failed']} casinos):")
            failed_casinos = [r for r in self.results if r['status'] == 'failed']
            for casino in failed_casinos[:5]:
                images_found = casino.get('images_found', 0)
                print(f"  • {casino['brand']} ({images_found} images found but unsuitable)")
            if len(failed_casinos) > 5:
                print(f"  ... and {len(failed_casinos) - 5} more")
        
        print(f"\n💾 Complete results: {self.results_file.name}")
        print(f"📁 Logos location: public/images/casinos/")
        
        print(f"\n🚀 NEXT STEPS:")
        print("1. Review downloaded high-quality logos")
        print("2. npm run build")
        print("3. docker build -t casino-with-smart-logos .")
        print("4. Your casino portal now has REAL professional logos!")

def main():
    finder = SmartCasinoLogoFinder()
    
    try:
        # Initialize
        if not finder.load_casino_data():
            return
            
        finder.setup_directories()
        
        # Run smart logo search
        finder.smart_casino_logo_search()
        
        # Generate report
        finder.generate_final_report()
        
        # Save results
        finder.save_results()
        
    except KeyboardInterrupt:
        print("\n⚠️  Smart search interrupted by user")
        finder.print_progress()
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        finder.cleanup_temp_files()

if __name__ == '__main__':
    main()