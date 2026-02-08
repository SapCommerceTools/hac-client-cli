"""HAC Client CLI application.

Thin adapter over hac-client-core for basic HAC operations.
"""

from __future__ import annotations

import sys
import json
import typer
from pathlib import Path
from typing import Optional

from hac_client_cli.environment_manager import EnvironmentManager
from hac_client_cli.commands_env import env_app
from hac_client_cli.commands_endpoint import app as endpoint_app
from hac_client_cli.commands_session import session_app
from hac_client_cli.commands_update import update_app
from hac_client_core.client import HacClient, HacClientError
from hac_client_core.auth import BasicAuthHandler

app = typer.Typer(
    help="SAP Commerce HAC client",
    no_args_is_help=True,
    add_completion=False
)

# Add environment, endpoint, and session management
app.add_typer(env_app, name="env")
app.add_typer(endpoint_app, name="endpoint")
app.add_typer(session_app, name="session")
app.add_typer(update_app, name="update")


def create_client(environment: Optional[str] = None, endpoint: Optional[str] = None, quiet: bool = False) -> HacClient:
    """Create HAC client from configuration.
    
    Requires an active session. Use 'hac session start' to create one.
    
    Args:
        environment: Environment name (uses default if None)
        endpoint: Endpoint name (uses environment default if None)
        quiet: Suppress informational messages
        
    Returns:
        Configured HacClient instance
    """
    from hac_client_core.session import SessionManager
    from hac_client_cli.config_loader import get_endpoint_config
    
    # Get endpoint configuration
    env_name, endpoint_name, ep_config = get_endpoint_config(environment, endpoint)
    
    # Create session identifier
    session_id = f"{env_name}/{endpoint_name}"
    
    # Check for existing session
    # Note: We need to find a session for this endpoint, but we don't know the username yet
    # Sessions are keyed by (base_url, username, environment), so we need to list all sessions
    session_manager = SessionManager()
    all_sessions = session_manager.list_sessions()
    
    # Find a session for this endpoint
    # Normalize URLs for comparison (remove trailing slashes)
    config_url_normalized = ep_config.url.rstrip('/')
    session = None
    for s in all_sessions:
        session_url_normalized = s.base_url.rstrip('/')
        if s.environment == session_id and session_url_normalized == config_url_normalized:
            session = s
            break
    
    if not session:
        print(f"ERROR: No active session for '{session_id}'", file=sys.stderr)
        print(f"\nStart a session:", file=sys.stderr)
        print(f"  hac session start {env_name} --endpoint {endpoint_name} --username <user>", file=sys.stderr)
        print(f"\nOr import existing session:", file=sys.stderr)
        print(f"  hac session import {env_name} --endpoint {endpoint_name} --username <user> --session-id <id> --csrf-token <token>", file=sys.stderr)
        raise typer.Exit(1)
    
    # Create client with existing session (no auto-login)
    # We need a dummy password since BasicAuthHandler requires it, but it won't be used
    auth = BasicAuthHandler(session.username, "dummy")
    
    client = HacClient(
        base_url=ep_config.url,
        auth_handler=auth,
        environment=session_id,  # Use composite key
        timeout=ep_config.timeout,
        ignore_ssl=ep_config.ignore_ssl,
        session_persistence=True,
        quiet=quiet
    )
    
    # Manually set session info from loaded session
    from hac_client_core.models import SessionInfo
    client.session_info = SessionInfo(
        session_id=session.session_id,
        csrf_token=session.csrf_token,
        route_cookie=session.route_cookie,
        is_authenticated=session.is_authenticated
    )
    
    # Also set cookies in the http_session so they're sent with requests
    # Extract domain from base URL
    from urllib.parse import urlparse
    parsed_url = urlparse(ep_config.url)
    domain = parsed_url.hostname
    
    client.http_session.cookies.set('JSESSIONID', session.session_id, domain=domain, path='/')
    if session.route_cookie:
        # Extract value from "ROUTE=value" format
        route_value = session.route_cookie.split('=', 1)[1] if '=' in session.route_cookie else session.route_cookie
        client.http_session.cookies.set('ROUTE', route_value, domain=domain, path='/')
    
    return client


@app.command("groovy")
def groovy_command(
    script: str = typer.Argument(..., help="Groovy script or path to .groovy file"),
    file: bool = typer.Option(False, "--file", "-f", help="Treat script as file path"),
    commit: bool = typer.Option(False, "--commit", "-c", help="Enable commit mode"),
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress informational messages")
):
    """Execute Groovy script in HAC."""
    try:
        # Read script from file if needed
        script_content = script
        if file or script.endswith('.groovy'):
            script_path = Path(script)
            if not script_path.exists():
                print(f"ERROR: Script file not found: {script}", file=sys.stderr)
                raise typer.Exit(1)
            script_content = script_path.read_text()
        
        # Create client and execute
        client = create_client(environment, endpoint, quiet)
        result = client.execute_groovy(script_content, commit=commit)
        
        if not result.success:
            print(f"ERROR: Script execution failed\n{result.stacktrace_text}", file=sys.stderr)
            raise typer.Exit(1)
        
        if json_output:
            output = {
                "success": result.success,
                "output_text": result.output_text,
                "execution_result": result.execution_result,
                "commit_mode": result.commit_mode,
                "execution_time_ms": result.execution_time_ms
            }
            print(json.dumps(output, indent=2))
        else:
            # Print script output to stderr, result to stdout
            if result.output_text:
                print(result.output_text, file=sys.stderr)
            print(result.execution_result)
            
    except HacClientError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@app.command("flexsearch")
