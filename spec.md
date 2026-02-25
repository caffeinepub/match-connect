# Specification

## Summary
**Goal:** Add WhatsApp-style direct image upload and inline display to the chat feature.

**Planned changes:**
- Extend the backend message data model to support an optional Base64-encoded image field alongside existing text content
- Add a camera/image icon button to the chat input area that opens a native file picker (images only)
- Validate selected images client-side, rejecting files over 1.5 MB with a user-facing error
- Encode selected images as Base64 and send them as messages via the backend
- Render image messages as rounded thumbnails (max ~240px wide) inside chat bubbles
- Clicking a thumbnail opens a full-screen lightbox/modal showing the full-size image
- Show a spinner and disable send controls while an image is being processed and sent

**User-visible outcome:** Users can tap an image icon in the chat input bar, pick a photo from their device, and send it directly in the conversation. Images appear as inline thumbnails in the chat thread and can be tapped to view full size.
