/**
 * Class that tracks navigation attempts and detects navigation loops
 */
export class NavigationThrottler {
  private lastNavigationTime: number = 0;
  private navigationAttempts: number[] = [];
  private loopDetected: boolean = false;
  private readonly MAX_ATTEMPTS_WINDOW = 3; // Threshold for loop detection
  private readonly LOOP_DETECTION_THRESHOLD_MS = 3000; // Window for detection
  private readonly THROTTLE_THRESHOLD_MS = 1500; // Increased min time between navigations
  private readonly SAFETY_WINDOW_MS = 15000; // Safety window for resetting detection
  private forcedBreakActive: boolean = false; // New flag for forced break mode

  /**
   * Track a navigation attempt and check if it forms part of a loop
   */
  trackNavigationAttempt(): boolean {
    const now = Date.now();
    
    // If we're in forced break mode, block all navigation attempts temporarily
    if (this.forcedBreakActive) {
      console.warn("Navigation throttler in forced break mode - navigation blocked");
      return true;
    }
    
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
      
      // Activate forced break mode to completely block navigation for a short period
      this.forcedBreakActive = true;
      setTimeout(() => {
        console.log("Deactivating forced break mode");
        this.forcedBreakActive = false;
      }, 3000); // Block for 3 seconds to allow state to stabilize
      
      // Safety mechanism: Clear attempts array to prevent continuous loop detection
      this.navigationAttempts = [];
      
      // Set a timer to auto-reset loop detection
      setTimeout(() => {
        if (this.loopDetected) {
          console.log("Auto-resetting loop detection after safety window");
          this.loopDetected = false;
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
    // Always block if in forced break mode
    if (this.forcedBreakActive) {
      return true;
    }
    
    const now = Date.now();
    const timeSinceLastNavigation = now - this.lastNavigationTime;
    
    // More aggressive throttling if we have multiple recent attempts
    const recentAttemptCount = this.navigationAttempts.length;
    
    // Progressively increase throttling as attempts increase
    let throttleTime = this.THROTTLE_THRESHOLD_MS;
    if (recentAttemptCount > 1) {
      // Double throttle time for each additional attempt
      throttleTime = this.THROTTLE_THRESHOLD_MS * recentAttemptCount;
    }
    
    return timeSinceLastNavigation < throttleTime;
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
    this.forcedBreakActive = false;
    console.log("Navigation throttler manually reset");
  }
  
  /**
   * Get the number of recent navigation attempts
   */
  getRecentAttempts(): number {
    return this.navigationAttempts.length;
  }
  
  /**
   * Clear old navigation attempts that are no longer relevant
   */
  cleanupOldAttempts(): void {
    const now = Date.now();
    const previousLength = this.navigationAttempts.length;
    
    this.navigationAttempts = this.navigationAttempts.filter(
      time => now - time < this.LOOP_DETECTION_THRESHOLD_MS
    );
    
    const removed = previousLength - this.navigationAttempts.length;
    if (removed > 0) {
      console.log(`Cleaned up ${removed} old navigation attempts`);
    }
  }
}