def flexsearch_command(
    query: str = typer.Argument(..., help="FlexibleSearch query"),
    max_count: int = typer.Option(200, "--max-count", "-m", help="Maximum number of results"),
    locale: str = typer.Option("en", "--locale", "-l", help="Locale for the query"),
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    csv: bool = typer.Option(False, "--csv", help="Output as CSV"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress informational messages")
):
    """Execute FlexibleSearch query in HAC."""
    try:
        client = create_client(environment, endpoint, quiet)
        result = client.execute_flexiblesearch(query, max_count=max_count, locale=locale)
        
        if not result.success:
            print(f"ERROR: Query failed\n{result.exception}", file=sys.stderr)
            raise typer.Exit(1)
        
        if json_output:
            output = {
                "success": result.success,
                "headers": result.headers,
                "rows": result.rows,
                "result_count": result.result_count,
                "execution_time_ms": result.execution_time_ms
            }
            print(json.dumps(output, indent=2))
        elif csv:
            # Output as CSV
            if result.headers:
                print(",".join(result.headers))
            for row in result.rows:
                print(",".join(str(cell) for cell in row))
        else:
            # Human-readable table format
            if result.headers:
                print("\t".join(result.headers))
            for row in result.rows:
                print("\t".join(str(cell) for cell in row))
            
            if not quiet:
                print(f"\n{result.result_count} results", file=sys.stderr)
            
    except HacClientError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@app.command("impex")
def impex_command(
    file: Path = typer.Option(..., "--file", "-f", help="Impex file to import"),
    validation: str = typer.Option("import_strict", "--validation", "-v", help="Validation mode (import_strict, import_relaxed, strict, relaxed)"),
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress informational messages")
):
    """Import Impex data in HAC."""
    try:
        if not file.exists():
            print(f"ERROR: Impex file not found: {file}", file=sys.stderr)
            raise typer.Exit(1)
        
        impex_content = file.read_text()
        
        client = create_client(environment, endpoint, quiet)
        result = client.import_impex(impex_content, validation_mode=validation)
        
        if not result.success:
            print(f"ERROR: Impex import failed\n{result.error}", file=sys.stderr)
            raise typer.Exit(1)
        
        if json_output:
            output = {
                "success": result.success,
                "output": result.output,
                "validation_errors": result.validation_errors
            }
            print(json.dumps(output, indent=2))
        else:
            print(result.output)
            
    except HacClientError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@app.command("config")
def config_command(
    list_environments: bool = typer.Option(False, "--list", "-l", help="List configured environments"),
    validate: bool = typer.Option(False, "--validate", "-v", help="Validate configuration"),
    show_path: bool = typer.Option(False, "--path", "-p", help="Show config file path"),
    show_example: bool = typer.Option(False, "--example", "-x", help="Show example configuration"),
    environment: Optional[str] = typer.Option(None, "--env", "-e", help="Show specific environment"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """Discover, inspect, and manage HAC client configuration.
    
    Examples:
        hac config                  # Show all configuration
        hac config -l               # List environments
        hac config -e local         # Show specific environment
        hac config -v               # Validate configuration
        hac config -p               # Show config file path
        hac config -x               # Show example config
    """
    from hac_client_cli.config_loader import get_config_path, load_config
    
    config_path = get_config_path()
    
    # Show path only
    if show_path:
        if json_output:
            print(json.dumps({"config_path": str(config_path), "exists": config_path.exists()}, indent=2))
        else:
            print(f"Configuration file: {config_path}")
            print(f"Status: {'exists' if config_path.exists() else 'not found'}")
        return
    
    # Show example
    if show_example:
        print("""# HAC Client Configuration
# Save to: ~/.config/hac-client/config.toml
# Or set: export HAC_CLIENT_CONFIG_PATH=/path/to/config.toml

# Default environment to use
default_environment = "local"

# Environment definitions
[environments.local]
url = "https://localhost:9002"
username = "admin"
# password = "nimda"  # Or use HAC_PASSWORD env var
ignore_ssl = true
timeout = 30

[environments.dev]
url = "https://dev.example.com"
username = "admin"
# Password from HAC_PASSWORD_DEV or HAC_PASSWORD env var
ignore_ssl = false
timeout = 60

[environments.prod]
url = "https://prod.example.com"
username = "admin"
# ALWAYS use env var for prod: HAC_PASSWORD_PROD
ignore_ssl = false
timeout = 120
""")
        return
    
    # Load and validate config
    try:
        config = load_config()
        
        # Validate mode
        if validate:
            issues = []
            
            # Check if config file exists
            if not config_path.exists():
                issues.append("Configuration file does not exist")
            
            # Check if we have environments
            if not config.environments:
                issues.append("No environments configured")
            
            # Check default environment exists
            if config.default_environment not in config.environments:
                issues.append(f"Default environment '{config.default_environment}' not found in configured environments")
            
            # Check each environment
            for name, env in config.environments.items():
                if not env.password:
                    issues.append(f"Environment '{name}': password not configured (set in config or HAC_PASSWORD_{name.upper()} env var)")
                if not env.url.startswith('http'):
                    issues.append(f"Environment '{name}': URL should start with http:// or https://")
            
            if json_output:
                print(json.dumps({"valid": len(issues) == 0, "issues": issues}, indent=2))
            else:
                if issues:
                    print("❌ Configuration has issues:\n")
                    for issue in issues:
                        print(f"  - {issue}")
                    print(f"\nConfiguration file: {config_path}")
                    print("Run 'hac config --example' to see example configuration")
                    raise typer.Exit(1)
                else:
                    print("✅ Configuration is valid")
                    print(f"  - {len(config.environments)} environment(s) configured")
                    print(f"  - Default: {config.default_environment}")
            return
        
        # Show specific environment
        if environment:
            if environment not in config.environments:
                print(f"ERROR: Environment '{environment}' not found", file=sys.stderr)
                print("\nAvailable environments:", file=sys.stderr)
                for env_name in config.environments:
                    marker = " (default)" if env_name == config.default_environment else ""
                    print(f"  - {env_name}{marker}", file=sys.stderr)
                raise typer.Exit(1)
            
            env = config.environments[environment]
            if json_output:
                output = {
                    "name": environment,
                    "url": env.url,
                    "username": env.username,
                    "password_configured": env.password is not None,
                    "ignore_ssl": env.ignore_ssl,
                    "timeout": env.timeout,
                    "is_default": environment == config.default_environment
                }
                print(json.dumps(output, indent=2))
            else:
                marker = " (default)" if environment == config.default_environment else ""
                print(f"Environment: {environment}{marker}")
                print(f"  URL: {env.url}")
                print(f"  Username: {env.username}")
                print(f"  Password: {'✓ configured' if env.password else '✗ NOT configured'}")
                print(f"  Ignore SSL: {env.ignore_ssl}")
                print(f"  Timeout: {env.timeout}s")
            return
        
        # List environments
        if list_environments:
            if json_output:
                envs = list(config.environments.keys())
                print(json.dumps({"environments": envs, "default": config.default_environment}, indent=2))
            else:
                print("Configured environments:")
                for env_name in sorted(config.environments.keys()):
                    marker = " (default)" if env_name == config.default_environment else ""
                    print(f"  - {env_name}{marker}")
            return
        
        # Show full config (default)
        if json_output:
            output = {
                "config_path": str(config_path),
                "default_environment": config.default_environment,
                "environments": {
                    name: {
                        "url": env.url,
                        "username": env.username,
                        "password_configured": env.password is not None,
                        "ignore_ssl": env.ignore_ssl,
                        "timeout": env.timeout
                    }
                    for name, env in config.environments.items()
                }
            }
            print(json.dumps(output, indent=2))
        else:
            print(f"Configuration file: {config_path}")
            print(f"Status: {'✓ exists' if config_path.exists() else '✗ not found (using defaults)'}")
            print(f"\nDefault environment: {config.default_environment}")
            print(f"\nEnvironments ({len(config.environments)}):")
            for name in sorted(config.environments.keys()):
                env = config.environments[name]
                marker = " ← default" if name == config.default_environment else ""
                pwd_status = "✓" if env.password else "✗"
                print(f"  {name}{marker}")
                print(f"    URL: {env.url}")
                print(f"    Username: {env.username}")
                print(f"    Password: {pwd_status}")
                print(f"    SSL: {'ignore' if env.ignore_ssl else 'verify'}")
            
            print("\nCommands:")
            print("  hac config -l          # List environments")
            print("  hac config -e local    # Show environment details")
            print("  hac config -v          # Validate configuration")
            print("  hac config -x          # Show example config")
    
    except ValueError as e:
        print(f"ERROR: Configuration validation failed", file=sys.stderr)
        print(f"  {e}", file=sys.stderr)
        print(f"\nConfiguration file: {config_path}", file=sys.stderr)
        print("\nRun 'hac config --example' to see correct format", file=sys.stderr)
        raise typer.Exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


def main():
    """Entry point for the HAC client CLI."""
    app()


if __name__ == "__main__":
    main()

