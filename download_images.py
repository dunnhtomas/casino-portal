#!/usr/bin/env python3
# ------------------------------------------------------------
# Modern Casino Logo Downloader - 2025 Edition
# 
# A comprehensive image downloader that uses multiple methods:
# 1. iCrawler - Professional multi-threaded image crawler
# 2. BingImages - Direct Bing image search API
# 3. Playwright - Direct website scraping
# 4. Advanced image validation and optimization
#
# Features:
# - Multi-threaded downloading for speed
# - Smart image filtering (size, quality, format)
# - Automatic deduplication  
# - Progress tracking and resumable downloads
# - Casino-specific optimization for logo discovery
# ------------------------------------------------------------

import asyncio
import hashlib
import io
import logging
import os
import re
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from typing import Dict, List, Set, Tuple
from urllib.parse import urljoin, urlparse

import aiohttp
import requests
from PIL import Image, ImageFilter
from playwright.async_api import async_playwright

# Modern image crawlers - install with: pip install icrawler BingImages Pillow playwright aiohttp
try:
    from icrawler.builtin import BingImageCrawler, GoogleImageCrawler
    ICRAWLER_AVAILABLE = True
except ImportError:
    ICRAWLER_AVAILABLE = False
    print("⚠️  iCrawler not available. Install with: pip install icrawler")

try:
    from BingImages import BingImages
    BINGIMAGES_AVAILABLE = True
