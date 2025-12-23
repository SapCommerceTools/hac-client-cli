"""Endpoint management commands for HAC client CLI."""

import sys
import json
import typer
from typing import Optional
from rich.console import Console
from rich.table import Table

from .environment_manager import EnvironmentManager
from .config_loader import get_config_path


app = typer.Typer(help="Manage HAC endpoints")
console = Console()


@app.command("list")
def list_endpoints(
    environment: str = typer.Argument(..., help="Environment name"),
    format: str = typer.Option("table", "--format", "-f", help="Output format: table, json"),
    no_headers: bool = typer.Option(False, "--no-headers", help="Suppress column headers"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Minimal output (names only)")
):
    """List all endpoints in an environment."""
    manager = EnvironmentManager(get_config_path())
    
    try:
        endpoints = manager.list_endpoints(environment)
        env = manager.get_environment(environment)
        
        if not endpoints:
            if format != "json":
                console.print(f"[yellow]No endpoints configured for environment '{environment}'[/yellow]")
            else:
                print("[]")
            return
        
        # JSON output
        if format == "json":
            output = [
                {
                    "name": ep.name,
                    "url": ep.url,
                    "ignore_ssl": ep.ignore_ssl,
                    "timeout": ep.timeout,
                    "is_default": env and ep.name == env.default_endpoint
                }
                for ep in endpoints
            ]
            print(json.dumps(output, indent=2))
            return
        
        # Quiet output (names only)
        if quiet:
            for ep in endpoints:
                print(ep.name)
            return
        
        # Table format (default)
        table = Table(show_header=not no_headers)
        table.add_column("NAME", style="cyan")
        table.add_column("URL")
        table.add_column("SSL")
        table.add_column("TIMEOUT", justify="right")
        table.add_column("DEFAULT", justify="center")
        
        for endpoint in endpoints:
            default_marker = "✓" if env and endpoint.name == env.default_endpoint else ""
            ssl_status = "[yellow]ignore[/yellow]" if endpoint.ignore_ssl else "[green]verify[/green]"
            
            table.add_row(
                endpoint.name,
                endpoint.url,
                ssl_status,
                f"{endpoint.timeout}s",
                default_marker
            )
        
        console.print(table)
    
    except ValueError as e:
        console.print(f"[red]ERROR: {e}[/red]", file=sys.stderr)
        raise typer.Exit(1)


@app.command("show")
def show_endpoint(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: str = typer.Argument(..., help="Endpoint name")
):
    """Show details of a specific endpoint."""
    manager = EnvironmentManager(get_config_path())
    
    ep = manager.get_endpoint(environment, endpoint)
    
    if not ep:
        print(f"ERROR: Endpoint '{endpoint}' not found in environment '{environment}'")
        raise typer.Exit(1)
    
    env = manager.get_environment(environment)
    is_default = env and ep.name == env.default_endpoint
    
    print(f"Endpoint: {environment}/{endpoint}")
    if is_default:
        print("Status: default")
    print()
    print(f"URL:        {ep.url}")
    print(f"Ignore SSL: {ep.ignore_ssl}")
    print(f"Timeout:    {ep.timeout}s")


@app.command("add")
def add_endpoint(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: str = typer.Argument(..., help="Endpoint name"),
    url: str = typer.Option(..., "--url", "-u", help="HAC base URL"),
    ignore_ssl: bool = typer.Option(False, "--ignore-ssl", help="Ignore SSL certificate errors"),
    timeout: int = typer.Option(30, "--timeout", help="HTTP timeout in seconds"),
    set_default: bool = typer.Option(False, "--set-default", help="Set as default endpoint")
):
    """Add a new endpoint to an environment.
    
    Note: Username is provided during session creation, not endpoint configuration.
    An endpoint is just infrastructure (URL, connection settings).
    """
    manager = EnvironmentManager(get_config_path())
    
    try:
        manager.add_endpoint(
            env_name=environment,
            endpoint_name=endpoint,
            url=url,
            ignore_ssl=ignore_ssl,
            timeout=timeout,
            set_default=set_default
        )
        
        default_msg = " (set as default)" if set_default else ""
        print(f"✓ Added endpoint '{endpoint}' to environment '{environment}'{default_msg}")
        print(f"\nStart session: hac session start {environment} --endpoint {endpoint} --username <user>")
    
    except ValueError as e:
        print(f"ERROR: {e}")
        raise typer.Exit(1)


@app.command("update")
def update_endpoint(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: str = typer.Argument(..., help="Endpoint name"),
    url: Optional[str] = typer.Option(None, "--url", "-u", help="HAC base URL"),
    ignore_ssl: Optional[bool] = typer.Option(None, "--ignore-ssl/--no-ignore-ssl", help="Ignore SSL errors"),
    timeout: Optional[int] = typer.Option(None, "--timeout", help="HTTP timeout in seconds")
):
    """Update an existing endpoint."""
    manager = EnvironmentManager(get_config_path())
    
    try:
        manager.update_endpoint(
            env_name=environment,
            endpoint_name=endpoint,
            url=url,
            ignore_ssl=ignore_ssl,
            timeout=timeout
        )
        
        print(f"✓ Updated endpoint '{endpoint}' in environment '{environment}'")
    
    except ValueError as e:
        print(f"ERROR: {e}")
        raise typer.Exit(1)


@app.command("remove")
def remove_endpoint(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: str = typer.Argument(..., help="Endpoint name")
):
    """Remove an endpoint from an environment."""
    manager = EnvironmentManager(get_config_path())
    
    try:
        manager.remove_endpoint(environment, endpoint)
        print(f"✓ Removed endpoint '{endpoint}' from environment '{environment}'")
    
    except ValueError as e:
        print(f"ERROR: {e}")
        raise typer.Exit(1)


@app.command("set-default")
def set_default_endpoint(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: str = typer.Argument(..., help="Endpoint name to set as default")
):
    """Set the default endpoint for an environment."""
    manager = EnvironmentManager(get_config_path())
    
    try:
        manager.set_default_endpoint(environment, endpoint)
        print(f"✓ Set '{endpoint}' as default endpoint for environment '{environment}'")
    
    except ValueError as e:
        print(f"ERROR: {e}")
        raise typer.Exit(1)

