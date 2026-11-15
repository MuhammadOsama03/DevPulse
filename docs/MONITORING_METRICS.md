# Monitoring metrics

Real check results should include target, observation time, success/failure, and latency when measurable.

- **Success rate**: passing observations divided by all observations in the selected window. No observations means no percentage.
- **Average latency**: arithmetic mean of valid measured latencies, excluding missing values.
- **Consecutive failures**: a configurable threshold used to propose an alert, not proof of an outage.

Sample/demo data must never be mixed into real monitoring aggregates. These utilities do not by themselves schedule probes, persist checks, or send alerts.
