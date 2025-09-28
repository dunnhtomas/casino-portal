#!/usr/bin/env python3

"""
Direct Casino Logo Downloader 2025
Using direct HTTP requests to find and download casino logos
"""

import json
import os
import requests
import time
from PIL import Image
import io
from urllib.parse import urlencode, quote_plus
import re
import hashlib

class DirectLogoDownloader:
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(script_dir)
        self.search_list_file = os.path.join(self.project_root, 'data', 'casino-search-list.json')
        self.logos_dir = os.path.join(self.project_root, 'public', 'images', 'casinos')
        self.results_file = os.path.join(self.project_root, 'data', 'direct-results.json')
        
        self.casinos = []
        self.results = []
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'start_time': time.time()
        }
        
        # Headers to appear like a real browser
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive'
        }
        
    def load_casinos(self):
        """Load casino data"""
        try:
            with open(self.search_list_file, 'r', encoding='utf-8') as f:
                self.casinos = json.load(f)
            self.stats['total'] = len(self.casinos)
            print(f"🎰 Loaded {self.stats['total']} casinos for direct download")
            return True
        except Exception as e:
            print(f"❌ Error loading casinos: {e}")
            return False
    
    def setup_dirs(self):
        """Setup directories"""
        try:
            os.makedirs(self.logos_dir, exist_ok=True)
            print(f"📁 Logos directory: {self.logos_dir}")
            return True
        except Exception as e:
            print(f"❌ Directory error: {e}")
            return False
    
    def search_google_images(self, query):
        """Search Google Images for casino logos"""
        try:
            print(f"    🔍 Searching Google Images: {query}")
            
            # Build Google Images search URL
            params = {
                'q': query,
                'tbm': 'isch',
                'hl': 'en',
                'safe': 'off',
                'tbs': 'isz:m,itp:photo'  # medium size, photo type
            }
            
            url = f"https://www.google.com/search?{urlencode(params)}"
            
            response = requests.get(url, headers=self.headers, timeout=10)
            response.raise_for_status()
            
            # Extract image URLs from the response
            image_urls = re.findall(r'\"ou\":\"([^\"]+)\"', response.text)
            
            # Filter and clean URLs
            clean_urls = []
            for img_url in image_urls[:15]:  # Top 15 results
                if self.is_valid_image_url(img_url):
                    clean_urls.append(img_url)
            
            print(f"      📸 Found {len(clean_urls)} image URLs")
            return clean_urls[:10]  # Return top 10
            
        except Exception as e:
            print(f"      ❌ Search error: {e}")
            return []
    
    def is_valid_image_url(self, url):
        """Check if URL points to a valid image"""
        try:
            # Check URL format
            if not url.startswith(('http://', 'https://')):
                return False
            
            # Check file extension
            lower_url = url.lower()
            if not any(ext in lower_url for ext in ['.jpg', '.jpeg', '.png', '.webp']):
                return False
            
            # Avoid problematic domains
            problematic_domains = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com']
            if any(domain in lower_url for domain in problematic_domains):
                return False
                
            return True
            
        except:
            return False
    
    def download_image(self, url):
        """Download image from URL"""
        try:
            response = requests.get(url, headers=self.headers, timeout=10, stream=True)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not content_type.startswith('image/'):
                return None
            
            # Check file size
            content_length = response.headers.get('content-length')
            if content_length and int(content_length) > 5 * 1024 * 1024:  # 5MB max
                return None
            
            # Download content
            content = response.content
            if len(content) < 2000:  # 2KB minimum
                return None
                
            return content
            
        except Exception as e:
            return None
    
    def validate_and_process_image(self, image_data):
        """Validate and process downloaded image"""
        try:
            # Open with PIL
            img = Image.open(io.BytesIO(image_data))
            
            # Check dimensions
            width, height = img.size
            if width < 50 or height < 50:
                return None
            
            if width > 2000 or height > 2000:
                return None
            
            # Convert to RGBA for PNG
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize if needed
            if width > 800 or height > 800:
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            
            print(f"        ✅ Valid image: {width}x{height}")
            return img
            
        except Exception as e:
            return None
    
    def calculate_image_score(self, img, filename_hint=""):
        """Calculate image quality score"""
        score = 0
        
        try:
            width, height = img.size
            
            # Size scoring
            if 100 <= width <= 600 and 100 <= height <= 600:
                score += 20
            
            # Aspect ratio (prefer square-ish logos)
            ratio = max(width, height) / min(width, height)
            if ratio <= 2.5:
                score += 15
            
            # Filename hints
            filename_lower = filename_hint.lower()
            if 'logo' in filename_lower:
                score += 20
            if 'casino' in filename_lower:
                score += 10
            if 'icon' in filename_lower:
                score += 15
            
        except:
            score = 0
            
        return score
    
    def save_logo(self, casino, img):
        """Save the processed logo"""
        try:
            dest_path = os.path.join(self.logos_dir, f"{casino['slug']}.png")
            img.save(dest_path, 'PNG', optimize=True)
            
            file_size = os.path.getsize(dest_path)
            print(f"        💾 Saved: {casino['slug']}.png ({file_size} bytes)")
            return True
            
        except Exception as e:
            print(f"        ❌ Save error: {e}")
            return False
    
    def get_search_queries(self, casino):
        """Generate search queries for the casino"""
        brand = casino['brand']
        
        queries = [
            f'"{brand}" casino logo png',
            f'{brand} casino official logo',
            f'"{brand}" gambling logo vector',
            f'{brand} casino brand logo high quality'
        ]
        
        # Add variations
        if 'searchVariations' in casino and casino['searchVariations']:
            for variation in casino['searchVariations'][:2]:
                if variation and variation != brand.lower():
                    queries.append(f'"{variation}" casino logo')
        
        return queries[:3]  # Limit to top 3
    
    def process_casino(self, casino, index, total):
        """Process a single casino"""
        print(f"\n[{index}/{total}] 🎯 Direct processing: {casino['brand']}")
        
        success = False
        queries = self.get_search_queries(casino)
        best_img = None
        best_score = 0
        best_query = ""
        
        for query in queries:
            image_urls = self.search_google_images(query)
            
            for url in image_urls:
                image_data = self.download_image(url)
                if not image_data:
                    continue
                
                img = self.validate_and_process_image(image_data)
                if not img:
                    continue
                
                # Score this image
                score = self.calculate_image_score(img, url)
                
                if score > best_score:
                    best_img = img
                    best_score = score
                    best_query = query
                
                # If we have a really good image, use it
                if score > 40:
                    break
            
            # Rate limit between queries
            time.sleep(2)
            
            if best_score > 30:  # Good enough threshold
                break
        
        # Save the best image found
        if best_img and best_score > 15:  # Minimum threshold
            if self.save_logo(casino, best_img):
                success = True
                self.stats['successful'] += 1
                
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'status': 'SUCCESS',
                    'query': best_query,
                    'score': best_score,
                    'file': f"{casino['slug']}.png",
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
                
                print(f"    ✅ SUCCESS: {casino['brand']} (score: {best_score})")
        
        if not success:
            self.stats['failed'] += 1
            print(f"    ❌ FAILED: {casino['brand']}")
            
            self.results.append({
                'slug': casino['slug'],
                'brand': casino['brand'],
                'status': 'FAILED',
                'queries_tried': queries,
                'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
            })
    
    def run_direct_download(self):
        """Run the direct download process"""
        print("🚀 STARTING DIRECT LOGO DOWNLOAD")
        print("=" * 40)
        
        for i, casino in enumerate(self.casinos, 1):
            self.process_casino(casino, i, len(self.casinos))
            
            # Progress report
            if i % 5 == 0:
                duration = int(time.time() - self.stats['start_time'])
                success_rate = (self.stats['successful'] / i) * 100 if i > 0 else 0
                print(f"\n📊 Progress: {i}/{len(self.casinos)} | Success: {self.stats['successful']} ({success_rate:.1f}%) | Time: {duration}s\n")
            
            # Respectful delay
            time.sleep(3)
    
    def generate_final_report(self):
        """Generate final report"""
        duration = int(time.time() - self.stats['start_time'])
        success_rate = (self.stats['successful'] / self.stats['total']) * 100 if self.stats['total'] > 0 else 0
        
        print("\n🏆 DIRECT LOGO DOWNLOAD COMPLETE!")
        print("=" * 40)
        print(f"⏱️  Duration: {duration // 60}m {duration % 60}s")
        print(f"🎰 Total Casinos: {self.stats['total']}")
        print(f"✅ Successful: {self.stats['successful']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"📈 Success Rate: {success_rate:.1f}%")
        
        if self.stats['successful'] > 0:
            print(f"\n✅ SUCCESSFULLY DOWNLOADED:")
            successful = [r for r in self.results if r['status'] == 'SUCCESS']
            for i, result in enumerate(successful[:15], 1):
                score = result.get('score', 0)
                print(f"{i:2d}. {result['brand']} -> {result['file']} (score: {score})")
            
            if len(successful) > 15:
                print(f"    ... and {len(successful) - 15} more!")
        
        print(f"\n📁 Direct logos: public/images/casinos/")
        print(f"🚀 Ready for: npm run build && docker build")
        
        # Save results
        try:
            final_results = {
                'direct_stats': self.stats,
                'direct_results': self.results,
                'session_info': {
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'duration': duration,
                    'version': 'Direct Logo Downloader v1.0',
                    'success_rate': success_rate
                }
            }
            
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(final_results, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Results saved: {os.path.basename(self.results_file)}")
            
        except Exception as e:
            print(f"⚠️  Save error: {e}")

def main():
    downloader = DirectLogoDownloader()
    
    try:
        if not downloader.load_casinos():
            return
        
        if not downloader.setup_dirs():
            return
        
        downloader.run_direct_download()
        downloader.generate_final_report()
        
    except KeyboardInterrupt:
        print("\n⚠️  Download interrupted")
        duration = int(time.time() - downloader.stats['start_time'])
        print(f"Completed {downloader.stats['successful']} downloads in {duration}s")
    except Exception as e:
        print(f"\n💥 Fatal error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()