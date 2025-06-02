/**
 * Enhanced NavigationThrottler with circuit breaker pattern
 * This will aggressively stop navigation loops and improve performance
 */
export class NavigationThrottler {
  private lastNavigationTime: number = 0;
  private navigationAttempts: number[] = [];
  private loopDetected: boolean = false;
  private circuitBreakerActive: boolean = false;
  private readonly MAX_ATTEMPTS_WINDOW = 2; // Reduced from 3 to 2
  private readonly LOOP_DETECTION_THRESHOLD_MS = 2000; // Reduced from 3000 to 2000
  private readonly THROTTLE_THRESHOLD_MS = 2000; // Increased from 1500 to 2000
  private readonly CIRCUIT_BREAKER_DURATION = 30000; // 30 seconds circuit breaker
  private readonly SAFETY_WINDOW_MS = 60000; // Increased safety window
  private forcedBreakActive: boolean = false;
  private circuitBreakerTimer: NodeJS.Timeout | null = null;

  /**
   * Track a navigation attempt with circuit breaker pattern
   */
  trackNavigationAttempt(): boolean {
    const now = Date.now();
    
    // If circuit breaker is active, block ALL navigation
    if (this.circuitBreakerActive) {
      console.warn("Circuit breaker active - all navigation blocked");
      return true;
    }
    
    // If we're in forced break mode, block all navigation attempts
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
    
    // More aggressive loop detection - even 2 attempts in 2 seconds triggers circuit breaker
    if (this.navigationAttempts.length >= this.MAX_ATTEMPTS_WINDOW) {
      console.error("CRITICAL: Navigation loop detected, activating circuit breaker", {
        attempts: this.navigationAttempts.length,
        timeWindow: this.LOOP_DETECTION_THRESHOLD_MS
      });
      
      this.activateCircuitBreaker();
      return true;
    }
    
    // Update last navigation time
    this.lastNavigationTime = now;
    return false;
  }

  /**
   * Activate circuit breaker to completely stop navigation for a period
   */
  private activateCircuitBreaker(): void {
    this.circuitBreakerActive = true;
    this.loopDetected = true;
    this.forcedBreakActive = true;
    
    // Clear all navigation attempts
    this.navigationAttempts = [];
    
    // Clear any existing timer
    if (this.circuitBreakerTimer) {
      clearTimeout(this.circuitBreakerTimer);
    }
    
    // Set timer to deactivate circuit breaker
    this.circuitBreakerTimer = setTimeout(() => {
      console.log("Circuit breaker deactivated - navigation allowed again");
      this.circuitBreakerActive = false;
      this.forcedBreakActive = false;
      this.loopDetected = false;
      this.circuitBreakerTimer = null;
    }, this.CIRCUIT_BREAKER_DURATION);
    
    // Show user notification
    if (typeof window !== 'undefined' && window.location) {
      // Force navigation to announcements tab to break the loop
      window.history.replaceState(null, '', '/communication?tab=announcements&circuit_break=true');
    }
  }

  /**
   * Check if navigation should be throttled
   */
  shouldThrottle(): boolean {
    // Always block if circuit breaker is active
    if (this.circuitBreakerActive || this.forcedBreakActive) {
      return true;
    }
    
    const now = Date.now();
    const timeSinceLastNavigation = now - this.lastNavigationTime;
    
    // More aggressive throttling
    const recentAttemptCount = this.navigationAttempts.length;
    let throttleTime = this.THROTTLE_THRESHOLD_MS;
    
    // Exponentially increase throttle time for rapid attempts
    if (recentAttemptCount > 0) {
      throttleTime = this.THROTTLE_THRESHOLD_MS * Math.pow(2, recentAttemptCount);
    }
    
    return timeSinceLastNavigation < throttleTime;
  }

  /**
   * Check if a navigation loop has been detected
   */
  isLoopDetected(): boolean {
    return this.loopDetected || this.circuitBreakerActive;
  }

  /**
   * Check if circuit breaker is active
   */
  isCircuitBreakerActive(): boolean {
    return this.circuitBreakerActive;
  }

  /**
   * Manual reset with circuit breaker deactivation
   */
  resetLoopDetection(): void {
    this.loopDetected = false;
    this.navigationAttempts = [];
    this.forcedBreakActive = false;
    
    if (this.circuitBreakerTimer) {
      clearTimeout(this.circuitBreakerTimer);
      this.circuitBreakerTimer = null;
    }
    
    this.circuitBreakerActive = false;
    console.log("Navigation throttler completely reset including circuit breaker");
  }
  
  /**
   * Get the number of recent navigation attempts
   */
  getRecentAttempts(): number {
    return this.navigationAttempts.length;
  }
  
  /**
   * Clean up old navigation attempts
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

  /**
   * Get circuit breaker status for debugging
   */
  getStatus() {
    return {
      loopDetected: this.loopDetected,
      circuitBreakerActive: this.circuitBreakerActive,
      forcedBreakActive: this.forcedBreakActive,
      recentAttempts: this.navigationAttempts.length,
      lastNavigationTime: this.lastNavigationTime
    };
  }
}
