#!/usr/bin/env python3

"""
Ultra Smart Casino Logo Finder 2025
Simplified, bulletproof approach with maximum reliability
"""

import json
import os
import shutil
import time
import requests
from PIL import Image
import io
import hashlib
import glob

# Import bing image downloader
try:
    from bing_image_downloader import downloader
except ImportError:
    print("❌ bing-image-downloader not installed. Run: pip install bing-image-downloader")
    exit(1)

class UltraSmartLogoFinder:
    def __init__(self):
        self.project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.search_list_file = os.path.join(self.project_root, 'data', 'casino-search-list.json')
        self.logos_dir = os.path.join(self.project_root, 'public', 'images', 'casinos')
        self.temp_dir = os.path.join(self.project_root, 'temp-ultra-downloads')
        self.results_file = os.path.join(self.project_root, 'data', 'ultra-logo-results.json')
        
        self.casinos = []
        self.results = []
        
        # Quality settings
        self.min_file_size = 2000  # 2KB minimum
        self.min_width = 50
        self.min_height = 50
        self.max_size = 2000
        
        self.stats = {
            'total_casinos': 0,
            'attempted': 0,
            'successful': 0,
            'failed': 0,
            'logos_found': 0,
            'start_time': time.time()
        }
        
    def load_casino_data(self):
        """Load casino data with error handling"""
        try:
            with open(self.search_list_file, 'r', encoding='utf-8') as f:
                self.casinos = json.load(f)
            
            self.stats['total_casinos'] = len(self.casinos)
            print(f"🎰 Loaded {self.stats['total_casinos']} casinos for ultra-smart search")
            return True
            
        except Exception as e:
            print(f"❌ Error loading casino data: {e}")
            return False
    
    def setup_directories(self):
        """Setup directories with proper error handling"""
        try:
            os.makedirs(self.logos_dir, exist_ok=True)
            
            # Clean and create temp directory
            if os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir, ignore_errors=True)
            os.makedirs(self.temp_dir, exist_ok=True)
            
            print(f"📁 Ultra logos directory: {self.logos_dir}")
            print(f"📁 Ultra temp directory: {self.temp_dir}")
            
        except Exception as e:
            print(f"❌ Directory setup error: {e}")
            return False
            
        return True
    
    def build_ultra_search_queries(self, casino):
        """Build ultra-targeted search queries"""
        brand = casino['brand']
        original = casino.get('originalBrand', brand)
        
        # Ultra-focused queries for maximum success
        queries = [
            f'"{brand}" casino logo high quality',
            f'{brand} casino official logo png',
            f'"{brand}" gambling logo',
            f'{brand} casino brand logo'
        ]
        
        # Add variations if available
        if 'searchVariations' in casino and casino['searchVariations']:
            for variation in casino['searchVariations'][:2]:
                if variation and variation != brand.lower():
                    queries.append(f'"{variation}" casino logo')
        
        return queries[:3]  # Top 3 queries only
    
    def ultra_download_images(self, query, limit=10):
        """Ultra-reliable image download with bulletproof error handling"""
        downloaded_images = []
        
        try:
            print(f"    🔍 Ultra search: '{query}' (limit: {limit})")
            
            # Create safe query folder name
            safe_query = "".join(c for c in query if c.isalnum() or c in (' ', '-', '_')).rstrip()
            safe_query = safe_query.replace(' ', '_')[:50]  # Limit length
            
            # Download with ultra settings
            downloader.download(query, 
                              limit=limit,
                              output_dir=self.temp_dir,
                              adult_filter_off=True,
                              force_replace=True,
                              timeout=25)
            
            # Find downloaded images with multiple strategies
            search_paths = [
                os.path.join(self.temp_dir, query),
                os.path.join(self.temp_dir, safe_query),
            ]
            
            # Also search all subdirectories
            for root, dirs, files in os.walk(self.temp_dir):
                for dir_name in dirs:
                    if any(word in dir_name.lower() for word in query.lower().split()):
                        search_paths.append(os.path.join(root, dir_name))
            
            # Process all possible paths
            for search_path in search_paths:
                if os.path.exists(search_path):
                    images = self.process_ultra_images(search_path)
                    downloaded_images.extend(images)
                    if images:
                        print(f"      ✅ Found {len(images)} quality images in {os.path.basename(search_path)}")
                        break
            
        except Exception as e:
            print(f"      ⚠️  Ultra search error: {e}")
            
        return downloaded_images[:5]  # Return top 5 images
    
    def process_ultra_images(self, folder_path):
        """Process images with ultra validation"""
        quality_images = []
        
        try:
            # Find all image files using glob
            image_patterns = ['*.jpg', '*.jpeg', '*.png', '*.webp', '*.JPG', '*.JPEG', '*.PNG', '*.WEBP']
            all_files = []
            
            for pattern in image_patterns:
                pattern_path = os.path.join(folder_path, pattern)
                all_files.extend(glob.glob(pattern_path))
                
                # Also search subdirectories
                subdir_pattern = os.path.join(folder_path, '**', pattern)
                all_files.extend(glob.glob(subdir_pattern, recursive=True))
            
            print(f"      📁 Found {len(all_files)} image files")
            
            # Validate each image
            for img_path in all_files:
                if self.ultra_validate_image(img_path):
                    quality_images.append(img_path)
            
            # Sort by quality
            quality_images.sort(key=self.ultra_quality_score, reverse=True)
            
        except Exception as e:
            print(f"      ⚠️  Image processing error: {e}")
            
        return quality_images
    
    def ultra_validate_image(self, image_path):
        """Ultra-strict image validation"""
        try:
            # Check file exists and size
            if not os.path.exists(image_path):
                return False
                
            file_size = os.path.getsize(image_path)
            if file_size < self.min_file_size:
                print(f"        ❌ Too small: {os.path.basename(image_path)} ({file_size} bytes)")
                return False
            
            # Validate with PIL
            with Image.open(image_path) as img:
                width, height = img.size
                
                if width < self.min_width or height < self.min_height:
                    print(f"        ❌ Dimensions too small: {os.path.basename(image_path)} ({width}x{height})")
                    return False
                
                # Check format
                img_format = img.format if img.format else 'unknown'
                
                print(f"        ✅ Valid: {os.path.basename(image_path)} ({width}x{height}, {img_format}, {file_size} bytes)")
                return True
                
        except Exception as e:
            print(f"        ❌ Invalid: {os.path.basename(image_path)} - {e}")
            return False
    
    def ultra_quality_score(self, image_path):
        """Calculate ultra quality score"""
        score = 0
        
        try:
            file_size = os.path.getsize(image_path)
            filename = os.path.basename(image_path).lower()
            
            with Image.open(image_path) as img:
                width, height = img.size
                
                # File size scoring
                if 20000 < file_size < 300000:  # 20KB - 300KB sweet spot
                    score += 25
                elif file_size > 10000:
                    score += 15
                
                # Dimensions scoring
                if 100 <= width <= 600 and 100 <= height <= 600:
                    score += 20
                
                # Aspect ratio (prefer square-ish logos)
                ratio = max(width, height) / min(width, height)
                if ratio <= 2.5:
                    score += 15
                
                # Format preference
                ext = os.path.splitext(image_path)[1].lower()
                if ext == '.png':
                    score += 20
                elif ext in ['.jpg', '.jpeg']:
                    score += 15
                elif ext == '.webp':
                    score += 18
                
                # Filename hints
                if 'logo' in filename:
                    score += 15
                if 'casino' in filename:
                    score += 10
                if 'icon' in filename:
                    score += 12
                if 'brand' in filename:
                    score += 8
                
        except:
            score = 0
            
        return score
    
    def ultra_save_logo(self, casino, image_path):
        """Save logo with ultra processing"""
        try:
            destination = os.path.join(self.logos_dir, f"{casino['slug']}.png")
            
            with Image.open(image_path) as img:
                # Convert to RGBA for PNG transparency
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Smart resize if needed
                if img.width > 800 or img.height > 800:
                    img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                
                # Save as optimized PNG
                img.save(destination, 'PNG', optimize=True, compress_level=6)
                
            file_size = os.path.getsize(destination)
            print(f"        💾 ULTRA SAVED: {os.path.basename(destination)} ({file_size} bytes)")
            return True
            
        except Exception as e:
            print(f"        ❌ Save error: {e}")
            return False
    
    def ultra_cleanup(self):
        """Ultra-thorough cleanup"""
        try:
            if os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir, ignore_errors=True)
                os.makedirs(self.temp_dir, exist_ok=True)
        except Exception as e:
            print(f"      ⚠️  Cleanup warning: {e}")
    
    def run_ultra_search(self):
        """Run the ultra-smart logo search"""
        print("\n🚀 STARTING ULTRA-SMART LOGO SEARCH...")
        print("=" * 55)
        
        for i, casino in enumerate(self.casinos, 1):
            print(f"\n[{i}/{len(self.casinos)}] 🎯 ULTRA Processing: {casino['brand']}")
            
            self.stats['attempted'] += 1
            success = False
            
            # Try ultra search queries
            search_queries = self.build_ultra_search_queries(casino)
            
            for query in search_queries:
                images = self.ultra_download_images(query, limit=12)
                
                if images:
                    # Try to save the best logo
                    for img in images[:3]:  # Try top 3 images
                        if self.ultra_save_logo(casino, img):
                            success = True
                            self.stats['successful'] += 1
                            self.stats['logos_found'] += 1
                            
                            # Record ultra success
                            self.results.append({
                                'slug': casino['slug'],
                                'brand': casino['brand'],
                                'status': 'ULTRA_SUCCESS',
                                'query': query,
                                'logo_file': f"{casino['slug']}.png",
                                'source': os.path.basename(img),
                                'quality_score': self.ultra_quality_score(img),
                                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                            })
                            
                            print(f"    🏆 ULTRA SUCCESS: Perfect logo found for {casino['brand']}!")
                            break
                    
                    if success:
                        break
                
                # Ultra cleanup between searches
                self.ultra_cleanup()
                time.sleep(1)
            
            if not success:
                self.stats['failed'] += 1
                print(f"    ❌ No ultra logo found for {casino['brand']}")
                
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'status': 'FAILED',
                    'queries_tried': search_queries,
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
            
            # Progress update
            if i % 10 == 0:
                self.print_ultra_progress()
            
            # Respectful pause
            time.sleep(1.5)
    
    def print_ultra_progress(self):
        """Print ultra progress stats"""
        duration = time.time() - self.stats['start_time']
        
        print(f"\n🏆 ULTRA PROGRESS UPDATE")
        print("=" * 30)
        print(f"🎰 Total Casinos: {self.stats['total_casinos']}")
        print(f"🚀 Attempted: {self.stats['attempted']}")
        print(f"✅ Ultra Successful: {self.stats['successful']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"🖼️  Ultra Logos: {self.stats['logos_found']}")
        print(f"⏱️  Runtime: {int(duration // 60)}m {int(duration % 60)}s")
        
        if self.stats['attempted'] > 0:
            success_rate = (self.stats['successful'] / self.stats['attempted']) * 100
            print(f"📈 Ultra Success Rate: {success_rate:.1f}%")
        print()
    
    def generate_ultra_report(self):
        """Generate final ultra report"""
        duration = time.time() - self.stats['start_time']
        success_rate = (self.stats['successful'] / self.stats['total_casinos']) * 100 if self.stats['total_casinos'] > 0 else 0
        
        print("\n🏆 ULTRA-SMART LOGO FINDER COMPLETE!")
        print("=" * 50)
        print(f"⏱️  Total Ultra Duration: {int(duration // 60)}m {int(duration % 60)}s")
        print(f"🎰 Target Casinos: {self.stats['total_casinos']}")
        print(f"🚀 Ultra Successful: {self.stats['successful']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"📈 Ultra Success Rate: {success_rate:.1f}%")
        print(f"🖼️  Ultra High-Quality Logos: {self.stats['logos_found']}")
        
        if self.stats['successful'] > 0:
            print(f"\n✅ ULTRA SUCCESSFUL DOWNLOADS:")
            print("=" * 40)
            successful = [r for r in self.results if r['status'] == 'ULTRA_SUCCESS']
            for i, result in enumerate(successful[:20], 1):
                score = result.get('quality_score', 0)
                print(f"{i:2d}. {result['brand']} -> {result['logo_file']} (score: {score})")
            
            if len(successful) > 20:
                print(f"    ... and {len(successful) - 20} more ultra logos!")
        
        print(f"\n💾 Ultra results saved")
        print(f"📁 Ultra logos location: public/images/casinos/")
        print(f"\n🚀 NEXT ULTRA STEPS:")
        print("1. Review your ultra-high-quality casino logos")
        print("2. npm run build")
        print("3. docker build -t casino-with-ultra-logos .")
        print("4. Your casino portal now has REAL ULTRA LOGOS! 🎰✨")
    
    def save_ultra_results(self):
        """Save ultra results"""
        try:
            ultra_results = {
                'ultra_stats': self.stats,
                'ultra_results': self.results,
                'ultra_session': {
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'duration': time.time() - self.stats['start_time'],
                    'version': 'Ultra Smart Logo Finder v3.0',
                    'ultra_success_rate': (self.stats['successful'] / self.stats['total_casinos']) * 100 if self.stats['total_casinos'] > 0 else 0
                }
            }
            
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(ultra_results, f, indent=2, ensure_ascii=False)
                
            print(f"💾 Ultra results saved to: {os.path.basename(self.results_file)}")
            
        except Exception as e:
            print(f"⚠️  Error saving ultra results: {e}")

def main():
    finder = UltraSmartLogoFinder()
    
    try:
        # Ultra initialization
        if not finder.load_casino_data():
            return
            
        if not finder.setup_directories():
            return
            
        # Run ultra search
        finder.run_ultra_search()
        
        # Generate ultra report
        finder.generate_ultra_report()
        
        # Save ultra results
        finder.save_ultra_results()
        
    except KeyboardInterrupt:
        print("\n⚠️  Ultra search interrupted")
        finder.print_ultra_progress()
    except Exception as e:
        print(f"\n💥 Ultra error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        finder.ultra_cleanup()

if __name__ == '__main__':
    main()