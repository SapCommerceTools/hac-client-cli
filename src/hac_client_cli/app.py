"""HAC Client CLI application.

Thin adapter over hac-client-core for basic HAC operations.
"""

from __future__ import annotations

import sys
import json
import typer
from pathlib import Path
from typing import Optional

from hac_client_cli.config_loader import load_config, get_environment_config
from hac_client_core.client import HacClient, HacClientError
from hac_client_core.auth import BasicAuthHandler

app = typer.Typer(
    help="SAP Commerce HAC client",
    no_args_is_help=True,
    add_completion=False
)


def create_client(environment: Optional[str] = None, quiet: bool = False) -> HacClient:
    """Create HAC client from configuration.
    
    Args:
        environment: Environment name (uses default if None)
        quiet: Suppress informational messages
        
    Returns:
        Configured HacClient instance
    """
    env_config = get_environment_config(environment)
    
    if not env_config.password:
        print("ERROR: Password not configured. Set in config file or HAC_PASSWORD env var.", file=sys.stderr)
        raise typer.Exit(1)
    
    auth = BasicAuthHandler(env_config.username, env_config.password)
    
    return HacClient(
        base_url=env_config.url,
        auth_handler=auth,
        environment=environment or "default",
        timeout=env_config.timeout,
        ignore_ssl=env_config.ignore_ssl,
        session_persistence=True,
        quiet=quiet
    )


@app.command("groovy")
def groovy_command(
    script: str = typer.Argument(..., help="Groovy script or path to .groovy file"),
    file: bool = typer.Option(False, "--file", "-f", help="Treat script as file path"),
    commit: bool = typer.Option(False, "--commit", "-c", help="Enable commit mode"),
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
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
        client = create_client(environment, quiet)
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
    csv: bool = typer.Option(False, "--csv", help="Output as CSV"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress informational messages")
):
    """Execute FlexibleSearch query in HAC."""
    try:
        client = create_client(environment, quiet)
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
    validation: str = typer.Option("strict", "--validation", "-v", help="Validation mode (strict, relaxed, import_relaxed)"),
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress informational messages")
):
    """Import Impex data in HAC."""
    try:
        if not file.exists():
            print(f"ERROR: Impex file not found: {file}", file=sys.stderr)
            raise typer.Exit(1)
        
        impex_content = file.read_text()
        
        client = create_client(environment, quiet)
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
    list_environments: bool = typer.Option(False, "--list-environments", "-l", help="List configured environments"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """Show HAC client configuration."""
    try:
        config = load_config()
        
        if list_environments:
            if json_output:
                envs = list(config.environments.keys())
                print(json.dumps({"environments": envs, "default": config.default_environment}, indent=2))
            else:
                print("Configured environments:")
                for env_name in config.environments:
                    marker = " (default)" if env_name == config.default_environment else ""
                    print(f"  - {env_name}{marker}")
        else:
            # Show full config (without passwords)
            if json_output:
                output = {
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
                from hac_client_cli.config_loader import get_config_path
                print(f"Configuration file: {get_config_path()}")
                print(f"Default environment: {config.default_environment}")
                print("\nEnvironments:")
                for name, env in config.environments.items():
                    print(f"\n  [{name}]")
                    print(f"    URL: {env.url}")
                    print(f"    Username: {env.username}")
                    print(f"    Password: {'configured' if env.password else 'NOT configured'}")
                    print(f"    Ignore SSL: {env.ignore_ssl}")
                    print(f"    Timeout: {env.timeout}s")
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


def main():
    """Entry point for the HAC client CLI."""
    app()


if __name__ == "__main__":
    main()

