import { useEffect, useRef } from 'react';

/**
 * useExamGuard
 * Blocks right-click, copy/paste, selection, and common devtools/shortcut keys.
 * Warns on tab switch/blur and mouse leaving the window. Restores everything on cleanup.
 */
export default function useExamGuard(options) {
  const { enabled, onFirstViolation, onSecondViolation, onFocusReturn } = options || {};
  const warningCountRef = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    const preventDefault = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleContextMenu = (e) => preventDefault(e);
    const handleCopy = (e) => preventDefault(e);
    const handleCut = (e) => preventDefault(e);
    const handlePaste = (e) => preventDefault(e);
    const handleSelectStart = (e) => preventDefault(e);

    const handleKeyDown = (e) => {
      const key = e.key.toLowerCase();
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;
      const isBlockedCombo = (
        (isCtrlOrMeta && (
          key === 'c' || // copy
          key === 'v' || // paste
          key === 'x' || // cut
          key === 's' || // save
          key === 'u' || // view source
          key === 'p' || // print
          key === 'a'    // select all
        )) ||
        (e.shiftKey && isCtrlOrMeta && (key === 'i' || key === 'j')) || // DevTools
        key === 'f12'
      );
      if (isBlockedCombo) {
        preventDefault(e);
      }
    };

    const handleViolation = (violationType = 'activity') => {
      // First violation: warn once and pause via callback
      if (warningCountRef.current === 0) {
        warningCountRef.current = 1;
        alert(`Leaving the test window or suspicious activity (${violationType}) is not allowed. This is your first warning.`);
        if (typeof onFirstViolation === 'function') onFirstViolation();
        return;
      }
      // Second violation: auto-submit via callback
      if (warningCountRef.current === 1) {
        warningCountRef.current = 2;
        if (typeof onSecondViolation === 'function') onSecondViolation();
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab_switch');
      } else {
        if (typeof onFocusReturn === 'function') onFocusReturn();
      }
    };

    const handleWindowBlur = () => {
      handleViolation('window_blur');
    };

    const handleWindowFocus = () => {
      if (typeof onFocusReturn === 'function') onFocusReturn();
    };

    // New handler for detecting when the mouse leaves the viewport
    const handleMouseLeave = (e) => {
      if (!e.relatedTarget && !e.toElement) {
        handleViolation('mouse_leave');
      }
    };

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    // Apply global UI restrictions
    const previousUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = 'none';

    window.addEventListener('contextmenu', handleContextMenu, { capture: true });
    window.addEventListener('copy', handleCopy, { capture: true });
    window.addEventListener('cut', handleCut, { capture: true });
    window.addEventListener('paste', handlePaste, { capture: true });
    window.addEventListener('selectstart', handleSelectStart, { capture: true });
    window.addEventListener('keydown', handleKeyDown, { capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('beforeunload', handleBeforeUnload);
    // Add the new mouse leave event listener
    document.addEventListener('mouseout', handleMouseLeave, { capture: true });

    return () => {
      // Restore everything on cleanup
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener('contextmenu', handleContextMenu, { capture: true });
      window.removeEventListener('copy', handleCopy, { capture: true });
      window.removeEventListener('cut', handleCut, { capture: true });
      window.removeEventListener('paste', handlePaste, { capture: true });
      window.removeEventListener('selectstart', handleSelectStart, { capture: true });
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Remove the mouse leave event listener
      document.removeEventListener('mouseout', handleMouseLeave, { capture: true });
    };
  }, [enabled, onFirstViolation, onSecondViolation, onFocusReturn]);
}