except ImportError:
    BINGIMAGES_AVAILABLE = False
    print("⚠️  BingImages not available. Install with: pip install BingImages")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ModernImageDownloader:
    """
    Advanced image downloader with multiple search engines and methods
    """
    
    def __init__(self, base_dir: str = "downloaded_images"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(exist_ok=True)
        self.downloaded_hashes: Set[str] = set()
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        # Load existing image hashes to avoid duplicates
        self._load_existing_hashes()
    
    def _load_existing_hashes(self):
        """Load hashes of existing images to avoid duplicates"""
        for img_file in self.base_dir.rglob("*.jpg"):
            try:
                with open(img_file, 'rb') as f:
                    img_hash = hashlib.md5(f.read()).hexdigest()
                    self.downloaded_hashes.add(img_hash)
            except:
                continue
    
    def _get_image_hash(self, img_data: bytes) -> str:
        """Get MD5 hash of image data"""
        return hashlib.md5(img_data).hexdigest()
    
    def _is_valid_casino_logo(self, img_data: bytes, min_size: Tuple[int, int] = (100, 50)) -> bool:
        """Validate if image looks like a casino logo"""
        try:
            img = Image.open(io.BytesIO(img_data))
            width, height = img.size
            
            # Size checks
            if width < min_size[0] or height < min_size[1]:
                return False
            
            # Aspect ratio check (logos are usually wider than tall)
            aspect_ratio = width / height
            if aspect_ratio < 0.5 or aspect_ratio > 5.0:
                return False
            
            # File size check (too small = low quality)
            if len(img_data) < 2000:  # 2KB minimum
                return False
                
            return True
        except:
            return False
    
    def method1_icrawler_bing(self, query: str, max_images: int = 20) -> int:
        """Method 1: Use iCrawler with Bing (most reliable)"""
        if not ICRAWLER_AVAILABLE:
            logger.warning("iCrawler not available, skipping method 1")
            return 0
            
        logger.info(f"🔍 Method 1: iCrawler Bing search for '{query}'")
        
        download_dir = self.base_dir / "icrawler_bing" / query.replace(" ", "_")
        download_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            crawler = BingImageCrawler(
                downloader_threads=4,
                storage={'root_dir': str(download_dir)}
            )
            
            # Advanced filters for better logo quality
            filters = {
                'size': 'large',
                'type': 'photo',
                'layout': 'wide',
                'license': 'commercial'  # Better for casino logos
            }
            
            crawler.crawl(
                keyword=query,
                filters=filters,
                max_num=max_images,
                min_size=(200, 100),
                max_size=None
            )
            
            # Count downloaded images
            count = len(list(download_dir.glob("*.jpg")))
            logger.info(f"✅ Method 1 downloaded {count} images")
            return count
            
        except Exception as e:
            logger.error(f"❌ Method 1 failed: {e}")
            return 0
    
    def method2_bingimages_api(self, query: str, max_images: int = 20) -> int:
        """Method 2: Use BingImages direct API"""
        if not BINGIMAGES_AVAILABLE:
            logger.warning("BingImages not available, skipping method 2")
            return 0
            
        logger.info(f"🔍 Method 2: BingImages API search for '{query}'")
        
        download_dir = self.base_dir / "bingimages_api" / query.replace(" ", "_")
        download_dir.mkdir(parents=True, exist_ok=True)
        
        try:
            # Search with filters for better logo quality
            bing_search = BingImages(
                query, 
                count=max_images,
                size='large',
                type='photo',
                layout='wide'
            )
            
            urls = bing_search.get()
            logger.info(f"📋 Found {len(urls)} image URLs")
            
            downloaded = 0
            for i, url in enumerate(urls):
                try:
                    response = self.session.get(url, timeout=10)
                    if response.status_code == 200:
                        img_data = response.content
                        img_hash = self._get_image_hash(img_data)
                        
                        # Skip duplicates and validate
                        if (img_hash not in self.downloaded_hashes and 
                            self._is_valid_casino_logo(img_data)):
                            
                            filename = download_dir / f"{query.replace(' ', '_')}_{i+1}.jpg"
                            with open(filename, 'wb') as f:
                                f.write(img_data)
                            
                            self.downloaded_hashes.add(img_hash)
                            downloaded += 1
                            logger.info(f"  ✅ Downloaded image {downloaded}")
                        
                except Exception as e:
                    logger.warning(f"  ⚠️ Failed to download image {i+1}: {e}")
                    continue
            
            logger.info(f"✅ Method 2 downloaded {downloaded} images")
            return downloaded
            
        except Exception as e:
            logger.error(f"❌ Method 2 failed: {e}")
            return 0
    
    async def method3_playwright_scraping(self, casino_name: str, max_images: int = 10) -> int:
        """Method 3: Direct website scraping with Playwright"""
        logger.info(f"🔍 Method 3: Playwright scraping for '{casino_name}'")
        
        download_dir = self.base_dir / "playwright_scraping" / casino_name.replace(" ", "_")
        download_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate potential casino URLs
        potential_urls = [
            f"https://{casino_name.lower().replace(' ', '')}.com",
            f"https://www.{casino_name.lower().replace(' ', '')}.com",
            f"https://{casino_name.lower().replace(' ', '')}.co",
            f"https://{casino_name.lower().replace(' ', '')}.net"
        ]
        
        downloaded = 0
        
        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                
                for url in potential_urls:
                    try:
                        page = await browser.new_page()
                        await page.goto(url, wait_until='networkidle', timeout=10000)
                        
                        # Look for logo images
                        logo_selectors = [
                            'img[alt*="logo" i]',
                            'img[src*="logo" i]',
                            'img[class*="logo" i]',
                            '.logo img',
                            '#logo img',
                            'header img',
                            'nav img'
                        ]
                        
                        for selector in logo_selectors:
                            images = await page.locator(selector).all()
                            
                            for i, img in enumerate(images[:3]):  # Max 3 per selector
                                try:
                                    src = await img.get_attribute('src')
                                    if not src:
                                        continue
                                    
                                    # Complete relative URLs
                                    if not src.startswith('http'):
                                        src = urljoin(url, src)
                                    
                                    # Download image
                                    async with aiohttp.ClientSession() as session:
                                        async with session.get(src) as response:
                                            if response.status == 200:
                                                img_data = await response.read()
                                                img_hash = self._get_image_hash(img_data)
                                                
                                                if (img_hash not in self.downloaded_hashes and 
                                                    self._is_valid_casino_logo(img_data)):
                                                    
                                                    filename = download_dir / f"{casino_name.replace(' ', '_')}_logo_{downloaded+1}.jpg"
                                                    with open(filename, 'wb') as f:
                                                        f.write(img_data)
                                                    
                                                    self.downloaded_hashes.add(img_hash)
                                                    downloaded += 1
                                                    logger.info(f"  ✅ Downloaded logo from {urlparse(url).netloc}")
                                                    
                                                    if downloaded >= max_images:
                                                        await page.close()
                                                        await browser.close()
                                                        return downloaded
                                                
                                except Exception as e:
                                    continue
                        
                        await page.close()
                        
                    except Exception as e:
                        logger.warning(f"  ⚠️ Failed to scrape {url}: {e}")
                        continue
                
                await browser.close()
                
        except Exception as e:
            logger.error(f"❌ Method 3 failed: {e}")
        
        logger.info(f"✅ Method 3 downloaded {downloaded} images")
        return downloaded
    
    def download_casino_logos(self, casino_names: List[str], max_per_method: int = 20):
        """Download casino logos using all available methods"""
        logger.info(f"🎰 Starting casino logo download for {len(casino_names)} casinos")
        
        total_downloaded = 0
        
        for i, casino_name in enumerate(casino_names, 1):
            logger.info(f"\n[{i}/{len(casino_names)}] Processing: {casino_name}")
            
            casino_downloaded = 0
            
            # Method 1: iCrawler Bing
            search_query = f"{casino_name} casino logo"
            casino_downloaded += self.method1_icrawler_bing(search_query, max_per_method)
            
            # Method 2: BingImages API
            casino_downloaded += self.method2_bingimages_api(search_query, max_per_method)
            
            # Method 3: Direct scraping (async)
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            casino_downloaded += loop.run_until_complete(
                self.method3_playwright_scraping(casino_name, max_per_method)
            )
            loop.close()
            
            total_downloaded += casino_downloaded
            logger.info(f"📊 {casino_name}: {casino_downloaded} images downloaded")
        
        logger.info(f"\n🏆 DOWNLOAD COMPLETE!")
        logger.info(f"📊 Total images downloaded: {total_downloaded}")
        logger.info(f"📁 Images saved in: {self.base_dir}")
        
        return total_downloaded

def main():
    """Main function with casino names"""
    
    # Test with a few major casino names
    casino_names = [
        "Spin Casino",
        "Betway Casino", 
        "888 Casino",
        "LeoVegas",
        "Casumo",
        "PlayOJO",
        "Mr Green",
        "Royal Panda"
    ]
    
    # Initialize downloader
    downloader = ModernImageDownloader("casino_logos_2025")
    
    # Download logos
    total = downloader.download_casino_logos(casino_names, max_per_method=15)
    
    print(f"\n🎯 Successfully downloaded {total} casino logo images!")
    print("🔧 Next steps:")
    print("1. Review downloaded images in casino_logos_2025/ folder")
    print("2. Use best quality logos for your project")
    print("3. Run Sharp.js optimization if needed")

if __name__ == "__main__":
    main()