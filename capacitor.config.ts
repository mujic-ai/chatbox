import type { CapacitorConfig } from '@capacitor/cli'

// IMPORTANT: This is a fork (mujic-ai/chatbox). We deliberately use our OWN
// application id namespace (`ai.mujic.*`) instead of upstream Chatbox's
// `xyz.chatboxapp.*`, so the resulting app does NOT collide with / overwrite /
// impersonate the upstream Chatbox product on a device or in any app registry.
const config: CapacitorConfig = {
  appId: 'ai.mujic.chatbox',
  appName: 'Chatbox',
  // electron-vite emits the renderer bundle here when building for the
  // mobile target (CHATBOX_BUILD_TARGET=mobile_app). Capacitor copies this
  // directory into the native Android project as the web assets.
  webDir: 'release/app/dist/renderer',
}

export default config
