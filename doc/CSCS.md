# CSCS (Concern Separation & Coupling Standard)

## Purpose
Maintain clean dependency direction and concern purity.

## Rules
1. Runtime/domain modules must not depend on feature UI modules.
2. Feature UI modules may depend on runtime/domain modules.
3. Shared primitives/types live in neutral modules; avoid circular dependencies.
4. Side-effect wiring should be isolated at composition boundaries.
5. Prefer explicit interfaces between concerns.
