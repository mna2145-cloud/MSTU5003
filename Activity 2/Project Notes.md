# Project Notes

## Assignment idea

The activity practices computational thinking by breaking a skincare routine into steps. The routine is decomposed into actions such as checking the time of day, cleansing, applying leave-on products, moisturizing, and using sunscreen in the morning. A simple ordering rule is to apply thinner products before thicker ones. The routine also uses a morning-versus-night decision: sunscreen for morning and a sleep mask for night.

## Pseudocode

```text
START skincare routine

CHECK whether it is morning

GATHER the skincare products to use

WASH face with cleanser
PAT face dry

FOR EACH leave-on product in the routine:
    APPLY product
    FOLLOW product directions
    APPLY thinner products before thicker products

APPLY moisturizer

IF it is morning:
    APPLY sunscreen as the final step

END skincare routine
```

## Prototype

The prototype is a small game focused on checking whether it is morning or night and choosing the matching action. Clicking **Check time of day** randomly selects morning or night. Morning uses a light yellow background; night uses a dark blue background. The player chooses **Apply sunscreen** for morning or **Apply sleep mask** for night. Correct answers add one point. The player can reset the score.

The page includes sun and moon emojis in the heading, a sunscreen emoji on the sunscreen button, and a sleep emoji on the sleep mask button. After a correct answer, the page says that a point was earned and prompts the player to click “check the time” to play again. An incorrect answer does not show that replay prompt.

## Essential code concepts

- `index.html` contains the page content: heading, buttons, messages, and score display. Element IDs let JavaScript find and update those elements.
- `style.css` controls layout and appearance. Adding the `night` class to the page changes its background and text colors.
- `script.js` tracks game state with `isMorning`, `roundIsOpen`, and `score`.
- A click event on the time-check button randomly selects morning or night, updates the message and background, and enables the action buttons.
- The `chooseAction()` function compares the selected action with the time of day. A correct match increments and displays the score.
- After one answer, the action buttons are disabled until the next time check, so only one answer counts per round.
- The reset button sets the score to zero and updates the display.
