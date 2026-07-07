# Contributing to Temporary Email Service

Thank you for considering contributing to this project. This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Process](#development-process)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing Requirements](#testing-requirements)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- pnpm 8.0.0 or higher
- Git

### Setup Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/temp-mail.git
   cd temp-mail
   ```

3. Set up backend:
   ```bash
   cd backend
   pnpm install
   cp .env.example .env
   # Edit .env with your local configuration
   pnpm prisma:generate
   pnpm prisma migrate dev
   ```

4. Set up frontend:
   ```bash
   cd frontend
   pnpm install
   cp .env.example .env.local
   # Edit .env.local with your local configuration
   ```

5. Start development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend && pnpm dev
   
   # Terminal 2 - Frontend
   cd frontend && pnpm dev
   ```

## Development Process

### Branch Naming

Use descriptive branch names with prefixes:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Maintenance tasks

Examples:
- `feature/add-email-forwarding`
- `fix/rate-limit-bypass`
- `docs/update-api-documentation`

### Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following coding standards

3. Test your changes thoroughly

4. Commit your changes with descriptive messages

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Create a pull request

## Pull Request Process

### Before Submitting

1. **Update Documentation**: Update README.md and other docs if needed
2. **Add Tests**: Include tests for new functionality
3. **Run Linting**: Ensure code passes linting
   ```bash
   # Backend
   cd backend && pnpm build
   
   # Frontend
   cd frontend && pnpm lint
   ```
4. **Test Locally**: Verify all functionality works
5. **Update CHANGELOG**: Document your changes

### Pull Request Template

When creating a pull request, include:

**Description**
- Clear description of changes
- Motivation and context
- Related issue numbers

**Type of Change**
- [ ] Bug fix (non-breaking change fixing an issue)
- [ ] New feature (non-breaking change adding functionality)
- [ ] Breaking change (fix or feature causing existing functionality to not work)
- [ ] Documentation update

**Testing**
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed
- [ ] All tests pass locally

**Checklist**
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added proving fix/feature works
- [ ] Dependent changes merged

### Review Process

1. Maintainers will review your pull request
2. Address any requested changes
3. Once approved, maintainers will merge

## Coding Standards

### TypeScript

- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Use interfaces for object shapes
- Document public APIs with JSDoc

### Code Style

**Backend**
- Follow Node.js best practices
- Use async/await over callbacks
- Handle errors appropriately
- Log meaningful messages

**Frontend**
- Use React functional components
- Implement proper error boundaries
- Follow Next.js conventions
- Optimize for performance

### File Organization

- Keep files under 300 lines
- One component per file (frontend)
- Logical folder structure
- Descriptive file names

### Naming Conventions

- **Variables**: camelCase (`userEmail`, `messageCount`)
- **Constants**: UPPER_SNAKE_CASE (`API_PORT`, `MAX_RETRIES`)
- **Functions**: camelCase (`getUserMessages`, `validateEmail`)
- **Classes**: PascalCase (`EmailService`, `MessageParser`)
- **Interfaces/Types**: PascalCase (`User`, `Message`)
- **Files**: kebab-case (`user-service.ts`, `api-client.ts`)

## Commit Message Guidelines

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons)
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

### Examples

```
feat(api): add email forwarding endpoint

Implement POST /api/forward endpoint to forward emails
to external addresses with rate limiting.

Closes #123
```

```
fix(smtp): prevent relay abuse

Add stricter domain validation to prevent open relay.
Now validates both sender and recipient domains.

Fixes #456
```

## Testing Requirements

### Backend Testing

- Unit tests for business logic
- Integration tests for API endpoints
- SMTP flow testing
- Database operation testing

Run tests:
```bash
cd backend
pnpm test
```

### Frontend Testing

- Component testing (when implemented)
- Integration testing
- E2E testing for critical flows

Run tests:
```bash
cd frontend
pnpm test
```

### Test Coverage

- Aim for 80%+ code coverage
- All new features must include tests
- Bug fixes should include regression tests

## Documentation

### Code Documentation

- Add JSDoc comments for public functions
- Include parameter descriptions
- Document return types
- Provide usage examples

### README Updates

- Update features list
- Document new API endpoints
- Update configuration options
- Add migration guides for breaking changes

## Questions or Issues?

- Open an issue for bugs or feature requests
- Use discussions for questions
- Contact maintainers for sensitive topics

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to this project!
