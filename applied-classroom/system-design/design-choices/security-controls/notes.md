# Security controls

Treat security as an **architecture characteristic** (**Fundamentals of Software Architecture, 2nd Edition**). Practical controls show up across Xu designs: rate limits, authn/z, least privilege, encryption in transit.

## Baseline checklist

- TLS everywhere
- Authn + authz on sensitive APIs
- Rate limit abuse paths
- Secrets not in source / client code
- Audit logs for sensitive actions
