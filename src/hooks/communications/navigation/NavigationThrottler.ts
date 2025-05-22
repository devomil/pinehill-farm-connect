
/**
 * Class that tracks navigation attempts and detects navigation loops
 */
export class NavigationThrottler {
  private lastNavigationTime: number = 0;
  private navigationAttempts: number[] = [];
  private loopDetected: boolean = false;
  private readonly MAX_ATTEMPTS_WINDOW = 6; // Increased slightly to be more tolerant
  private readonly LOOP_DETECTION_THRESHOLD_MS = 3000; // Extended window for loop detection
  private readonly THROTTLE_THRESHOLD_MS = 400; // Increased min time between navigations
  private readonly SAFETY_WINDOW_MS = 7000; // Extended safety window for resetting detection

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
          
          // After safety window, also reset loop detection if it was still active
          if (this.loopDetected) {
            this.loopDetected = false;
            console.log("Auto-resetting loop detection after safety window");
          }
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
    const timeSinceLastNavigation = now - this.lastNavigationTime;
    
    // More aggressive throttling if we have multiple recent attempts
    const recentAttemptCount = this.navigationAttempts.length;
    const shouldThrottle = recentAttemptCount > 3 
      ? timeSinceLastNavigation < (this.THROTTLE_THRESHOLD_MS * 1.5) // Longer throttle on high activity
      : timeSinceLastNavigation < this.THROTTLE_THRESHOLD_MS; // Normal throttle otherwise
      
    if (shouldThrottle && recentAttemptCount > 3) {
      console.log(`Enhanced throttling applied with ${recentAttemptCount} recent attempts`);
    }
    
    return shouldThrottle;
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
