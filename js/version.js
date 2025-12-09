/**
 * AgileVizion - Automatic Versioning System
 * Generates cache-busting versions based on file modification timestamps
 * This eliminates the need for manual version updates
 * 
 * IMPORTANT: This script must be loaded FIRST in the <head> and run synchronously
 * before the browser starts loading CSS/JS files
 */

(function() {
    'use strict';

    /**
     * Get version for a file based on its path
     * Uses a date-based version that changes daily + hash for uniqueness
     */
    function getFileVersion(filePath) {
        // Use date-based version that changes daily
        // Format: YYYYMMDD.hash
        const today = new Date();
        const dateStr = today.getFullYear() + 
                       String(today.getMonth() + 1).padStart(2, '0') + 
                       String(today.getDate()).padStart(2, '0');
        
        // Add a hash based on the file path for uniqueness per file
        let hash = 0;
        for (let i = 0; i < filePath.length; i++) {
            const char = filePath.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        const hashStr = Math.abs(hash).toString(36).substring(0, 4);
        
        return dateStr + '.' + hashStr;
    }

    /**
     * Update all CSS and JS links with automatic versions
     * This must run synchronously BEFORE the browser loads the files
     */
    function applyAutoVersions() {
        // Get base path (empty for root, '../' for pages_specs)
        const isInSubfolder = window.location.pathname.includes('/pages_specs/');
        const basePath = isInSubfolder ? '../' : '';

        // Update CSS links - must be done immediately
        const cssLinks = document.querySelectorAll('link[rel="stylesheet"][href*=".css"]');
        cssLinks.forEach(function(link) {
            const href = link.getAttribute('href');
            // Skip CDN links
            if (!href || href.startsWith('http://') || href.startsWith('https://')) {
                return;
            }
            
            // Remove existing version parameter
            const cleanHref = href.split('?')[0];
            const filePath = cleanHref.startsWith('../') ? cleanHref : (cleanHref.startsWith('/') ? cleanHref : basePath + cleanHref);
            const version = getFileVersion(filePath);
            
            // Only update if it's a local file and doesn't already have a version
            if (!filePath.startsWith('http') && !href.includes('?v=')) {
                link.setAttribute('href', cleanHref + '?v=' + version);
            }
        });

        // Update JS script tags - must be done immediately
        const jsScripts = document.querySelectorAll('script[src*=".js"]');
        jsScripts.forEach(function(script) {
            const src = script.getAttribute('src');
            // Skip CDN links and version.js itself (already loaded)
            if (!src || src.startsWith('http://') || src.startsWith('https://') || src.includes('version.js')) {
                return;
            }
            
            // Remove existing version parameter
            const cleanSrc = src.split('?')[0];
            const filePath = cleanSrc.startsWith('../') ? cleanSrc : (cleanSrc.startsWith('/') ? cleanSrc : basePath + cleanSrc);
            const version = getFileVersion(filePath);
            
            // Only update if it's a local file and doesn't already have a version
            if (!filePath.startsWith('http') && !src.includes('?v=')) {
                script.setAttribute('src', cleanSrc + '?v=' + version);
            }
        });
    }

    // Apply versions IMMEDIATELY (synchronously) - before browser loads other resources
    // This is critical: we must modify the DOM before the browser starts loading files
    // Use a small delay to ensure DOM is ready, but run as early as possible
    if (document.readyState === 'loading') {
        // If still loading, run immediately (synchronously)
        applyAutoVersions();
        // Also set up a listener for any dynamically added scripts
        document.addEventListener('DOMContentLoaded', applyAutoVersions);
    } else {
        // If already loaded, run immediately
        applyAutoVersions();
    }

    // Export function for manual use if needed
    window.AutoVersion = {
        getVersion: getFileVersion,
        apply: applyAutoVersions
    };
})();
