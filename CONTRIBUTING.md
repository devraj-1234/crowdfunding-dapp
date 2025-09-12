# Contributing to HeartFund

Thank you for considering contributing to HeartFund! This document provides guidelines and instructions to help you get started.

## Code of Conduct

By participating in this project, you agree to abide by its terms and to treat all contributors with respect.

## How Can I Contribute?

### Reporting Bugs

- Check if the bug has already been reported in the Issues section
- Use the bug report template when creating a new issue
- Include detailed steps to reproduce the bug
- Add screenshots if applicable

### Suggesting Features

- Check if the feature has already been suggested in the Issues section
- Use the feature request template
- Describe the feature in detail and explain why it would be valuable

### Pull Requests

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Write and test your code changes
4. Ensure your code follows our style guidelines
5. Commit your changes: `git commit -m 'Add some amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Development Setup

1. Clone the repository

```bash
git clone https://github.com/devraj-1234/crowdfunding-dapp.git
cd crowdfunding-dapp
```

2. Install dependencies

```bash
npm install
```

3. Create an `.env.local` file with your own Firebase credentials

```
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id

NEXT_PUBLIC_CONTRACT_ADDRESS=your_deployed_contract_address
```

4. Start the development server

```bash
npm run dev
```

## Style Guidelines

### JavaScript/TypeScript

- Use TypeScript for new components
- Follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- Use functional components with hooks instead of class components

### CSS/Styling

- Use TailwindCSS classes when possible
- For custom styles, use CSS modules or styled-components

## Git Workflow

- Create a branch for each feature or fix
- Use descriptive branch names prefixed with `feature/` or `fix/`
- Keep commits small and focused
- Write clear commit messages that explain WHY the change was made

## Testing

- Write tests for new features using Jest and React Testing Library
- Run tests before submitting a pull request
- Ensure all existing tests pass

## Documentation

- Update README.md with details of changes to the interface
- Update or create documentation for new features
- Comment your code when necessary

## Questions?

Feel free to open an issue with your question or contact the maintainers directly.

Thank you for contributing to HeartFund!
