# establish release verification gate

Run repository CI, record the tested SHA, verify browser-to-API requests and persistence after restart. Record webhook delivery separately. Do not label a release verified until all required checks pass.

Record observed results separately; this document does not certify that checks have passed.
