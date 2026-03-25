// Vercel Web Analytics initialization
// This script injects the Vercel Analytics tracking code
(function() {
  // Import inject function from @vercel/analytics
  // For static sites, we use the script injection method
  var script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  script.dataset.sdkn = '@vercel/analytics';
  script.dataset.sdkv = '2.0.1';
  
  script.onerror = function() {
    console.log('[Vercel Web Analytics] Failed to load analytics script. Please check if Web Analytics is enabled in your Vercel project settings.');
  };
  
  // Only inject in production (Vercel deployments)
  if (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('the-hale-dynasty')) {
    document.head.appendChild(script);
  }
})();
