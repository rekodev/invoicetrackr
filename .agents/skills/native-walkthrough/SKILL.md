---
name: native-walkthrough
description: Capture a local macOS product walkthrough and assemble a cropped GIF for review or a pull request.
---

# Native Mac walkthrough

Use macOS `screencapture` for source frames when the user requests native capture. Navigate the app with the available browser or computer tool.

1. Inspect the current UI and choose reviewable scenes. Prefer test data. Opening a dialog does not authorize saving, sending, issuing, or deleting real records.
2. Capture the correct display: `screencapture -x -D2 /private/tmp/scene.png`. Inspect the capture to verify the display number. Capture a full display and crop afterward; combining `-D` and `-R` can select an unexpected display.
3. Write a temporary JSON manifest and run `node scripts/assemble-gif.mjs /private/tmp/walkthrough.json`. The script uses the project's existing Sharp dependency, or accepts its module path as a second argument.
4. Inspect every cropped scene before publishing. Exclude browser chrome, personal invoice details, signatures, credentials, and unrelated desktop content. Keep raw captures temporary.

Manifest paths are relative to the manifest file. Example:

```json
{
  "output": "walkthrough.gif",
  "scenes": [
    {
      "input": "scene.png",
      "crop": { "left": 100, "top": 200, "width": 400, "height": 500 },
      "title": "Invoice actions",
      "caption": "Open the payment form",
      "delay": 2600
    }
  ]
}
```

The output defaults to 520 × 820 pixels. Optional `width` and `height` set the canvas size. Each scene's cropped PNG is also written beside the GIF for visual inspection. Attach the GIF only when publication is authorized.
