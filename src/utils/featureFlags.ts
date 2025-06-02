
interface FeatureConfig {
  enabled: boolean;
  config?: Record<string, any>;
  environment?: string[];
  dependencies?: string[];
}

interface FeatureFlags {
  [key: string]: FeatureConfig;
}

class FeatureFlagManager {
  private flags: FeatureFlags = {};
  private environment = import.meta.env.MODE || 'development';

  constructor() {
    this.loadFlags();
  }

  private loadFlags() {
    // Load from environment variables
    const envFlags = this.parseEnvFlags();
    
    // Load from localStorage for development
    const localFlags = this.loadLocalFlags();
    
    // Merge flags with priority: env > local > defaults
    this.flags = {
      ...this.getDefaultFlags(),
      ...localFlags,
      ...envFlags
    };
  }

  private parseEnvFlags(): FeatureFlags {
    const flags: FeatureFlags = {};
    
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_FEATURE_')) {
        const flagName = key.replace('VITE_FEATURE_', '').toLowerCase();
        const value = import.meta.env[key];
        
        try {
          flags[flagName] = JSON.parse(value);
        } catch {
          flags[flagName] = { enabled: value === 'true' };
        }
      }
    });
    
    return flags;
  }

  private loadLocalFlags(): FeatureFlags {
    if (this.environment !== 'development') return {};
    
    try {
      const stored = localStorage.getItem('featureFlags');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  }

  private getDefaultFlags(): FeatureFlags {
    return {
      debugMode: {
        enabled: this.environment === 'development',
        config: { level: 'info' }
      },
      advancedScheduling: {
        enabled: false,
        dependencies: ['@tanstack/react-query']
      },
      realTimeUpdates: {
        enabled: true,
        config: { interval: 30000 }
      },
      experimentalFeatures: {
        enabled: false,
        environment: ['development', 'staging']
      }
    };
  }

  isEnabled(flagName: string): boolean {
    const flag = this.flags[flagName];
    if (!flag) return false;
    
    // Check environment restrictions
    if (flag.environment && !flag.environment.includes(this.environment)) {
      return false;
    }
    
    return flag.enabled;
  }

  getConfig(flagName: string): Record<string, any> | undefined {
    const flag = this.flags[flagName];
    return flag?.config;
  }

  setFlag(flagName: string, config: FeatureConfig): void {
    if (import.meta.env.PROD) {
      console.warn('Cannot modify feature flags in production');
      return;
    }
    
    this.flags[flagName] = config;
    this.saveLocalFlags();
  }

  private saveLocalFlags(): void {
    if (this.environment === 'development') {
      localStorage.setItem('featureFlags', JSON.stringify(this.flags));
    }
  }

  getAllFlags(): FeatureFlags {
    return { ...this.flags };
  }

  // Alternative to package installations
  loadExternalLibrary(libraryName: string, version?: string): Promise<boolean> {
    console.log(`Loading external library: ${libraryName}${version ? `@${version}` : ''}`);
    
    // Instead of modifying package.json, use dynamic imports or CDN
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://cdn.jsdelivr.net/npm/${libraryName}${version ? `@${version}` : ''}`;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });
  }
}

export const featureFlags = new FeatureFlagManager();

// Utility functions for common scenarios
export const withFeatureFlag = <T>(flagName: string, component: T, fallback?: T): T => {
  return featureFlags.isEnabled(flagName) ? component : (fallback || component);
};

export const useFeatureConfig = (flagName: string) => {
  return {
    enabled: featureFlags.isEnabled(flagName),
    config: featureFlags.getConfig(flagName)
  };
};
