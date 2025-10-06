#!/bin/bash

# =============================================================================
# CLOUDFLARE DNS UPDATE SCRIPT
# Update DNS A records to point domain to server IP
# =============================================================================

# Configuration
API_TOKEN="PlCykVgOKP-nSzzr-ew91rdCQVxMeeS2JtM8UgDs"
DOMAIN="bestcasinoportal.com"
SERVER_IP="193.181.210.101"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get zone ID
get_zone_id() {
    local domain=$1
    local response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones?name=${domain}" \
        -H "Authorization: Bearer ${API_TOKEN}" \
        -H "Content-Type: application/json")
    
    local zone_id=$(echo $response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    if [ -z "$zone_id" ]; then
        log_error "Failed to get zone ID for domain: $domain"
        echo $response | jq . 2>/dev/null || echo $response
        return 1
    fi
    
    echo $zone_id
}

# Function to get existing DNS record
get_dns_record() {
    local zone_id=$1
    local record_name=$2
    local record_type=$3
    
    local response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records?name=${record_name}&type=${record_type}" \
        -H "Authorization: Bearer ${API_TOKEN}" \
        -H "Content-Type: application/json")
    
    local record_id=$(echo $response | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo $record_id
}

# Function to create or update DNS record
update_dns_record() {
    local zone_id=$1
    local record_name=$2
    local record_type=$3
    local content=$4
    local proxied=$5
    
    # Check if record already exists
    local record_id=$(get_dns_record "$zone_id" "$record_name" "$record_type")
    
    local json_data="{
        \"type\": \"${record_type}\",
        \"name\": \"${record_name}\",
        \"content\": \"${content}\",
        \"ttl\": 1,
        \"proxied\": ${proxied}
    }"
    
    if [ -n "$record_id" ]; then
        # Update existing record
        log_info "Updating existing ${record_type} record for ${record_name}..."
        local response=$(curl -s -X PUT "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records/${record_id}" \
            -H "Authorization: Bearer ${API_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$json_data")
    else
        # Create new record
        log_info "Creating new ${record_type} record for ${record_name}..."
        local response=$(curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${zone_id}/dns_records" \
            -H "Authorization: Bearer ${API_TOKEN}" \
            -H "Content-Type: application/json" \
            -d "$json_data")
    fi
    
    # Check if successful
    local success=$(echo $response | grep -o '"success":[^,]*' | cut -d':' -f2)
    
    if [ "$success" = "true" ]; then
        log_success "${record_type} record for ${record_name} updated successfully"
        return 0
    else
        log_error "Failed to update ${record_type} record for ${record_name}"
        echo $response | jq . 2>/dev/null || echo $response
        return 1
    fi
}

# Main execution
main() {
    log_info "🌐 CLOUDFLARE DNS UPDATE"
    log_info "Domain: $DOMAIN"
    log_info "Server IP: $SERVER_IP"
    log_info "======================================="
    
    # Get zone ID
    log_info "Getting zone ID for domain: $DOMAIN"
    ZONE_ID=$(get_zone_id "$DOMAIN")
    
    if [ $? -ne 0 ]; then
        log_error "Failed to get zone ID. Exiting."
        exit 1
    fi
    
    log_success "Zone ID: $ZONE_ID"
    
    # Update A record for root domain
    log_info "Updating A record for root domain..."
    update_dns_record "$ZONE_ID" "$DOMAIN" "A" "$SERVER_IP" "true"
    
    # Update A record for www subdomain
    log_info "Updating A record for www subdomain..."
    update_dns_record "$ZONE_ID" "www.$DOMAIN" "A" "$SERVER_IP" "true"
    
    log_success "DNS update completed!"
    log_info "======================================="
    log_info "✅ $DOMAIN → $SERVER_IP (Proxied)"
    log_info "✅ www.$DOMAIN → $SERVER_IP (Proxied)"
    log_info ""
    log_info "🔄 DNS propagation may take a few minutes"
    log_info "🔒 Records are proxied through Cloudflare for security and performance"
}

# Execute if run directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi