# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version  | Supported          |
| -------- | ------------------ |
| Latest   | :white_check_mark: |
| < Latest | :x:                |

## Reporting a Vulnerability

We take the security of Henk seriously. If you discover a security vulnerability, please follow these steps:

### Do Not

- Do not open a public issue
- Do not share the vulnerability publicly until it has been addressed

### Do

1. **Email us directly** at security@callhenk.com with:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

2. **Wait for acknowledgment** - We will respond within 48 hours

3. **Allow time for a fix** - We will work to address the issue promptly

### What to Expect

- Acknowledgment of your report within 48 hours
- Regular updates on the progress of the fix
- Credit for responsible disclosure (unless you prefer to remain anonymous)
- A timeline for public disclosure

## Security Best Practices

When contributing to Henk:

### Environment Variables

- Never commit `.env.local` or `.env.test` files
- Use environment variables for all secrets
- Only expose `NEXT_PUBLIC_*` variables to the client

### Authentication

- Always verify authentication in protected routes
- Use Row Level Security (RLS) in Supabase
- Never bypass RLS policies
- Validate all user inputs

### Database

- Use parameterized queries
- Implement proper access controls
- Encrypt sensitive data
- Follow the principle of least privilege

### API Security

- Implement rate limiting
- Validate all inputs
- Use CORS appropriately
- Never expose sensitive information in error messages

### Dependencies

- Keep dependencies up to date
- Review security advisories regularly
- Use `pnpm audit` to check for vulnerabilities

## Security Features

Henk implements several security measures:

- Pre-commit hooks for secret detection
- Row Level Security (RLS) for database access
- Multi-tenant data isolation
- Encrypted credential storage
- Rate limiting on sensitive operations
- CSRF protection
- Input validation with Zod schemas

## Disclosure Policy

When a security vulnerability is reported and fixed:

1. We will notify affected users privately
2. We will release a patch version
3. We will publish a security advisory
4. We will credit the reporter (if they wish)

## Contact

For security concerns, contact: security@callhenk.com

For general questions, use GitHub issues or discussions.
