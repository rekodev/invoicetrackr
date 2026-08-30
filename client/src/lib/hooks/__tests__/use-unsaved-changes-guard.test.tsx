import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import useUnsavedChangesGuard from '../use-unsaved-changes-guard';

describe('useUnsavedChangesGuard', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('confirms dirty navigation and leaves the guard active when canceled', () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({ isDirty: true, message: 'Leave?' })
    );

    expect(result.current.confirmNavigation()).toBe(false);
    expect(confirm).toHaveBeenCalledWith('Leave?');

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });

  it('disables unload protection after a successful save', () => {
    const { result } = renderHook(() =>
      useUnsavedChangesGuard({ isDirty: true, message: 'Leave?' })
    );

    act(() => result.current.disableGuard());

    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('blocks internal links when the user keeps editing', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    renderHook(() =>
      useUnsavedChangesGuard({ isDirty: true, message: 'Leave?' })
    );
    const anchor = document.createElement('a');
    anchor.href = '/invoices';
    document.body.append(anchor);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });

    anchor.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    anchor.remove();
  });

  it('restores the guarded history entry when back navigation is canceled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const forward = vi
      .spyOn(window.history, 'forward')
      .mockImplementation(() => {});
    renderHook(() =>
      useUnsavedChangesGuard({ isDirty: true, message: 'Leave?' })
    );

    window.dispatchEvent(new PopStateEvent('popstate'));

    expect(forward).toHaveBeenCalledOnce();
  });
});
