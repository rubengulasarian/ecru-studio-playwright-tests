# Defect catalog → automated tests

Defect IDs come from the manual testing portfolio ([ecru-studio-qa](https://github.com/rubengulasarian/ecru-studio-qa)). Tests marked `@known-bug` assert the correct behaviour and are expected to fail while the defect exists.

| ID | Area | Expected behaviour (asserted) | Test file |
|----|------|-------------------------------|-----------|
| F1 | Header | Cart badge updates right after "Add to cart" | cart.spec.ts |
| F2 | Cart | "Clear cart" removes every item | cart.spec.ts |
| F3 | Shop | Search is case-insensitive | catalog.spec.ts |
| F4 | Shop | Price range survives a category change | catalog.spec.ts |
| F5 | Shop | Wishlist selection persists after reload | catalog.spec.ts |
| F6 | Product | Quantity cannot drop below 1 | product.spec.ts |
| L1 | Cart | Negative quantity never gives a negative total | cart.spec.ts |
| L2 | Cart | Promo code applies once, no stacking | cart.spec.ts |
| L3 | Cart, Checkout | Free shipping above $80, fee below | cart.spec.ts, checkout.spec.ts |
| L6 | Checkout | Empty order cannot be paid | checkout.spec.ts |
| L7a | Sign up | Password and confirmation must match | auth.spec.ts |
| L7b | Sign up | Email can be registered only once | auth.spec.ts |
| L7c | Log in | Wrong password is rejected | auth.spec.ts |
| L8 | Checkout | Card number format and expiry are validated | checkout.spec.ts |
| H1 | Checkout | Email and phone formats are validated | checkout.spec.ts |
| H2 | Account | Header shows the updated name after a profile save | auth.spec.ts |
| H3 | Checkout | Wallet → Card re-validates the card fields | checkout.spec.ts |
| H4 | Product | Empty quantity never renders `$NaN` | product.spec.ts |
| H5 | Shop | Min price filter is inclusive | catalog.spec.ts |
| V3 | Shop | Product images have alternative text | catalog.spec.ts |
| X1 | Cart | "Promo applied" confirmation stays visible (found while automating, not in the original catalog) | cart.spec.ts |

## Not automated (yet)

- **V1, V2, V4, V5, V6** — layout and contrast defects; need visual (screenshot) regression tests.
- **L4** — no upper limit for quantity (no specified limit to assert against).
