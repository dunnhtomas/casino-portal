#!/usr/bin/env python3

"""
Foolproof Casino Logo Finder 2025
Maximum simplicity and reliability
"""

import json
import os
import shutil
import time
import glob
from PIL import Image

# Import bing image downloader
try:
    from bing_image_downloader import downloader
except ImportError:
    print("❌ bing-image-downloader not installed")
    exit(1)

class FoolproofLogoFinder:
    def __init__(self):
        # Use simple os.path operations
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(script_dir)
        self.search_list_file = os.path.join(self.project_root, 'data', 'casino-search-list.json')
        self.logos_dir = os.path.join(self.project_root, 'public', 'images', 'casinos')
        self.temp_dir = os.path.join(self.project_root, 'foolproof-downloads')
        self.results_file = os.path.join(self.project_root, 'data', 'foolproof-results.json')
        
        self.casinos = []
        self.results = []
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'start_time': time.time()
        }
        
    def load_casinos(self):
        """Load casino data"""
        try:
            with open(self.search_list_file, 'r', encoding='utf-8') as f:
                self.casinos = json.load(f)
            self.stats['total'] = len(self.casinos)
            print(f"🎰 Loaded {self.stats['total']} casinos")
            return True
        except Exception as e:
            print(f"❌ Error: {e}")
            return False
    
    def setup_dirs(self):
        """Setup directories"""
        try:
            os.makedirs(self.logos_dir, exist_ok=True)
            if os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
            os.makedirs(self.temp_dir, exist_ok=True)
            return True
        except Exception as e:
            print(f"❌ Directory error: {e}")
            return False
    
    def get_search_queries(self, casino):
        """Get simple search queries"""
        brand = casino['brand']
        return [
            f'{brand} casino logo',
            f'"{brand}" casino logo png',
            f'{brand} gambling logo'
        ]
    
    def download_images(self, query):
        """Download images with simple error handling"""
        try:
            print(f"    🔍 Searching: {query}")
            downloader.download(query, 
                              limit=8,
                              output_dir=self.temp_dir,
                              adult_filter_off=True,
                              force_replace=True,
                              timeout=15)
            
            # Find any images in temp directory
            image_files = []
            for root, dirs, files in os.walk(self.temp_dir):
                for file in files:
                    if file.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                        image_files.append(os.path.join(root, file))
            
            return image_files
            
        except Exception as e:
            print(f"      ❌ Search failed: {e}")
            return []
    
    def validate_image(self, image_path):
        """Simple image validation"""
        try:
            if not os.path.exists(image_path):
                return False
                
            file_size = os.path.getsize(image_path)
            if file_size < 2000:  # 2KB minimum
                return False
            
            with Image.open(image_path) as img:
                width, height = img.size
                if width < 50 or height < 50:
                    return False
                    
                print(f"        ✅ Valid: {os.path.basename(image_path)} ({width}x{height})")
                return True
                
        except Exception as e:
            return False
    
    def save_logo(self, casino, image_path):
        """Save the logo"""
        try:
            dest_path = os.path.join(self.logos_dir, f"{casino['slug']}.png")
            
            with Image.open(image_path) as img:
                # Convert to PNG
                if img.mode != 'RGBA':
                    img = img.convert('RGBA')
                
                # Resize if too large
                if img.width > 800 or img.height > 800:
                    img.thumbnail((800, 800), Image.Resampling.LANCZOS)
                
                img.save(dest_path, 'PNG', optimize=True)
                
            print(f"        💾 Saved: {casino['slug']}.png")
            return True
            
        except Exception as e:
            print(f"        ❌ Save failed: {e}")
            return False
    
    def cleanup(self):
        """Simple cleanup"""
        try:
            if os.path.exists(self.temp_dir):
                shutil.rmtree(self.temp_dir)
                os.makedirs(self.temp_dir, exist_ok=True)
        except:
            pass
    
    def run_search(self):
        """Run the foolproof search"""
        print("🚀 STARTING FOOLPROOF LOGO SEARCH")
        print("=" * 40)
        
        for i, casino in enumerate(self.casinos, 1):
            print(f"\n[{i}/{len(self.casinos)}] 🎯 {casino['brand']}")
            
            success = False
            queries = self.get_search_queries(casino)
            
            for query in queries:
                images = self.download_images(query)
                
                if images:
                    # Try each image until one works
                    for img_path in images[:5]:
                        if self.validate_image(img_path):
                            if self.save_logo(casino, img_path):
                                success = True
                                self.stats['successful'] += 1
                                
                                self.results.append({
                                    'slug': casino['slug'],
                                    'brand': casino['brand'],
                                    'status': 'SUCCESS',
                                    'query': query,
                                    'file': f"{casino['slug']}.png"
                                })
                                
                                print(f"    ✅ SUCCESS: {casino['brand']}")
                                break
                    
                    if success:
                        break
                
                self.cleanup()
                time.sleep(1)
            
            if not success:
                self.stats['failed'] += 1
                print(f"    ❌ Failed: {casino['brand']}")
                
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'status': 'FAILED'
                })
            
            # Progress every 10
            if i % 10 == 0:
                duration = int(time.time() - self.stats['start_time'])
                success_rate = (self.stats['successful'] / i) * 100
                print(f"\n📊 Progress: {i}/{len(self.casinos)} | Success: {self.stats['successful']} ({success_rate:.1f}%) | Time: {duration}s\n")
            
            time.sleep(1.5)
    
    def final_report(self):
        """Generate final report"""
        duration = int(time.time() - self.stats['start_time'])
        success_rate = (self.stats['successful'] / self.stats['total']) * 100
        
        print("\n🏆 FOOLPROOF LOGO FINDER COMPLETE!")
        print("=" * 45)
        print(f"⏱️  Duration: {duration // 60}m {duration % 60}s")
        print(f"🎰 Total Casinos: {self.stats['total']}")
        print(f"✅ Successful: {self.stats['successful']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.stats['successful'] > 0:
            print(f"\n✅ SUCCESSFUL LOGOS:")
            successful = [r for r in self.results if r['status'] == 'SUCCESS']
            for i, result in enumerate(successful[:15], 1):
                print(f"{i:2d}. {result['brand']} -> {result['file']}")
            if len(successful) > 15:
                print(f"    ... and {len(successful) - 15} more!")
        
        print(f"\n📁 Logos saved to: public/images/casinos/")
        print(f"💾 Results: {os.path.basename(self.results_file)}")
        
        # Save results
        try:
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump({
                    'stats': self.stats,
                    'results': self.results,
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                }, f, indent=2)
            print("💾 Results saved successfully")
        except Exception as e:
            print(f"⚠️  Save error: {e}")

def main():
    finder = FoolproofLogoFinder()
    
    try:
        if not finder.load_casinos():
            return
        if not finder.setup_dirs():
            return
            
        finder.run_search()
        finder.final_report()
        
    except KeyboardInterrupt:
        print("\n⚠️  Search interrupted")
    except Exception as e:
        print(f"\n💥 Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        finder.cleanup()

if __name__ == '__main__':
    main()