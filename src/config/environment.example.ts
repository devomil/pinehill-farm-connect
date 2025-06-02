
// Example environment configuration for package protection system
// Copy this to environment.ts and customize for your needs

export const environmentConfig = {
  // Package protection settings
  packageProtection: {
    // Lock package.json modifications in production
    lockInProduction: true,
    
    // Require approval for all modifications in development
    requireApproval: process.env.NODE_ENV === 'development',
    
    // Log all modification attempts
    auditLog: true,
    
    // Block specific sources from modifying packages
    blockedSources: ['automated-tool', 'ci-cd'],
    
    // Allow specific approved tools
    approvedTools: ['vite', 'lovable-editor']
  },

  // Feature flags configuration
  featureFlags: {
    // Enable debug mode in development
    debugMode: process.env.NODE_ENV === 'development',
    
    // Advanced features (use VITE_FEATURE_* environment variables)
    advancedScheduling: process.env.VITE_FEATURE_ADVANCED_SCHEDULING === 'true',
    experimentalUI: process.env.VITE_FEATURE_EXPERIMENTAL_UI === 'true',
    realTimeUpdates: process.env.VITE_FEATURE_REALTIME !== 'false', // default true
    
    // Plugin configurations
    charts: true, // recharts is already installed
    animations: process.env.VITE_FEATURE_ANIMATIONS === 'true',
    advancedTables: process.env.VITE_FEATURE_ADVANCED_TABLES === 'true'
  },

  // Plugin loading preferences
  pluginSettings: {
    // Prefer CDN loading for external plugins
    preferCDN: true,
    
    // CDN base URL
    cdnBase: 'https://cdn.jsdelivr.net/npm/',
    
    // Fallback to dynamic imports if CDN fails
    fallbackToDynamic: true,
    
    // Cache loaded plugins
    cachePlugins: true
  }
};

// Example .env file content:
/*
# Package Protection
VITE_LOCK_PACKAGE_JSON=true
VITE_REQUIRE_PACKAGE_APPROVAL=true

# Feature Flags
VITE_FEATURE_ADVANCED_SCHEDULING=false
VITE_FEATURE_EXPERIMENTAL_UI=false
VITE_FEATURE_REALTIME=true
VITE_FEATURE_ANIMATIONS=false
VITE_FEATURE_ADVANCED_TABLES=false

# Development Settings
VITE_DEBUG_MODE=true
VITE_AUDIT_PACKAGE_ATTEMPTS=true
*/
