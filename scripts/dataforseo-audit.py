#!/usr/bin/env python3
"""
DataForSEO Comprehensive SEO Audit Script
Performs full on-page SEO analysis for the casino portal Docker website
Uses Context7 documentation for DataForSEO API v3
"""

import requests
import json
import time
import os
from datetime import datetime
from typing import Dict, List, Any, Optional
import base64

class DataForSEOAuditor:
    """
    Comprehensive SEO auditor using DataForSEO API v3
    Based on Context7 documentation
    """
    
    def __init__(self, api_login: str, api_password: str, base_url: str = "http://localhost:3000"):
        self.api_login = api_login
        self.api_password = api_password
        self.base_url = base_url.rstrip('/')
        self.api_endpoint = "https://api.dataforseo.com/v3"
        self.auth_header = self._create_auth_header()
        self.audit_results = {}
        
    def _create_auth_header(self) -> str:
        """Create Basic Auth header for DataForSEO API"""
        credentials = f"{self.api_login}:{self.api_password}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return f"Basic {encoded_credentials}"
    
    def _make_api_request(self, endpoint: str, method: str = "GET", data: Optional[Dict] = None) -> Dict:
        """Make authenticated request to DataForSEO API"""
        url = f"{self.api_endpoint}{endpoint}"
        headers = {
            "Authorization": self.auth_header,
            "Content-Type": "application/json"
        }
        
        try:
            if method == "POST":
                response = requests.post(url, headers=headers, json=data)
            else:
                response = requests.get(url, headers=headers)
            
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            print(f"API request failed: {e}")
            return {"error": str(e)}
    
    def start_comprehensive_audit(self) -> Optional[str]:
        """
        Start comprehensive on-page audit task
        Returns task_id for later retrieval
        """
        print("🚀 Starting comprehensive DataForSEO audit...")
        
        task_data = {
            "data": [{
                "url": self.base_url,
                "enable_javascript": True,
                "custom_js": None,
                "disable_cookie_popup": True,
                "load_resources": True,
                "enable_xhr": True,
                "check_links": True,
                "crawl_delay": 1000,
                "store_raw_html": True,
                "respect_robots_txt": True,
                "crawl_limit": 50,  # Comprehensive crawl
                "enable_content_parsing": True,
                "tag": "casino-portal-audit"
            }]
        }
        
        result = self._make_api_request("/on_page/task_post", "POST", task_data)
        
        if "error" in result:
            print(f"❌ Failed to start audit: {result['error']}")
            return None
            
        if result.get("status_code") == 20000 and result.get("tasks"):
            task_id = result["tasks"][0]["id"]
            print(f"✅ Audit task started successfully. Task ID: {task_id}")
            return task_id
        else:
            print(f"❌ Failed to start audit: {result}")
            return None
    
    def check_task_status(self, task_id: str) -> bool:
        """Check if audit task is ready"""
        result = self._make_api_request("/on_page/tasks_ready")
        
        if "error" in result:
            return False
            
        ready_tasks = result.get("tasks", [])
        return any(task.get("id") == task_id for task in ready_tasks)
    
    def wait_for_completion(self, task_id: str, max_wait: int = 300) -> bool:
        """Wait for audit task to complete"""
        print(f"⏳ Waiting for audit to complete (max {max_wait}s)...")
        
        start_time = time.time()
        while time.time() - start_time < max_wait:
            if self.check_task_status(task_id):
                print("✅ Audit completed!")
                return True
            
            print("⏳ Still processing... (checking again in 30s)")
            time.sleep(30)
        
        print(f"⏰ Timeout after {max_wait}s")
        return False
    
    def get_audit_summary(self, task_id: str) -> Dict:
        """Get comprehensive audit summary"""
        print("📊 Retrieving audit summary...")
        
        result = self._make_api_request(f"/on_page/summary/{task_id}")
        
        if "error" not in result:
            self.audit_results["summary"] = result
            print("✅ Summary retrieved")
        
        return result
    
    def get_pages_analysis(self, task_id: str) -> Dict:
        """Get detailed pages analysis"""
        print("📄 Analyzing all pages...")
        
        result = self._make_api_request(f"/on_page/pages/{task_id}")
        
        if "error" not in result:
            self.audit_results["pages"] = result
            print(f"✅ Analyzed {len(result.get('tasks', [{}])[0].get('result', []))} pages")
        
        return result
    
    def check_duplicate_content(self, task_id: str) -> Dict:
        """Check for duplicate content issues"""
        print("🔍 Checking for duplicate content...")
        
        result = self._make_api_request(f"/on_page/duplicate_content/{task_id}")
        
        if "error" not in result:
            self.audit_results["duplicate_content"] = result
            duplicates = result.get("tasks", [{}])[0].get("result", [])
            if duplicates:
                print(f"⚠️  Found {len(duplicates)} duplicate content issues")
            else:
                print("✅ No duplicate content found")
        
        return result
    
    def check_duplicate_tags(self, task_id: str) -> Dict:
        """Check for duplicate meta tags"""
        print("🏷️  Checking for duplicate meta tags...")
        
        result = self._make_api_request(f"/on_page/duplicate_tags/{task_id}")
        
        if "error" not in result:
            self.audit_results["duplicate_tags"] = result
            duplicates = result.get("tasks", [{}])[0].get("result", [])
            if duplicates:
                print(f"⚠️  Found {len(duplicates)} duplicate tag issues")
            else:
                print("✅ No duplicate tags found")
        
        return result
    
    def analyze_links(self, task_id: str) -> Dict:
        """Analyze internal and external links"""
        print("🔗 Analyzing internal and external links...")
        
        result = self._make_api_request(f"/on_page/links/{task_id}")
        
        if "error" not in result:
            self.audit_results["links"] = result
            links = result.get("tasks", [{}])[0].get("result", [])
            print(f"✅ Analyzed {len(links)} links")
        
        return result
    
    def check_redirect_chains(self, task_id: str) -> Dict:
        """Check for redirect chains"""
        print("🔄 Checking redirect chains...")
        
        result = self._make_api_request(f"/on_page/redirect_chains/{task_id}")
        
        if "error" not in result:
            self.audit_results["redirect_chains"] = result
            chains = result.get("tasks", [{}])[0].get("result", [])
            if chains:
                print(f"⚠️  Found {len(chains)} redirect chain issues")
            else:
                print("✅ No redirect chains found")
        
        return result
    
    def check_non_indexable(self, task_id: str) -> Dict:
        """Check for non-indexable pages"""
        print("🚫 Checking non-indexable pages...")
        
        result = self._make_api_request(f"/on_page/non_indexable/{task_id}")
        
        if "error" not in result:
            self.audit_results["non_indexable"] = result
            pages = result.get("tasks", [{}])[0].get("result", [])
            if pages:
                print(f"⚠️  Found {len(pages)} non-indexable pages")
            else:
                print("✅ All pages are indexable")
        
        return result
    
    def analyze_microdata(self, task_id: str) -> Dict:
        """Analyze structured data and microdata"""
        print("📋 Analyzing structured data (Schema.org)...")
        
        result = self._make_api_request(f"/on_page/microdata/{task_id}")
        
        if "error" not in result:
            self.audit_results["microdata"] = result
            microdata = result.get("tasks", [{}])[0].get("result", [])
            print(f"✅ Found structured data on {len(microdata)} pages")
        
        return result
    
    def analyze_page_speed(self, task_id: str) -> Dict:
        """Analyze page speed with waterfall data"""
        print("⚡ Analyzing page speed performance...")
        
        result = self._make_api_request(f"/on_page/waterfall/{task_id}")
        
        if "error" not in result:
            self.audit_results["waterfall"] = result
            print("✅ Page speed analysis completed")
        
        return result
    
    def analyze_keyword_density(self, task_id: str, keywords: Optional[List[str]] = None) -> Dict:
        """Analyze keyword density for important terms"""
        print("🔤 Analyzing keyword density...")
        
        if not keywords:
            keywords = ["casino", "bonus", "slot", "game", "review", "payout"]
        
        result = self._make_api_request(f"/on_page/keyword_density/{task_id}")
        
        if "error" not in result:
            self.audit_results["keyword_density"] = result
            print("✅ Keyword density analysis completed")
        
        return result
    
    def run_lighthouse_audit(self) -> Dict:
        """Run Google Lighthouse audit for performance, SEO, accessibility"""
        print("🏠 Running Google Lighthouse audit...")
        
        # Start Lighthouse task
        lighthouse_data = {
            "data": [{
                "url": self.base_url,
                "language_name": "English",
                "audits": [
                    "performance", 
                    "accessibility", 
                    "best-practices", 
                    "seo"
                ]
            }]
        }
        
        result = self._make_api_request("/on_page/lighthouse/task_post", "POST", lighthouse_data)
        
        if "error" in result:
            print(f"❌ Failed to start Lighthouse audit: {result['error']}")
            return result
        
        if result.get("status_code") == 20000 and result.get("tasks"):
            lighthouse_task_id = result["tasks"][0]["id"]
            print(f"✅ Lighthouse audit started. Task ID: {lighthouse_task_id}")
            
            # Wait for Lighthouse completion (usually faster)
            print("⏳ Waiting for Lighthouse audit...")
            time.sleep(60)  # Lighthouse is typically faster
            
            # Get Lighthouse results
            lighthouse_result = self._make_api_request(f"/on_page/lighthouse/task_get/json/{lighthouse_task_id}")
            
            if "error" not in lighthouse_result:
                self.audit_results["lighthouse"] = lighthouse_result
                print("✅ Lighthouse audit completed")
            
            return lighthouse_result
        
        return result
    
    def perform_live_analysis(self) -> Dict:
        """Perform live instant analysis"""
        print("⚡ Performing live instant analysis...")
        
        # Live content parsing
        content_result = self._make_api_request(f"/on_page/content_parsing/live?url={self.base_url}")
        
        if "error" not in content_result:
            self.audit_results["live_content"] = content_result
            print("✅ Live content analysis completed")
        
        return content_result
    
    def generate_audit_report(self) -> str:
        """Generate comprehensive audit report"""
        report_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"dataforseo_audit_report_{report_time}.json"
        
        # Add metadata
        self.audit_results["metadata"] = {
            "audit_time": datetime.now().isoformat(),
            "website_url": self.base_url,
            "audit_type": "comprehensive_dataforseo",
            "api_version": "v3"
        }
        
        # Save detailed results
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(self.audit_results, f, indent=2, ensure_ascii=False)
        
        print(f"📁 Detailed report saved: {report_file}")
        
        # Generate summary report
        summary_file = f"dataforseo_audit_summary_{report_time}.md"
        self._generate_summary_report(summary_file)
        
        return report_file
    
    def _generate_summary_report(self, filename: str):
        """Generate human-readable summary report"""
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"# DataForSEO SEO Audit Report\n\n")
            f.write(f"**Website:** {self.base_url}\n")
            f.write(f"**Audit Date:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"**Audit Type:** Comprehensive DataForSEO Analysis\n\n")
            
            # Summary section
            if "summary" in self.audit_results:
                f.write("## 📊 Audit Summary\n\n")
                summary_data = self.audit_results["summary"].get("tasks", [{}])[0].get("result", [{}])[0]
                if summary_data:
                    f.write(f"- **Total Pages Crawled:** {summary_data.get('total_page_count', 'N/A')}\n")
                    f.write(f"- **Pages with Issues:** {summary_data.get('pages_with_errors', 'N/A')}\n")
                    f.write(f"- **Total Issues Found:** {summary_data.get('total_issues', 'N/A')}\n\n")
            
            # Pages analysis
            if "pages" in self.audit_results:
                f.write("## 📄 Pages Analysis\n\n")
                pages_data = self.audit_results["pages"].get("tasks", [{}])[0].get("result", [])
                f.write(f"**Total Pages Analyzed:** {len(pages_data)}\n\n")
                
                for page in pages_data[:10]:  # Top 10 pages
                    if page.get("url"):
                        f.write(f"### {page['url']}\n")
                        f.write(f"- **Status Code:** {page.get('status_code', 'N/A')}\n")
                        f.write(f"- **Title:** {page.get('meta', {}).get('title', 'N/A')}\n")
                        f.write(f"- **Meta Description:** {page.get('meta', {}).get('description', 'N/A')}\n")
                        f.write(f"- **Content Length:** {page.get('content', {}).get('size', 'N/A')} chars\n\n")
            
            # Duplicate content
            if "duplicate_content" in self.audit_results:
                f.write("## 🔍 Duplicate Content Issues\n\n")
                duplicates = self.audit_results["duplicate_content"].get("tasks", [{}])[0].get("result", [])
                if duplicates:
                    f.write(f"**Found {len(duplicates)} duplicate content issues:**\n\n")
                    for dup in duplicates[:5]:  # Top 5 issues
                        f.write(f"- {dup.get('url', 'N/A')}\n")
                else:
                    f.write("✅ No duplicate content issues found\n\n")
            
            # Link analysis
            if "links" in self.audit_results:
                f.write("## 🔗 Link Analysis\n\n")
                links_data = self.audit_results["links"].get("tasks", [{}])[0].get("result", [])
                internal_links = [link for link in links_data if link.get("type") == "internal"]
                external_links = [link for link in links_data if link.get("type") == "external"]
                
                f.write(f"- **Total Links:** {len(links_data)}\n")
                f.write(f"- **Internal Links:** {len(internal_links)}\n")
                f.write(f"- **External Links:** {len(external_links)}\n\n")
            
            # Lighthouse results
            if "lighthouse" in self.audit_results:
                f.write("## 🏠 Google Lighthouse Audit\n\n")
                lighthouse_data = self.audit_results["lighthouse"].get("tasks", [{}])[0].get("result", [{}])[0]
                if lighthouse_data and "lighthouse" in lighthouse_data:
                    categories = lighthouse_data["lighthouse"].get("categories", {})
                    f.write(f"- **Performance Score:** {categories.get('performance', {}).get('score', 'N/A')}\n")
                    f.write(f"- **SEO Score:** {categories.get('seo', {}).get('score', 'N/A')}\n")
                    f.write(f"- **Accessibility Score:** {categories.get('accessibility', {}).get('score', 'N/A')}\n")
                    f.write(f"- **Best Practices Score:** {categories.get('best-practices', {}).get('score', 'N/A')}\n\n")
            
            f.write("## 📋 Recommendations\n\n")
            f.write("1. **Meta Tags:** Ensure all pages have unique titles and descriptions\n")
            f.write("2. **Content:** Fix any duplicate content issues\n")
            f.write("3. **Links:** Check for broken internal and external links\n")
            f.write("4. **Performance:** Optimize images and reduce page load times\n")
            f.write("5. **Structure:** Implement proper heading hierarchy (H1-H6)\n")
            f.write("6. **Schema:** Add structured data for better search visibility\n\n")
            
            f.write(f"*Report generated using DataForSEO API v3*\n")
        
        print(f"📋 Summary report saved: {filename}")

def main():
    """Main execution function"""
    print("🎰 DataForSEO Casino Portal SEO Audit")
    print("=" * 50)
    
    # Check for API credentials
    api_login = os.getenv("DATAFORSEO_LOGIN")
    api_password = os.getenv("DATAFORSEO_PASSWORD")
    
    if not api_login or not api_password:
        print("❌ DataForSEO API credentials not found!")
        print("Please set environment variables:")
        print("- DATAFORSEO_LOGIN=your_login")
        print("- DATAFORSEO_PASSWORD=your_password")
        print("\nOr run with:")
        print("python dataforseo-audit.py --login YOUR_LOGIN --password YOUR_PASSWORD")
        return
    
    # Initialize auditor
    auditor = DataForSEOAuditor(api_login, api_password)
    
    try:
        # Step 1: Start comprehensive audit
        task_id = auditor.start_comprehensive_audit()
        if not task_id:
            return
        
        # Step 2: Wait for completion
        if not auditor.wait_for_completion(task_id):
            print("❌ Audit timed out. You can check results later using task ID:", task_id)
            return
        
        # Step 3: Gather all audit data
        print("\n📊 Gathering comprehensive audit data...")
        auditor.get_audit_summary(task_id)
        auditor.get_pages_analysis(task_id)
        auditor.check_duplicate_content(task_id)
        auditor.check_duplicate_tags(task_id)
        auditor.analyze_links(task_id)
        auditor.check_redirect_chains(task_id)
        auditor.check_non_indexable(task_id)
        auditor.analyze_microdata(task_id)
        auditor.analyze_page_speed(task_id)
        auditor.analyze_keyword_density(task_id)
        
        # Step 4: Run Lighthouse audit
        auditor.run_lighthouse_audit()
        
        # Step 5: Perform live analysis
        auditor.perform_live_analysis()
        
        # Step 6: Generate reports
        print("\n📁 Generating audit reports...")
        report_file = auditor.generate_audit_report()
        
        print("\n🎉 DataForSEO audit completed successfully!")
        print(f"📁 Detailed results: {report_file}")
        print(f"📋 Summary: {report_file.replace('.json', '.md')}")
        
    except Exception as e:
        print(f"❌ Audit failed: {e}")

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="DataForSEO Casino Portal SEO Audit")
    parser.add_argument("--login", help="DataForSEO API login")
    parser.add_argument("--password", help="DataForSEO API password")
    parser.add_argument("--url", default="http://localhost:3000", help="Website URL to audit")
    
    args = parser.parse_args()
    
    if args.login and args.password:
        os.environ["DATAFORSEO_LOGIN"] = args.login
        os.environ["DATAFORSEO_PASSWORD"] = args.password
    
    main()