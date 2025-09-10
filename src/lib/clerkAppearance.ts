// Neo‑Brutalist theme to match site styles
import type { Appearance } from '@clerk/types';

export const clerkAppearance: Appearance = {
  variables: {
    colorPrimary: 'var(--nb-purple)',
    colorText: 'var(--nb-ink)',
    colorBackground: 'var(--nb-white)',
    colorInputBackground: 'var(--nb-white)',
    colorInputText: 'var(--nb-ink)',
    colorDanger: 'var(--nb-red)',
    borderRadius: '18px',
    fontFamily: 'var(--font-sans)',
  },
  elements: {
    card: 'nb-border-strong rounded-[18px] shadow-none',
    headerTitle: 'nb-h2',
    headerSubtitle: 'subtitle',
    formButtonPrimary: 'brutal-button w-full',
    formFieldInput: 'brutal-input',
    formFieldLabel: 'label',
    formFieldError: 'error-text',
    footer: 'rounded-b-[18px] nb-border-strong',
    socialButtons: 'gap-3',
    socialButtonsIconButton: 'brutal-button ghost',
    dividerRow: 'my-4',
    // User menu accents
    userButtonAvatarBox: 'nb-border-strong',
    userButtonPopoverCard: 'nb-border-strong rounded-[18px] shadow-none',
    userButtonPopoverActionButton: 'brutal-button ghost w-full justify-start',
    userButtonPopoverFooter: 'hidden',
  },
};
