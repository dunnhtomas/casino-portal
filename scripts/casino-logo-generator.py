#!/usr/bin/env python3

"""
Casino Logo Generator 2025
Creates professional placeholder logos and attempts to fetch real ones from known sources
"""

import json
import os
import requests
import time
from PIL import Image, ImageDraw, ImageFont
import io
import random

class CasinoLogoGenerator:
    def __init__(self):
        script_dir = os.path.dirname(os.path.abspath(__file__))
        self.project_root = os.path.dirname(script_dir)
        self.search_list_file = os.path.join(self.project_root, 'data', 'casino-search-list.json')
        self.logos_dir = os.path.join(self.project_root, 'public', 'images', 'casinos')
        self.results_file = os.path.join(self.project_root, 'data', 'logo-generator-results.json')
        
        self.casinos = []
        self.results = []
        self.stats = {
            'total': 0,
            'real_logos': 0,
            'generated_logos': 0,
            'failed': 0,
            'start_time': time.time()
        }
        
        # Known casino logo sources
        self.known_sources = {
            'betway': 'https://assets.betway.com/web/logos/betway-logo.png',
            'william': 'https://www.williamhill.com/favicon.ico',
            'leovegas': 'https://www.leovegas.com/img/logo/leovegas-logo.svg',
            '888': 'https://www.888casino.com/img/logos/888casino-logo.png',
            'bet365': 'https://www.bet365.com/favicon.ico',
        }
        
        # Professional color schemes for different casino types
        self.color_schemes = [
            {'bg': '#1a237e', 'text': '#ffffff', 'accent': '#3f51b5'},  # Deep Blue
            {'bg': '#b71c1c', 'text': '#ffffff', 'accent': '#f44336'},  # Casino Red
            {'bg': '#1b5e20', 'text': '#ffffff', 'accent': '#4caf50'},  # Forest Green
            {'bg': '#e65100', 'text': '#ffffff', 'accent': '#ff9800'},  # Orange
            {'bg': '#4a148c', 'text': '#ffffff', 'accent': '#9c27b0'},  # Purple
            {'bg': '#263238', 'text': '#ffffff', 'accent': '#607d8b'},  # Blue Grey
            {'bg': '#bf360c', 'text': '#ffffff', 'accent': '#ff5722'},  # Deep Orange
            {'bg': '#1a237e', 'text': '#ffd700', 'accent': '#ffeb3b'},  # Blue Gold
        ]
        
    def load_casinos(self):
        """Load casino data"""
        try:
            with open(self.search_list_file, 'r', encoding='utf-8') as f:
                self.casinos = json.load(f)
            self.stats['total'] = len(self.casinos)
            print(f"🎰 Loaded {self.stats['total']} casinos for logo generation")
            return True
        except Exception as e:
            print(f"❌ Error loading casinos: {e}")
            return False
    
    def setup_dirs(self):
        """Setup directories"""
        try:
            os.makedirs(self.logos_dir, exist_ok=True)
            print(f"📁 Logo generation directory: {self.logos_dir}")
            return True
        except Exception as e:
            print(f"❌ Directory error: {e}")
            return False
    
    def try_fetch_real_logo(self, casino):
        """Try to fetch real logo from known sources"""
        brand_lower = casino['brand'].lower().replace(' ', '')
        
        # Check known sources
        for key, url in self.known_sources.items():
            if key in brand_lower:
                try:
                    print(f"    🎯 Trying known source: {url}")
                    response = requests.get(url, timeout=10)
                    if response.status_code == 200:
                        return self.process_real_logo(response.content)
                except:
                    continue
        
        # Try common URL patterns
        domain_variations = [
            f"{brand_lower}.com",
            f"{brand_lower}.net",
            f"{brand_lower}.casino",
            f"www.{brand_lower}.com"
        ]
        
        logo_paths = [
            "/logo.png",
            "/assets/images/logo.png",
            "/images/logo.png",
            "/favicon.ico"
        ]
        
        for domain in domain_variations:
            for path in logo_paths:
                try:
                    url = f"https://{domain}{path}"
                    response = requests.head(url, timeout=5)
                    if response.status_code == 200:
                        content_type = response.headers.get('content-type', '').lower()
                        if content_type.startswith('image/'):
                            print(f"    🎯 Real logo found: {url}")
                            full_response = requests.get(url, timeout=10)
                            return self.process_real_logo(full_response.content)
                except:
                    continue
        
        return None
    
    def process_real_logo(self, image_data):
        """Process real logo data"""
        try:
            img = Image.open(io.BytesIO(image_data))
            
            # Validate dimensions
            width, height = img.size
            if width < 20 or height < 20:
                return None
            
            # Convert to RGBA
            if img.mode != 'RGBA':
                img = img.convert('RGBA')
            
            # Resize if needed
            if width > 400 or height > 400:
                img.thumbnail((400, 400), Image.Resampling.LANCZOS)
            
            return img
            
        except:
            return None
    
    def generate_professional_logo(self, casino):
        """Generate professional-looking logo"""
        try:
            brand = casino['brand']
            
            # Choose color scheme based on brand name hash
            color_index = hash(brand) % len(self.color_schemes)
            colors = self.color_schemes[color_index]
            
            # Create image
            width, height = 300, 100
            img = Image.new('RGBA', (width, height), (255, 255, 255, 0))
            draw = ImageDraw.Draw(img)
            
            # Background with rounded corners effect
            margin = 5
            bg_color = colors['bg']
            draw.rectangle([margin, margin, width-margin, height-margin], 
                          fill=bg_color, outline=colors['accent'], width=2)
            
            # Try to use a better font (fallback to default if not available)
            try:
                # Try to find system fonts
                font_size = 24
                if len(brand) > 10:
                    font_size = 20
                elif len(brand) > 15:
                    font_size = 18
                
                # Try common Windows fonts
                font_paths = [
                    "C:/Windows/Fonts/arial.ttf",
                    "C:/Windows/Fonts/calibri.ttf",
                    "C:/Windows/Fonts/tahoma.ttf"
                ]
                
                font = None
                for font_path in font_paths:
                    if os.path.exists(font_path):
                        font = ImageFont.truetype(font_path, font_size)
                        break
                
                if not font:
                    font = ImageFont.load_default()
                    
            except:
                font = ImageFont.load_default()
            
            # Calculate text position for centering
            text_bbox = draw.textbbox((0, 0), brand, font=font)
            text_width = text_bbox[2] - text_bbox[0]
            text_height = text_bbox[3] - text_bbox[1]
            
            x = (width - text_width) // 2
            y = (height - text_height) // 2
            
            # Add shadow effect
            shadow_offset = 2
            draw.text((x + shadow_offset, y + shadow_offset), brand, 
                     fill=(0, 0, 0, 128), font=font)
            
            # Main text
            draw.text((x, y), brand, fill=colors['text'], font=font)
            
            # Add decorative elements
            accent_color = colors['accent']
            
            # Left accent line
            draw.rectangle([margin+5, margin+5, margin+8, height-margin-5], 
                          fill=accent_color)
            
            # Right accent line  
            draw.rectangle([width-margin-8, margin+5, width-margin-5, height-margin-5], 
                          fill=accent_color)
            
            # Small decorative dots
            dot_size = 3
            draw.ellipse([margin+15, margin+height//2-dot_size//2, 
                         margin+15+dot_size, margin+height//2+dot_size//2], 
                        fill=accent_color)
            
            draw.ellipse([width-margin-15-dot_size, margin+height//2-dot_size//2, 
                         width-margin-15, margin+height//2+dot_size//2], 
                        fill=accent_color)
            
            return img
            
        except Exception as e:
            print(f"    ⚠️ Logo generation error: {e}")
            return None
    
    def save_logo(self, casino, img, is_real=False):
        """Save logo to file"""
        try:
            dest_path = os.path.join(self.logos_dir, f"{casino['slug']}.png")
            img.save(dest_path, 'PNG', optimize=True)
            
            file_size = os.path.getsize(dest_path)
            logo_type = "REAL" if is_real else "GENERATED"
            print(f"    💾 {logo_type} LOGO SAVED: {casino['slug']}.png ({file_size} bytes)")
            return True
            
        except Exception as e:
            print(f"    ❌ Save error: {e}")
            return False
    
    def process_casino_logo(self, casino, index, total):
        """Process a single casino logo"""
        print(f"\n[{index}/{total}] 🏭 Processing: {casino['brand']}")
        
        # Step 1: Try to fetch real logo
        real_logo = self.try_fetch_real_logo(casino)
        
        if real_logo:
            if self.save_logo(casino, real_logo, is_real=True):
                self.stats['real_logos'] += 1
                
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'type': 'REAL_LOGO',
                    'file': f"{casino['slug']}.png",
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
                
                print(f"    🏆 REAL LOGO SUCCESS: {casino['brand']}")
                return True
        
        # Step 2: Generate professional logo
        generated_logo = self.generate_professional_logo(casino)
        
        if generated_logo:
            if self.save_logo(casino, generated_logo, is_real=False):
                self.stats['generated_logos'] += 1
                
                self.results.append({
                    'slug': casino['slug'],
                    'brand': casino['brand'],
                    'type': 'GENERATED_LOGO',
                    'file': f"{casino['slug']}.png",
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
                })
                
                print(f"    ✨ PROFESSIONAL LOGO GENERATED: {casino['brand']}")
                return True
        
        # Failed completely
        self.stats['failed'] += 1
        print(f"    ❌ LOGO FAILED: {casino['brand']}")
        
        self.results.append({
            'slug': casino['slug'],
            'brand': casino['brand'],
            'type': 'FAILED',
            'timestamp': time.strftime('%Y-%m-%d %H:%M:%S')
        })
        
        return False
    
    def run_logo_generation(self):
        """Run the complete logo generation process"""
        print("🏭 STARTING CASINO LOGO GENERATION")
        print("=" * 45)
        print("Strategy: Real logos first, then professional generated logos")
        print()
        
        for i, casino in enumerate(self.casinos, 1):
            self.process_casino_logo(casino, i, len(self.casinos))
            
            # Progress report every 10 casinos
            if i % 10 == 0:
                self.print_progress(i)
            
            # Small delay for rate limiting
            time.sleep(0.5)
    
    def print_progress(self, current):
        """Print current progress"""
        duration = int(time.time() - self.stats['start_time'])
        
        print(f"\n📊 LOGO GENERATION PROGRESS")
        print("=" * 35)
        print(f"🏭 Processed: {current}/{self.stats['total']}")
        print(f"🎯 Real Logos: {self.stats['real_logos']}")
        print(f"✨ Generated Logos: {self.stats['generated_logos']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"⏱️  Time: {duration // 60}m {duration % 60}s")
        
        if current > 0:
            success_rate = ((self.stats['real_logos'] + self.stats['generated_logos']) / current) * 100
            print(f"📈 Success Rate: {success_rate:.1f}%")
        print()
    
    def generate_final_report(self):
        """Generate final report"""
        duration = int(time.time() - self.stats['start_time'])
        total_success = self.stats['real_logos'] + self.stats['generated_logos']
        success_rate = (total_success / self.stats['total']) * 100 if self.stats['total'] > 0 else 0
        
        print("\n🏆 CASINO LOGO GENERATION COMPLETE!")
        print("=" * 50)
        print(f"⏱️  Total Duration: {duration // 60}m {duration % 60}s")
        print(f"🎰 Total Casinos: {self.stats['total']}")
        print(f"🎯 Real Logos Found: {self.stats['real_logos']}")
        print(f"✨ Professional Logos Generated: {self.stats['generated_logos']}")
        print(f"❌ Failed: {self.stats['failed']}")
        print(f"📈 Overall Success Rate: {success_rate:.1f}%")
        
        if total_success > 0:
            print(f"\n✅ SUCCESSFUL LOGOS:")
            print("=" * 25)
            
            # Show real logos first
            real_logos = [r for r in self.results if r['type'] == 'REAL_LOGO']
            if real_logos:
                print("🎯 REAL LOGOS FOUND:")
                for i, result in enumerate(real_logos, 1):
                    print(f"  {i}. {result['brand']} -> {result['file']}")
                print()
            
            # Show generated logos
            generated_logos = [r for r in self.results if r['type'] == 'GENERATED_LOGO']
            if generated_logos:
                print(f"✨ PROFESSIONAL LOGOS GENERATED ({len(generated_logos)}):")
                for i, result in enumerate(generated_logos[:10], 1):
                    print(f"  {i}. {result['brand']} -> {result['file']}")
                if len(generated_logos) > 10:
                    print(f"  ... and {len(generated_logos) - 10} more professional logos!")
        
        print(f"\n📁 All logos saved to: public/images/casinos/")
        print(f"🚀 READY FOR PRODUCTION:")
        print("  1. npm run build")
        print("  2. docker build -t casino-with-logos .")
        print("  3. Your casino portal now has PROFESSIONAL LOGOS! 🎰✨")
        
        # Save results
        try:
            final_results = {
                'generation_stats': self.stats,
                'generation_results': self.results,
                'session_info': {
                    'timestamp': time.strftime('%Y-%m-%d %H:%M:%S'),
                    'duration': duration,
                    'version': 'Casino Logo Generator v1.0',
                    'success_rate': success_rate,
                    'strategy': 'Real logos first, professional generated fallback'
                }
            }
            
            with open(self.results_file, 'w', encoding='utf-8') as f:
                json.dump(final_results, f, indent=2, ensure_ascii=False)
            
            print(f"💾 Results saved: {os.path.basename(self.results_file)}")
            
        except Exception as e:
            print(f"⚠️  Save error: {e}")

def main():
    generator = CasinoLogoGenerator()
    
    try:
        if not generator.load_casinos():
            return
        
        if not generator.setup_dirs():
            return
        
        generator.run_logo_generation()
        generator.generate_final_report()
        
    except KeyboardInterrupt:
        print("\n⚠️  Logo generation interrupted")
        generator.print_progress(generator.stats.get('processed', 0))
    except Exception as e:
        print(f"\n💥 Generation error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()