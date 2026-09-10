/**
 * App-wide configuration.
 *
 * NOTE: The access passphrase below was acceptable for the original demo,
 * where the binary was only in our hands. On Mars the app ships to real
 * residents — embedding a passphrase in source means anyone reading the
 * codebase or inspecting the bundle can extract it. Moving it out of source
 * (and gating habitat detail behind a passphrase entry screen) is part of
 * Deliverable A — see README.md → Stage 3.
 */
export const AppConfig = {
  accessPassphrase: 'nawy-open-sesame',
};
