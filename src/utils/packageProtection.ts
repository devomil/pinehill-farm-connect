
import { toast } from "sonner";

export interface PackageModificationAttempt {
  timestamp: Date;
  source: string;
  action: string;
  requestedChange?: string;
  approved: boolean;
  environment: 'development' | 'production' | 'staging';
}

class PackageProtectionManager {
  private attempts: PackageModificationAttempt[] = [];
  private isProduction = import.meta.env.PROD;
  private isLocked = this.isProduction || import.meta.env.VITE_LOCK_PACKAGE_JSON === 'true';

  constructor() {
    this.initializeProtection();
  }

  private initializeProtection() {
    // Monitor for package.json modification attempts
    if (typeof window !== 'undefined') {
      this.setupFileSystemWatcher();
    }
  }

  private setupFileSystemWatcher() {
    // Log any attempts to access package management APIs
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0]?.toString() || '';
      if (url.includes('package') || url.includes('npm') || url.includes('dependency')) {
        this.logAttempt({
          source: 'fetch-api',
          action: 'network-request',
          requestedChange: url,
          approved: false
        });
      }
      return originalFetch.apply(window, args);
    };
  }

  logAttempt(attempt: Omit<PackageModificationAttempt, 'timestamp' | 'environment'>) {
    const fullAttempt: PackageModificationAttempt = {
      ...attempt,
      timestamp: new Date(),
      environment: this.isProduction ? 'production' : 'development'
    };

    this.attempts.push(fullAttempt);
    console.warn('Package modification attempt detected:', fullAttempt);

    if (this.isLocked && !attempt.approved) {
      toast.error('Package modification blocked', {
        description: `Attempt to ${attempt.action} from ${attempt.source} was blocked in ${fullAttempt.environment} environment.`
      });
      throw new Error(`Package modification blocked: ${attempt.action} from ${attempt.source}`);
    }

    return fullAttempt;
  }

  requestApproval(change: string, source: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.isProduction) {
        console.error('Package modifications not allowed in production');
        resolve(false);
        return;
      }

      const confirmed = window.confirm(
        `Approve package modification?\n\nChange: ${change}\nSource: ${source}\n\nThis will be logged for audit purposes.`
      );

      this.logAttempt({
        source,
        action: 'manual-approval-request',
        requestedChange: change,
        approved: confirmed
      });

      resolve(confirmed);
    });
  }

  getAttempts(): PackageModificationAttempt[] {
    return [...this.attempts];
  }

  exportAuditLog(): string {
    return JSON.stringify(this.attempts, null, 2);
  }

  checkPermissions(): {
    canModify: boolean;
    environment: string;
    isLocked: boolean;
    reason?: string;
  } {
    return {
      canModify: !this.isLocked,
      environment: this.isProduction ? 'production' : 'development',
      isLocked: this.isLocked,
      reason: this.isLocked ? 'Package modifications locked in this environment' : undefined
    };
  }
}

export const packageProtection = new PackageProtectionManager();

// Export utility functions for common package management scenarios
export const handleDependencyRequest = async (packageName: string, version?: string) => {
  const change = `Add dependency: ${packageName}${version ? `@${version}` : ''}`;
  
  packageProtection.logAttempt({
    source: 'dependency-manager',
    action: 'add-dependency',
    requestedChange: change,
    approved: false
  });

  toast.info('Dependency request logged', {
    description: `Request to add ${packageName} has been logged. Use environment variables or runtime configuration instead.`
  });

  return false;
};

export const suggestAlternative = (packageName: string, alternative: string) => {
  toast.info('Alternative configuration suggested', {
    description: `Instead of adding ${packageName}, consider using ${alternative}`
  });
  
  console.log(`Package alternative suggested: ${packageName} -> ${alternative}`);
};
