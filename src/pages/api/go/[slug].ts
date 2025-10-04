/**
 * Affiliate Redirect API Endpoint
 * Handles /api/go/{slug} routes for casino affiliate links
 * Static generation for all casinos
 */

import type { APIRoute } from 'astro';
import { getAffiliateUrl } from '../../../lib/affiliate-manager-clean';
import casinosData from '../../../../data/casinos.json';

// Generate static paths for all casinos at build time
export function getStaticPaths() {
  return casinosData.map((casino: any) => ({
    params: { slug: casino.slug },
    props: { casino }
  }));
}

export const GET: APIRoute = async ({ params, props, request }) => {
  const { slug } = params;
  const casino = (props as any).casino;
  
  if (!slug || !casino) {
    return new Response('Casino slug is required', { status: 400 });
  }

  try {
    
    if (!casino) {
      return new Response(`Casino not found: ${slug}`, { status: 404 });
    }

    // Get the best affiliate URL
    let redirectUrl = casino.url; // Default fallback

    if (casino.affiliate && casino.affiliate.link) {
      redirectUrl = casino.affiliate.link;
    } else {
      // Use the affiliate manager as backup
      redirectUrl = await getAffiliateUrl({
        casinoSlug: slug,
        fallbackUrl: casino.url,
        geo: 'GLOBAL',
        priority: 'affiliate'
      });
    }

    // Add tracking parameters
    const url = new URL(redirectUrl);
    url.searchParams.set('utm_source', 'bestcasinoportal');
    url.searchParams.set('utm_medium', 'affiliate');
    url.searchParams.set('utm_campaign', 'casino-redirect');
    url.searchParams.set('utm_content', slug);
    
    // Get user's IP for geo-targeting (if needed)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const clientIP = forwardedFor ? forwardedFor.split(',')[0] : 'unknown';
    
    // Log the redirect for analytics
    console.log(`[${new Date().toISOString()}] Affiliate redirect: ${casino.brand} (${slug}) -> ${url.toString()} [IP: ${clientIP}]`);

    // Return redirect response
    return new Response(null, {
      status: 302,
      headers: {
        'Location': url.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error(`Error processing affiliate redirect for ${slug}:`, error);
    
    // Return a generic error page redirect
    return new Response(null, {
      status: 302,
      headers: {
        'Location': '/?error=redirect-failed',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  }
};