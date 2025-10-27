# CI/CD Environment Configuration

## Performance Optimizations for GitHub Actions

### Browser Installation
- Install only required browsers per matrix job
- Use `--with-deps` for full system dependencies
- Cache browser installations when possible

### Test Execution
- Use 2 workers in CI for better performance
- 3 retries for flaky test handling
- Extended timeouts for network operations

### Reporting
- GitHub Actions native reporter enabled
- HTML reports with `open: never` for CI
- Multiple output formats (HTML, JSON, JUnit)

### Environment Variables
```bash
CI=true
PLAYWRIGHT_BROWSERS_PATH=0
NODE_ENV=test
```

### Resource Limits
- Job timeout: 60 minutes
- Individual test timeout: 30 seconds
- Navigation timeout: 30 seconds
- Action timeout: 30 seconds
```