# LabelLedger Demo Rubric — Intent Disputes

This public fixture rubric exists for development and review of LabelLedger. A real deployment should bind a commit-pinned or otherwise immutable copy and register the SHA-256 digest of the exact bytes validators fetch.

## PAYMENT_DISPUTE
Use when the core complaint is a payment, billing, charge, refund, or transfer failure. Payment being mentioned is not enough if the actual disputed obligation is non-delivery.

## DELIVERY_DISPUTE
Use when a paid good, service, file, appointment, shipment, or promised work was not delivered or completed as promised. This includes a service marked complete when the buyer did not receive the promised output.

## IDENTITY_DISPUTE
Use when identity, impersonation, account ownership, unauthorized identity change, recovery destination, or conflicting ownership claims are the core issue.

## Boundary rule
Classify the primary failed obligation, not incidental vocabulary. If the available facts do not establish which of the allowed labels governs, abstain rather than inventing a label or forcing a weak match.
