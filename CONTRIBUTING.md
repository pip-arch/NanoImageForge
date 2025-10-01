# Contributing to NanoImageForge

Thank you for your interest in contributing to NanoImageForge! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL database
- Git
- Basic knowledge of React, TypeScript, and Express.js

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/NanoImageForge.git
   cd NanoImageForge
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Database Setup**
   ```bash
   npm run db:push
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: All new code should be written in TypeScript
- **ESLint**: Follow the existing ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming**: Use descriptive variable and function names

### Component Guidelines

- **React Components**: Use functional components with hooks
- **Props**: Define proper TypeScript interfaces for all props
- **Styling**: Use TailwindCSS classes, follow existing patterns
- **Accessibility**: Ensure components are accessible (use shadcn/ui when possible)

### API Guidelines

- **RESTful**: Follow REST conventions for API endpoints
- **Validation**: Use Zod schemas for request/response validation
- **Error Handling**: Implement proper error handling and logging
- **Authentication**: Ensure proper authentication for protected routes

## 🔧 Project Structure

```
NanoImageForge/
├── client/src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components (routes)
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utilities and API clients
│   └── types/         # TypeScript type definitions
├── server/
│   ├── routes.ts      # API route handlers
│   ├── storage.ts     # Database operations
│   ├── objectStorage.ts # File storage operations
│   └── middleware/    # Express middleware
├── shared/
│   └── schema.ts      # Shared schemas and types
└── docs/              # Documentation
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node.js version, browser (if applicable)
6. **Screenshots**: If applicable

### Bug Report Template

```markdown
**Bug Description**
A clear and concise description of the bug.

**To Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
A clear description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- OS: [e.g. Windows 10, macOS 12.0]
- Node.js: [e.g. 18.17.0]
- Browser: [e.g. Chrome 91.0] (if applicable)
```

## ✨ Feature Requests

When suggesting new features:

1. **Use Case**: Describe the problem this feature would solve
2. **Proposed Solution**: Your suggested approach
3. **Alternatives**: Alternative solutions you've considered
4. **Implementation**: Any thoughts on implementation approach

## 🔄 Pull Request Process

### Before Submitting

1. **Issue First**: For major changes, create an issue first to discuss
2. **Branch**: Create a feature branch from `main`
3. **Tests**: Add tests for new functionality
4. **Documentation**: Update documentation as needed
5. **Lint**: Ensure code passes linting checks

### Pull Request Guidelines

1. **Title**: Use a descriptive title
2. **Description**: Clearly describe the changes
3. **Link Issues**: Reference related issues
4. **Screenshots**: Include screenshots for UI changes
5. **Testing**: Describe how you tested the changes

### PR Template

```markdown
## Description
Brief description of the changes.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## How Has This Been Tested?
Describe the tests that you ran to verify your changes.

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] Any dependent changes have been merged and published
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows

### Test Guidelines

- Write descriptive test names
- Test both success and error cases
- Mock external dependencies
- Keep tests focused and isolated

## 📚 Documentation

### Code Documentation

- **JSDoc**: Use JSDoc comments for functions and classes
- **README**: Update README.md for significant changes
- **API Docs**: Document API endpoints and schemas
- **Component Docs**: Document component props and usage

### Documentation Standards

- Clear and concise explanations
- Code examples where helpful
- Keep documentation up to date with code changes

## 🏷️ Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(editor): add batch processing support

Add ability to process multiple images simultaneously
with progress tracking and error handling.

Closes #123
```

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different viewpoints and experiences

### Communication

- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Pull Requests**: Use PR comments for code review feedback

## 🔒 Security

### Reporting Security Issues

Please do not report security vulnerabilities through public GitHub issues. Instead:

1. Email security concerns to [security@example.com]
2. Include detailed information about the vulnerability
3. Allow reasonable time for response before public disclosure

### Security Guidelines

- Never commit sensitive information (API keys, passwords, etc.)
- Use environment variables for configuration
- Follow secure coding practices
- Keep dependencies up to date

## 📄 License

By contributing to NanoImageForge, you agree that your contributions will be licensed under the MIT License.

## ❓ Questions?

If you have questions about contributing:

1. Check existing issues and discussions
2. Create a new discussion for general questions
3. Create an issue for specific problems
4. Reach out to maintainers if needed

Thank you for contributing to NanoImageForge! 🎨

