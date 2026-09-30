# AI Native compositional diversity

`src/diversity/creativeContract.ts` derives a model-only Creative Contract from
the brief, the user's creative prompt, style direction, and `entropySeed`. It
selects compatible morphologies for opening, features, proof, objections,
closing, and navigation. Every seed decision is recorded as
`seed → decision → promptDirective`; Gemini receives decisions, not a claim that
it computed Entrospec's seed hashes.

The AI Native path appends the contract to the user's creative prompt and sends
it through the existing HTML-document request. It does not create or render a
Blueprint. Similarity retries ask Gemini for a second HTML document, preserve the
creative content and constraints, and leave the generated document untouched.
Retry settings:

- `VITE_AI_NATIVE_SIMILARITY_THRESHOLD` (default `0.82`)
- `VITE_AI_NATIVE_MAX_REGENERATIONS` (default `2`)

`src/diversity/nativeStructureFingerprint.ts` fingerprints generated HTML and
compares it with recent saved drafts, curated documents, and current-session
outputs. Unsupported quantitative and guarantee claims are reported on the
record and in the inspector; the HTML is not rewritten.
