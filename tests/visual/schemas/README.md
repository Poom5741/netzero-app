# Visual capture schemas

The canonical capture manifest schema lives at:

`specs/010-claude-design-parity/contracts/reference-capture-manifest.schema.json`

The artifact reference map schema lives at:

`docs/claude-design-reference-schema.json`

Both schemas are referenced by `tests/visual/lib/capture.ts` and `tests/visual/lib/provenance.ts` and by the screen definitions in `tests/visual/reference-harness/screens/`.

This directory exists so tools can be configured to discover schemas by path. New schemas should be added to the contracts directory above and referenced from here.
