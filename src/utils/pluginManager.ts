
import { featureFlags } from './featureFlags';
import { packageProtection } from './packageProtection';

interface PluginConfig {
  name: string;
  version?: string;
  enabled: boolean;
  config: Record<string, any>;
  loadMethod: 'cdn' | 'dynamic' | 'feature-flag';
  dependencies?: string[];
}

interface PluginRegistry {
  [key: string]: PluginConfig;
}

class PluginManager {
  private plugins: PluginRegistry = {};
  private loadedPlugins: Set<string> = new Set();

  constructor() {
    this.initializeDefaultPlugins();
  }

  private initializeDefaultPlugins() {
    // Define available plugins that can be loaded without package.json changes
    this.plugins = {
      'chart-library': {
        name: 'recharts',
        enabled: featureFlags.isEnabled('charts'),
        config: { theme: 'default' },
        loadMethod: 'feature-flag' // Already installed
      },
      'date-picker': {
        name: 'react-day-picker',
        enabled: featureFlags.isEnabled('advancedDatePicker'),
        config: { locale: 'en-US' },
        loadMethod: 'feature-flag' // Already installed
      },
      'advanced-tables': {
        name: '@tanstack/react-table',
        version: 'latest',
        enabled: featureFlags.isEnabled('advancedTables'),
        config: { virtualization: true },
        loadMethod: 'cdn'
      },
      'animations': {
        name: 'framer-motion',
        version: 'latest',
        enabled: featureFlags.isEnabled('animations'),
        config: { duration: 0.3 },
        loadMethod: 'cdn'
      }
    };
  }

  async enablePlugin(pluginName: string): Promise<boolean> {
    const plugin = this.plugins[pluginName];
    if (!plugin) {
      console.error(`Plugin ${pluginName} not found in registry`);
      return false;
    }

    packageProtection.logAttempt({
      source: 'plugin-manager',
      action: 'enable-plugin',
      requestedChange: `Enable plugin: ${plugin.name}`,
      approved: true
    });

    try {
      switch (plugin.loadMethod) {
        case 'cdn':
          return await this.loadFromCDN(plugin);
        case 'dynamic':
          return await this.loadDynamically(plugin);
        case 'feature-flag':
          return this.enableViaFeatureFlag(plugin);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginName}:`, error);
      return false;
    }
  }

  private async loadFromCDN(plugin: PluginConfig): Promise<boolean> {
    if (this.loadedPlugins.has(plugin.name)) return true;

    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = `https://cdn.jsdelivr.net/npm/${plugin.name}${plugin.version ? `@${plugin.version}` : ''}`;
      script.onload = () => {
        this.loadedPlugins.add(plugin.name);
        console.log(`Plugin ${plugin.name} loaded from CDN`);
        resolve(true);
      };
      script.onerror = () => {
        console.error(`Failed to load plugin ${plugin.name} from CDN`);
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  private async loadDynamically(plugin: PluginConfig): Promise<boolean> {
    if (this.loadedPlugins.has(plugin.name)) return true;

    try {
      // Use dynamic import for ES modules
      await import(/* @vite-ignore */ plugin.name);
      this.loadedPlugins.add(plugin.name);
      console.log(`Plugin ${plugin.name} loaded dynamically`);
      return true;
    } catch (error) {
      console.error(`Failed to dynamically load plugin ${plugin.name}:`, error);
      return false;
    }
  }

  private enableViaFeatureFlag(plugin: PluginConfig): boolean {
    // Plugin is already available, just enable it via feature flags
    featureFlags.setFlag(plugin.name, {
      enabled: true,
      config: plugin.config
    });
    
    this.loadedPlugins.add(plugin.name);
    console.log(`Plugin ${plugin.name} enabled via feature flag`);
    return true;
  }

  isPluginLoaded(pluginName: string): boolean {
    return this.loadedPlugins.has(pluginName);
  }

  getPluginConfig(pluginName: string): Record<string, any> | undefined {
    const plugin = this.plugins[pluginName];
    return plugin?.config;
  }

  listAvailablePlugins(): PluginRegistry {
    return { ...this.plugins };
  }

  // Alternative to adding new dependencies
  requestPlugin(pluginName: string, justification: string): void {
    packageProtection.logAttempt({
      source: 'plugin-request',
      action: 'request-new-plugin',
      requestedChange: `Request plugin: ${pluginName} - ${justification}`,
      approved: false
    });

    console.log(`Plugin request logged: ${pluginName}`);
    console.log(`Justification: ${justification}`);
    console.log('Consider using existing plugins or CDN loading instead.');
  }
}

export const pluginManager = new PluginManager();

// Utility functions
export const usePlugin = (pluginName: string) => {
  return {
    isLoaded: pluginManager.isPluginLoaded(pluginName),
    config: pluginManager.getPluginConfig(pluginName),
    enable: () => pluginManager.enablePlugin(pluginName)
  };
};

export const withPlugin = <T>(pluginName: string, component: T, fallback: T): T => {
  return pluginManager.isPluginLoaded(pluginName) ? component : fallback;
};
