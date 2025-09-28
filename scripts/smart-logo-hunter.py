#!/usr/bin/env python3

"""
Smart Casino Logo Hunter 2025
Uses multiple strategies and sources to find real casino logos
"""

import json
import os
import requests
import time
from PIL import Image
import io
import random
from urllib.parse import quote_plus
import re

class SmartLogoHunter:
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(script_dir)
        self.search_list_file = os.path.join(self.project_root, 'data', 'casino-search-list.json')
        self.logos_dir = os.path.join(self.project_root, 'public', 'images', 'casinos')
        self.results_file = os.path.join(self.project_root, 'data', 'smart-hunter-results.json')
        
        self.casinos = []
        self.results = []
        self.stats = {
            'total': 0,
            'successful': 0,
            'failed': 0,
            'start_time': time.time()
        }
        
        # Rotating user agents to avoid blocking
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:121.0) Gecko/20100101 Firefox/121.0'
        ]
        
    def get_headers(self):
        """Get randomized headers"""
        return {
            'User-Agent': random.choice(self.user_agents),
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'DNT': '1',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Cache-Control': 'max-age=0'
        }
    
    def load_casinos(self):
        """Load casino data"""
        try:
            with open(self.search_list_file, 'r', encoding='utf-8') as f:
                self.casinos = json.load(f)
            self.stats['total'] = len(self.casinos)
            print(f"🎯 Loaded {self.stats['total']} casinos for smart hunting")
            return True
        except Exception as e:
            print(f"❌ Error loading casinos: {e}")
            return False
    
    def setup_dirs(self):
        """Setup directories"""
        try:
            os.makedirs(self.logos_dir, exist_ok=True)
            print(f"📁 Smart hunting directory: {self.logos_dir}")
            return True
        except Exception as e:
            print(f"❌ Directory error: {e}")
            return False
    
    def hunt_direct_logo_urls(self, casino):
        """Hunt for direct logo URLs from known casino sites"""
        direct_urls = []
        brand = casino['brand'].lower().replace(' ', '')
        
        # Strategy 1: Try common casino logo URL patterns
        common_patterns = [
            f"https://{brand}.com/assets/images/logo.png",
            f"https://{brand}.com/images/logo.png",
            f"https://{brand}.com/logo.png",
            f"https://www.{brand}.com/assets/images/logo.png",
            f"https://www.{brand}.com/images/logo.png",
            f"https://www.{brand}.com/logo.png",
            f"https://{brand}.net/logo.png",
            f"https://{brand}.io/logo.png"
        ]
        
        for url in common_patterns:
            try:
                response = requests.head(url, headers=self.get_headers(), timeout=5)
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '').lower()
                    if content_type.startswith('image/'):
                        direct_urls.append(url)
                        print(f"        🎯 Direct hit: {url}")
            except:
                continue
        
        return direct_urls
    
    def hunt_duckduckgo_images(self, query):
        """Use DuckDuckGo images as alternative to Google"""
        try:
            print(f"    🦆 DuckDuckGo search: {query}")
            
            # DuckDuckGo image search
            search_url = f"https://duckduckgo.com/?q={quote_plus(query)}&t=h_&iax=images&ia=images"
            
            headers = self.get_headers()
            response = requests.get(search_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Extract image URLs from DuckDuckGo results
                image_urls = re.findall(r'"image":"([^"]+)"', response.text)
                
                # Clean and validate URLs
                clean_urls = []
                for url in image_urls[:10]:
                    try:
                        # Decode URL
                        clean_url = url.replace('\\', '')
                        if self.is_valid_logo_url(clean_url):
                            clean_urls.append(clean_url)
                    except:
                        continue
                
                print(f"      🦆 Found {len(clean_urls)} DuckDuckGo images")
                return clean_urls
                
        except Exception as e:
            print(f"      ❌ DuckDuckGo error: {e}")
            
        return []
    
    def hunt_bing_images(self, query):
        """Use Bing images as another alternative"""
        try:
            print(f"    🔍 Bing search: {query}")
            
            # Bing image search
            search_url = f"https://www.bing.com/images/search?q={quote_plus(query)}&form=HDRSC2"
            
            headers = self.get_headers()
            response = requests.get(search_url, headers=headers, timeout=10)
            
            if response.status_code == 200:
                # Extract image URLs from Bing
                image_urls = re.findall(r'mediaurl":"([^"]+)"', response.text)
                
                clean_urls = []
                for url in image_urls[:8]:
                    try:
                        clean_url = url.replace('\\u0026', '&').replace('\\', '')
                        if self.is_valid_logo_url(clean_url):
                            clean_urls.append(clean_url)
                    except:
                        continue
                
                print(f"      🔍 Found {len(clean_urls)} Bing images")
                return clean_urls
                
        except Exception as e:
            print(f"      ❌ Bing error: {e}")
            
        return []
    
    def is_valid_logo_url(self, url):
        """Check if URL is valid for logo"""
        try:
            if not url.startswith(('http://', 'https://')):
                return False
            
            # Check for image extensions
            lower_url = url.lower()
            if not any(ext in lower_url for ext in ['.jpg', '.jpeg', '.png', '.webp', '.svg']):
                return False
            
            # Avoid problematic sites
            bad_domains = ['youtube.com', 'facebook.com', 'twitter.com', 'instagram.com', 'tiktok.com']
            if any(domain in lower_url for domain in bad_domains):
                return False
            
            return True
            
        except:
            return False
    
    def download_and_validate_logo(self, url):
        """Download and validate logo from URL"""
        try:
            headers = self.get_headers()
            response = requests.get(url, headers=headers, timeout=8, stream=True)
            response.raise_for_status()
            
            # Check content type
            content_type = response.headers.get('content-type', '').lower()
            if not content_type.startswith('image/'):
                return None
            
            # Download content
            content = response.content
            if len(content) < 1000:  # 1KB minimum
                return None
            
            if len(content) > 10 * 1024 * 1024:  # 10MB max
                return None
            
            # Validate with PIL
            img = Image.open(io.BytesIO(content))
            width, height = img.size
            
            # Size validation
            if width < 30 or height < 30:
                return None
            
            if width > 3000 or height > 3000:
                return None
            
            # Convert to RGBA
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize if too large
            if width > 800 or height > 800:
                img.thumbnail((800, 800), Image.Resampling.LANCZOS)
            
            print(f"        ✅ Valid logo: {width}x{height} from {url[:50]}...")
            return img
            
        except Exception as e:
            return None
    
    def calculate_logo_score(self, img, url_hint=""):
        """Calculate logo quality score"""
        score = 0
        
        try:
            width, height = img.size
            
            # Dimension scoring
            if 50 <= width <= 500 and 50 <= height <= 500:
                score += 25
            elif 30 <= width <= 800 and 30 <= height <= 800:
                score += 15
            
            # Aspect ratio (prefer reasonable logos)
            ratio = max(width, height) / min(width, height)
            if ratio <= 3:
                score += 20
            elif ratio <= 5:
                score += 10
            
            # URL hints
            url_lower = url_hint.lower()
            if 'logo' in url_lower:
                score += 25
            if 'casino' in url_lower:
                score += 15
            if 'brand' in url_lower:
                score += 12
            if 'icon' in url_lower:
                score += 18
            
            # File format bonus
            if '.png' in url_lower:
                score += 15
            elif '.svg' in url_lower:
                score += 10
            elif '.webp' in url_lower:
                score += 12
            
        except:
            score = 0
            
        return score
    
    def save_logo(self, casino, img):
        """Save the logo"""
        try:
            dest_path = os.path.join(self.logos_dir, f"{casino['slug']}.png")
            img.save(dest_path, 'PNG', optimize=True)
            
            file_size = os.path.getsize(dest_path)
            print(f"        💾 SAVED: {casino['slug']}.png ({file_size} bytes)")
            return True
            
        except Exception as e:
            print(f"        ❌ Save error: {e}")
            return False
    
    def hunt_casino_logo(self, casino, index, total):
        """Hunt for a single casino logo using multiple strategies"""
        print(f"\n[{index}/{total}] 🏹 Hunting: {casino['brand']}")
        
        best_img = None
        best_score = 0
        best_source = ""
        
        brand = casino['brand']
        
        # Strategy 1: Direct URL hunting
        direct_urls = self.hunt_direct_logo_urls(casino)
        for url in direct_urls:
            img = self.download_and_validate_logo(url)
            if img:
                score = self.calculate_logo_score(img, url)
                if score > best_score:
                    best_img = img
                    best_score = score
                    best_source = f"Direct: {url}"
        
        # Strategy 2: DuckDuckGo search
        if best_score < 50:  # If we don't have a great logo yet
            query = f'"{brand}" casino logo png'
            ddg_urls = self.hunt_duckduckgo_images(query)
            for url in ddg_urls[:5]:
                img = self.download_and_validate_logo(url)
                if img:
                    score = self.calculate_logo_score(img, url)
                    if score > best_score:
                        best_img = img
                        best_score = score
                        best_source = f"DuckDuckGo: {query}"
        
        time.sleep(1)  # Rate limiting
        
        # Strategy 3: Bing search
        if best_score < 50:
            query = f'{brand} casino official logo'
            bing_urls = self.hunt_bing_images(query)
            for url in bing_urls[:5]:
                img = self.download_and_validate_logo(url)
                if img:
                    score = self.calculate_logo_score(img, url)
                    if score > best_score:
                        best_img = img
                        best_score = score
                        best_source = f"Bing: {query}"
        
        # Save the best logo found
        if best_img and best_score >= 20:  # Minimum threshold
            if self.save_logo(casino, best_img):
                self.stats['successful'] += 1
                
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'status': 'HUNT_SUCCESS',
                    'score': best_score,
                    'source': best_source,
                    'file': f"{casino['slug']}.png",
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
                
                print(f"    🏆 HUNT SUCCESS: {brand} (score: {best_score})")
                return True
        
        # Failed to find suitable logo
        self.stats['failed'] += 1
        print(f"    ❌ HUNT FAILED: {brand}")
        
        self.results.append({
            'slug': casino['slug'],
            'brand': casino['brand'],
            'status': 'HUNT_FAILED',
            'best_score': best_score,
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
        return False
    
    def run_smart_hunt(self):
        """Run the smart logo hunting process"""
        print("🏹 STARTING SMART CASINO LOGO HUNT")
        print("=" * 45)
        
        for i, casino in enumerate(self.casinos, 1):
            self.hunt_casino_logo(casino, i, len(self.casinos))
            
            # Progress report every 5 casinos
            if i % 5 == 0:
                duration = int(time.time() - self.stats['start_time'])
                success_rate = (self.stats['successful'] / i) * 100
                print(f"\n🏹 Hunt Progress: {i}/{len(self.casinos)} | Success: {self.stats['successful']} ({success_rate:.1f}%) | Time: {duration}s\n")
            
            # Respectful delay between hunts
            time.sleep(random.uniform(2, 4))
    
    def generate_final_report(self):
        """Generate final hunting report"""
        duration = int(time.time() - self.stats['start_time'])
        success_rate = (self.stats['successful'] / self.stats['total']) * 100 if self.stats['total'] > 0 else 0
        
        print("\n🏆 SMART LOGO HUNT COMPLETE!")
        print("=" * 40)
        print(f"⏱️  Hunt Duration: {duration // 60}m {duration % 60}s")
        print(f"🎯 Target Casinos: {self.stats['total']}")
        print(f"🏹 Successful Hunts: {self.stats['successful']}")
        print(f"❌ Failed Hunts: {self.stats['failed']}")
        print(f"📈 Hunt Success Rate: {success_rate:.1f}%")
        
        if self.stats['successful'] > 0:
            print(f"\n✅ SUCCESSFUL LOGO HUNTS:")
            successful = [r for r in self.results if r['status'] == 'HUNT_SUCCESS']
            for i, result in enumerate(successful[:15], 1):
                score = result.get('score', 0)
                source = result.get('source', 'Unknown')[:30]
                print(f"{i:2d}. {result['brand']} -> {result['file']} (score: {score}, {source})")
            
            if len(successful) > 15:
                print(f"    ... and {len(successful) - 15} more successful hunts!")
        
        print(f"\n📁 Hunted logos: public/images/casinos/")
        print(f"🚀 Ready to build: npm run build && docker build")
        
        # Save results
        try:
            hunt_results = {
                'hunt_stats': self.stats,
                'hunt_results': self.results,
                'hunt_session': {
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'duration': duration,
                    'version': 'Smart Logo Hunter v1.0',
                    'success_rate': success_rate
                }
            }
            
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(hunt_results, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Hunt results saved: {os.path.basename(self.results_file)}")
            
        except Exception as e:
            print(f"⚠️  Save error: {e}")

def main():
    hunter = SmartLogoHunter()
    
    try:
        if not hunter.load_casinos():
            return
        
        if not hunter.setup_dirs():
            return
        
        hunter.run_smart_hunt()
        hunter.generate_final_report()
        
    except KeyboardInterrupt:
        print("\n⚠️  Logo hunt interrupted")
        duration = int(time.time() - hunter.stats['start_time'])
        print(f"Completed {hunter.stats['successful']} hunts in {duration}s")
    except Exception as e:
        print(f"\n💥 Hunt error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()