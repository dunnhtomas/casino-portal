#!/usr/bin/env python3
"""
Setup script for Modern Casino Logo Downloader - 2025 Edition
Installs all required dependencies and initializes Playwright
"""

import subprocess
import sys

def run_command(command):
    """Run a shell command and return success status"""
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {command}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {command}")
        print(f"Error: {e.stderr}")
        return False

def main():
    print("🎰 Modern Casino Logo Downloader - Setup Script")
    print("=" * 50)
    
    # Install Python packages
    print("\n📦 Installing Python packages...")
    success = run_command("pip install -r requirements-image-downloader.txt")
    
    if success:
        print("\n🎭 Installing Playwright browsers...")
        run_command("playwright install chromium")
        
        print("\n✅ Setup completed successfully!")
        print("\n🚀 You can now run:")
        print("   python download_images.py")
        
        print("\n📚 Available methods:")
        print("   1. iCrawler with Bing/Google (multi-threaded)")
        print("   2. BingImages direct API")
        print("   3. Playwright website scraping")
        print("   4. Smart duplicate detection")
        print("   5. Advanced image validation")
    else:
        print("\n❌ Setup failed. Please check the error messages above.")
        sys.exit(1)

if __name__ == "__main__":
    main()