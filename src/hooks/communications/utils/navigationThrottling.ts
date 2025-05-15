
import { createDebugContext } from "@/utils/debugUtils";

const debug = createDebugContext('NavigationThrottle');

/**
 * Manages navigation throttling to prevent rapid tab changes
 * and detect potential navigation loops
 */
export class NavigationThrottler {
  private lastAttemptTime: number = Date.now();
  private navigationsWithinPeriod: number = 0;
  private errorCount: number = 0;
  private loopDetectedState: boolean = false;

  /**
   * Checks if a navigation should be throttled based on timing and frequency
   */
  shouldThrottle(): boolean {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastAttemptTime;
    
    // Throttle if there have been too many attempts in a short time
    if (timeSinceLastAttempt < 1000) {
      debug.info("Throttling navigation attempt - too many requests");
      
      if (this.errorCount > 3) {
        debug.warn("Too many navigation attempts, possibly in a loop");
        return true;
      }
      
      this.errorCount++;
      return false;
    } else {
      // Reset error count if enough time has passed
      this.errorCount = 0;
      return false;
    }
  }

  /**
   * Tracks navigation attempts to detect rapid navigation (potential loops)
   * Returns true if a potential loop is detected
   */
  trackNavigationAttempt(): boolean {
    const now = Date.now();
    const timeSinceLastAttempt = now - this.lastAttemptTime;
    
    // If less than 1.5 seconds since last navigation, track it as frequent
    if (timeSinceLastAttempt < 1500) {
      this.navigationsWithinPeriod += 1;
      debug.warn(`Rapid navigation: ${this.navigationsWithinPeriod} within 1.5s window`);
      
      // If we have 3 or more rapid navigations, this might be a loop
      if (this.navigationsWithinPeriod >= 3) {
        this.loopDetectedState = true;
        debug.error("Navigation loop detected");
        return true;
      }
    } else {
      // Reset counter if enough time has passed
      this.navigationsWithinPeriod = 0;
    }
    
    this.lastAttemptTime = now;
    return false;
  }
  
  /**
   * Returns whether a loop has been detected
   */
  isLoopDetected(): boolean {
    return this.loopDetectedState;
  }

  /**
   * Resets the loop detection state
   */
  resetLoopDetection(): void {
    this.loopDetectedState = false;
    this.navigationsWithinPeriod = 0;
    this.errorCount = 0;
  }
}
