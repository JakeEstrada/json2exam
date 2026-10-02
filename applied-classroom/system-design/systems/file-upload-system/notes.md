# File upload / cloud drive

Inspired by **System Design Interview - An Insider's Guide** Chapter 15 (Google Drive) themes + Ch 1 CDN/object storage intuition.

## Problems to name

- Large files, resumable upload
- Metadata DB vs blob/object storage
- Dedup / sync / sharing ACLs
- CDN for downloads; encryption

Even a “simple upload” is a system: API → auth → object store → metadata → processing queue (virus scan, thumbnails).
