/**
 * Open-source edition stub for the pro-only translation package.
 *
 * The hosted Chatbox edition ships a real machine-translation implementation
 * here. It is not part of the open-source repo, but some cherry-picked UI code
 * (e.g. the "translate error message" button in MessageErrTips) imports it.
 *
 * To keep the open build working we degrade gracefully: return the input texts
 * unchanged so the UI simply shows the original (untranslated) text.
 */

export interface TranslateTextsOptions {
  sourceLang?: string
}

export async function translateTexts(
  texts: string[],
  _targetLang?: string,
  _options?: TranslateTextsOptions
): Promise<string[]> {
  return texts
}
