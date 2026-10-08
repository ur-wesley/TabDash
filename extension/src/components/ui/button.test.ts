import { describe, expect, it } from 'bun:test';
import { buttonVariants } from './button';

describe('buttonVariants', () => {
  it('generates default button classes', () => {
    const classes = buttonVariants();
    expect(classes).toContain('inline-flex');
    expect(classes).toContain('bg-[var(--primary)]');
    expect(classes).toContain('h-9');
  });

  it('generates variant classes correctly', () => {
    const ghost = buttonVariants({ variant: 'ghost' });
    expect(ghost).toContain('hover:bg-[var(--ghost-hover)]');

    const destructive = buttonVariants({ variant: 'destructive' });
    expect(destructive).toContain('bg-[var(--danger)]');

    const outline = buttonVariants({ variant: 'outline' });
    expect(outline).toContain('border');
  });

  it('generates size classes correctly', () => {
    const sm = buttonVariants({ size: 'sm' });
    expect(sm).toContain('h-8');

    const icon = buttonVariants({ size: 'icon' });
    expect(icon).toContain('h-9 w-9');
  });
});
