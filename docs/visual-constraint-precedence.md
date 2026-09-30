# Visual constraint precedence

The procedural path resolves competing visual values in this order:

1. `USER_EXPLICIT` — literal visual values and constraints written by the user.
2. `BRAND` — brand brief values such as `preferredColors`.
3. `MODEL` — values from a creative proposal.
4. `ART_DIRECTION` — values interpreted from an explicit/derived art direction.
5. `GENOME` — seeded procedural selections.
6. `ADAPTER` — renderer compatibility mappings.
7. `FALLBACK` — neutral defaults only when no higher-precedence value exists.

The order is exported as `VisualConstraintPrecedence` from
`src/design/creativeProposalV2.ts`. Explicit preferred colors replace the matching
procedural token slots before rendering. AI Native sends the user's creative prompt
unchanged ahead of its documented output contract, and never applies procedural
tokens or render-time restyling to generated HTML.

Typography is selected from `ArtDirection.allowedTypographyBehaviors`; the
composition RNG may only select within that allowed set. Technical monospace is
available only when the art-direction seed explicitly asks for mono/technical/code.
