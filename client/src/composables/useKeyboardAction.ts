import { onMounted, onBeforeUnmount } from 'vue'

/**
 * A composable that listens for the 'Enter' and 'Escape' keys globally
 * and triggers the corresponding actions.
 *
 * @param {Function} onEnter - A callback function to run when the 'Enter' key is pressed.
 * @param {Function} onEscape - A callback function to run when the 'Escape' key is pressed.
 * @param {Function} [inputLengthCondition] - An optional condition that is checked before the 'Enter' key action is triggered (defaults to always true).
 *
 * @example
 * useKeyboardAction(
 *   () => confirmAction(true),  // Action to trigger when Enter is pressed
 *   () => confirmAction(false), // Action to trigger when Escape is pressed
 *   () => title.length >= 3     // Condition for Enter key action (input length check)
 * )
 */
export function useKeyboardAction(
  onEnter: () => void,
  onEscape: () => void,
  inputLengthCondition: () => boolean = () => true
) {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && inputLengthCondition()) {
      onEnter()
    } else if (event.key === 'Escape') {
      onEscape()
    }
  }

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', handleKeyDown)
  })
}
