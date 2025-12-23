"""Environment management commands."""

import sys
import json
import typer
from typing import Optional
from rich.console import Console
from rich.table import Table

from hac_client_cli.environment_manager import EnvironmentManager

env_app = typer.Typer(help="Manage HAC environments", no_args_is_help=True)
console = Console()


@env_app.command("list")
def list_environments(
    format: str = typer.Option("table", "--format", "-f", help="Output format: table, json"),
    no_headers: bool = typer.Option(False, "--no-headers", help="Suppress column headers"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Minimal output (names only)")
):
    """List all configured environments."""
    try:
        manager = EnvironmentManager()
        environments = manager.list_environments()
        default = manager.get_default_environment()
        
        if not environments:
            if format != "json":
                console.print("[yellow]No environments configured[/yellow]")
                console.print("\nAdd an environment with endpoints:")
                console.print("  hac env add local")
                console.print("  hac endpoint add local hac --url https://localhost:9002")
            else:
                print("[]")
            return
        
        # JSON output
        if format == "json":
            output = [
                {
                    "name": env.name,
                    "endpoints": {
                        ep_name: {
                            "url": ep.url,
                            "ignore_ssl": ep.ignore_ssl,
                            "timeout": ep.timeout
                        }
                        for ep_name, ep in env.endpoints.items()
                    },
                    "default_endpoint": env.default_endpoint,
                    "is_default": env.name == default
                }
                for env in environments
            ]
            print(json.dumps(output, indent=2))
            return
        
        # Quiet output (names only)
        if quiet:
            for env in environments:
                print(env.name)
            return
        
        # Table format (default)
        table = Table(show_header=not no_headers)
        table.add_column("NAME", style="cyan")
        table.add_column("ENDPOINTS", justify="right")
        table.add_column("DEFAULT-ENDPOINT")
        table.add_column("DEFAULT", justify="center")
        
        for env in environments:
            default_marker = "✓" if env.name == default else ""
            endpoint_count = str(len(env.endpoints))
            default_ep = env.default_endpoint or "-"
            
            table.add_row(
                env.name,
                endpoint_count,
                default_ep,
                default_marker
            )
        
        console.print(table)
    
    except Exception as e:
        console.print(f"[red]ERROR: {e}[/red]", file=sys.stderr)
        raise typer.Exit(1)


@env_app.command("show")
def show_environment(
    name: str = typer.Argument(..., help="Environment name"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """Show details of a specific environment with all endpoints."""
    try:
        manager = EnvironmentManager()
        env = manager.get_environment(name)
        
        if not env:
            print(f"ERROR: Environment '{name}' not found", file=sys.stderr)
            raise typer.Exit(1)
        
        default = manager.get_default_environment()
        
        if json_output:
            output = {
                "name": env.name,
                "endpoints": {
                    ep_name: {
                        "url": ep.url,
                        "username": ep.username,
                        "ignore_ssl": ep.ignore_ssl,
                        "timeout": ep.timeout
                    }
                    for ep_name, ep in env.endpoints.items()
                },
                "default_endpoint": env.default_endpoint,
                "is_default": env.name == default
            }
            print(json.dumps(output, indent=2))
        else:
            marker = " (default)" if env.name == default else ""
            print(f"Environment: {env.name}{marker}")
            print()
            
            if not env.endpoints:
                print("  No endpoints configured")
                print(f"\n  Add an endpoint: hac endpoint add {env.name} hac --url https://...")
            else:
                print(f"  Endpoints ({len(env.endpoints)}):")
                print()
                for ep_name, ep in sorted(env.endpoints.items()):
                    default_marker = " (default)" if ep_name == env.default_endpoint else ""
                    print(f"    {ep_name}{default_marker}")
                    print(f"      URL:        {ep.url}")
                    print(f"      Ignore SSL: {ep.ignore_ssl}")
                    print(f"      Timeout:    {ep.timeout}s")
                    print()
                
                if env.default_endpoint:
                    print(f"  Start session: hac session start {env.name} --username <user>")
                else:
                    print(f"  Start session: hac session start {env.name} --endpoint <endpoint-name> --username <user>")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@env_app.command("add")
def add_environment(
    name: str = typer.Argument(..., help="Environment name"),
    set_default: bool = typer.Option(False, "--set-default", "-d", help="Set as default environment")
):
    """Add a new environment (add endpoints separately with 'hac endpoint add')."""
    try:
        manager = EnvironmentManager()
        manager.add_environment(
            name=name,
            set_default=set_default
        )
        
        marker = " (set as default)" if set_default else ""
        print(f"✓ Environment '{name}' added{marker}")
        print(f"\nNext: Add endpoints to this environment")
        print(f"  hac endpoint add {name} <endpoint-name> --url https://... --username admin")
    
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)




@env_app.command("remove")
def remove_environment(
    name: str = typer.Argument(..., help="Environment name"),
    force: bool = typer.Option(False, "--force", "-f", help="Force removal without confirmation")
):
    """Remove an environment."""
    try:
        manager = EnvironmentManager()
        
        if not manager.get_environment(name):
            print(f"ERROR: Environment '{name}' not found", file=sys.stderr)
            raise typer.Exit(1)
        
        if not force:
            confirm = typer.confirm(f"Remove environment '{name}'?")
            if not confirm:
                print("Cancelled")
                return
        
        manager.remove_environment(name)
        print(f"✓ Environment '{name}' removed")
    
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@env_app.command("set-default")
def set_default(
    name: str = typer.Argument(..., help="Environment name")
):
    """Set the default environment."""
    try:
        manager = EnvironmentManager()
        manager.set_default_environment(name)
        print(f"✓ Default environment set to '{name}'")
    
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)

