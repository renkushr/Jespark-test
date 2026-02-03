import liff from '@line/liff';
import { LIFF_CONFIG } from '../config/liff';

export interface LiffProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
  email?: string;
}

class LiffService {
  private initialized = false;

  /**
   * Initialize LIFF (idempotent - safe to call multiple times)
   */
  async init(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      if (!LIFF_CONFIG.liffId) {
        console.error('LIFF ID is not configured');
        return false;
      }

      await liff.init({ liffId: LIFF_CONFIG.liffId });
      this.initialized = true;
      console.log('LIFF initialized successfully');
      return true;
    } catch (error) {
      console.error('LIFF initialization failed:', error);
      return false;
    }
  }

  /**
   * Check if LIFF is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    if (!this.initialized) return false;
    return liff.isLoggedIn();
  }

  /**
   * Login with LINE
   */
  login(): void {
    if (!this.initialized) {
      console.error('LIFF is not initialized');
      return;
    }
    liff.login();
  }

  /**
   * Logout from LINE
   */
  logout(): void {
    if (!this.initialized) {
      console.error('LIFF is not initialized');
      return;
    }
    liff.logout();
  }

  /**
   * Get user profile
   */
  async getProfile(): Promise<LiffProfile | null> {
    try {
      if (!this.initialized || !this.isLoggedIn()) {
        return null;
      }

      const profile = await liff.getProfile();
      
      // Try to get email if permission is granted
      let email: string | undefined;
      try {
        const decodedIDToken = liff.getDecodedIDToken();
        email = decodedIDToken?.email;
      } catch (e) {
        console.log('Email not available');
      }

      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
        email,
      };
    } catch (error) {
      console.error('Failed to get profile:', error);
      return null;
    }
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    if (!this.initialized || !this.isLoggedIn()) {
      return null;
    }
    return liff.getAccessToken();
  }

  /**
   * Check if running in LINE app
   */
  isInClient(): boolean {
    if (!this.initialized) return false;
    return liff.isInClient();
  }

  /**
   * Get OS
   */
  getOS(): string {
    if (!this.initialized) return 'unknown';
    return liff.getOS();
  }

  /**
   * Get LINE version
   */
  getLineVersion(): string | null {
    if (!this.initialized) return null;
    return liff.getLineVersion();
  }

  /**
   * Close LIFF window
   */
  closeWindow(): void {
    if (!this.initialized) return;
    liff.closeWindow();
  }

  /**
   * Open external URL
   */
  openWindow(url: string, external = true): void {
    if (!this.initialized) return;
    liff.openWindow({
      url,
      external,
    });
  }

  /**
   * Send messages (requires messaging API)
   */
  async sendMessages(messages: any[]): Promise<void> {
    if (!this.initialized) {
      throw new Error('LIFF is not initialized');
    }
    if (!liff.isApiAvailable('shareTargetPicker')) {
      throw new Error('shareTargetPicker is not available');
    }
    await liff.shareTargetPicker(messages);
  }

  /**
   * Get context (group/room info)
   */
  getContext(): any {
    if (!this.initialized) return null;
    return liff.getContext();
  }
}

// Export singleton instance
export const liffService = new LiffService();
