
/**
 * Class that tracks navigation attempts and detects navigation loops
 */
export class NavigationThrottler {
  private lastNavigationTime: number = 0;
  private navigationAttempts: number[] = [];
  private loopDetected: boolean = false;
  private readonly MAX_ATTEMPTS_WINDOW = 5; // Max attempts in time window
  private readonly LOOP_DETECTION_THRESHOLD_MS = 2000; // Time window for loop detection
  private readonly THROTTLE_THRESHOLD_MS = 300; // Min time between navigations
  private readonly SAFETY_WINDOW_MS = 5000; // Safety window for resetting detection

  /**
   * Track a navigation attempt and check if it forms part of a loop
   */
  trackNavigationAttempt(): boolean {
    const now = Date.now();
    
    // Add current attempt to history
    this.navigationAttempts.push(now);
    
    // Keep only recent attempts within our detection window
    this.navigationAttempts = this.navigationAttempts.filter(
      time => now - time < this.LOOP_DETECTION_THRESHOLD_MS
    );
    
    // If we have too many attempts in a short period, mark as loop
    if (this.navigationAttempts.length >= this.MAX_ATTEMPTS_WINDOW) {
      console.warn("Navigation loop detected:", this.navigationAttempts.length, 
        "attempts in", this.LOOP_DETECTION_THRESHOLD_MS, "ms");
      this.loopDetected = true;
      
      // Safety mechanism: Clear attempts array to prevent continuous loop detection
      // after the issue has been addressed
      setTimeout(() => {
        if (this.navigationAttempts.length > 0) {
          console.log("Clearing navigation attempts after safety window");
          this.navigationAttempts = [];
        }
      }, this.SAFETY_WINDOW_MS);
      
      return true;
    }
    
    // Update last navigation time
    this.lastNavigationTime = now;
    return false;
  }

  /**
   * Check if navigation should be throttled
   */
  shouldThrottle(): boolean {
    const now = Date.now();
    return now - this.lastNavigationTime < this.THROTTLE_THRESHOLD_MS;
  }

  /**
   * Check if a navigation loop has been detected
   */
  isLoopDetected(): boolean {
    return this.loopDetected;
  }

  /**
   * Reset the loop detection state
   */
  resetLoopDetection(): void {
    this.loopDetected = false;
    this.navigationAttempts = [];
  }
  
  /**
   * Get the number of recent navigation attempts
   */
  getRecentAttempts(): number {
    return this.navigationAttempts.length;
  }
}
