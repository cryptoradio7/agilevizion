/**
 * AgileVizion - Automatic Versioning System
 * Generates cache-busting versions based on file modification timestamps
 * This eliminates the need for manual version updates
 */

(function() {
    'use strict';

    /**
     * Get version for a file based on its path
     * Uses file modification time or a hash of the file path + current date
     */
    function getFileVersion(filePath) {
        // For production, we'll use a date-based version that changes daily
        // This ensures cache busting without manual updates
        const today = new Date();
        const dateStr = today.getFullYear() + 
                       String(today.getMonth() + 1).padStart(2, '0') + 
                       String(today.getDate()).padStart(2, '0');
        
        // Add a hash based on the file path for uniqueness
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
     */
    function applyAutoVersions() {
        // Get base path (empty for root, '../' for pages_specs)
        const isInSubfolder = window.location.pathname.includes('/pages_specs/');
        const basePath = isInSubfolder ? '../' : '';

        // Update CSS links
        document.querySelectorAll('link[rel="stylesheet"][href*=".css"]').forEach(function(link) {
            const href = link.getAttribute('href');
            // Skip CDN links
            if (href.startsWith('http://') || href.startsWith('https://')) {
                return;
            }
            
            // Remove existing version parameter
            const cleanHref = href.split('?')[0];
            const filePath = cleanHref.startsWith('../') ? cleanHref : basePath + cleanHref;
            const version = getFileVersion(filePath);
            
            // Only update if it's a local file
            if (!filePath.startsWith('http')) {
                link.setAttribute('href', cleanHref + '?v=' + version);
            }
        });

        // Update JS script tags
        document.querySelectorAll('script[src*=".js"]').forEach(function(script) {
            const src = script.getAttribute('src');
            // Skip CDN links
            if (src.startsWith('http://') || src.startsWith('https://')) {
                return;
            }
            
            // Remove existing version parameter
            const cleanSrc = src.split('?')[0];
            const filePath = cleanSrc.startsWith('../') ? cleanSrc : basePath + cleanSrc;
            const version = getFileVersion(filePath);
            
            // Only update if it's a local file
            if (!filePath.startsWith('http')) {
                script.setAttribute('src', cleanSrc + '?v=' + version);
            }
        });
    }

    // Apply versions when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyAutoVersions);
    } else {
        applyAutoVersions();
    }

    // Export function for manual use if needed
    window.AutoVersion = {
        getVersion: getFileVersion,
        apply: applyAutoVersions
    };
})();

