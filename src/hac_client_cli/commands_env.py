"""Environment management commands."""

import sys
import json
import typer
from typing import Optional

from hac_client_cli.environment_manager import EnvironmentManager

env_app = typer.Typer(help="Manage HAC environments", no_args_is_help=True)


@env_app.command("list")
def list_environments(
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """List all configured environments."""
    try:
        manager = EnvironmentManager()
        environments = manager.list_environments()
        default = manager.get_default_environment()
        
        if json_output:
            output = [
                {
                    "name": env.name,
                    "url": env.url,
                    "username": env.username,
                    "password_configured": env.password is not None,
                    "ignore_ssl": env.ignore_ssl,
                    "timeout": env.timeout,
                    "is_default": env.name == default
                }
                for env in environments
            ]
            print(json.dumps(output, indent=2))
        else:
            if not environments:
                print("No environments configured")
                print("\nAdd an environment:")
                print("  hac env add local --url https://localhost:9002 --username admin")
            else:
                print(f"Environments ({len(environments)}):\n")
                for env in environments:
                    marker = " ← default" if env.name == default else ""
                    pwd_marker = "✓" if env.password else "✗"
                    ssl_marker = "ignore" if env.ignore_ssl else "verify"
                    print(f"  {env.name}{marker}")
                    print(f"    URL: {env.url}")
                    print(f"    User: {env.username}")
                    print(f"    Password: {pwd_marker}  SSL: {ssl_marker}  Timeout: {env.timeout}s")
                    print()
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@env_app.command("show")
def show_environment(
    name: str = typer.Argument(..., help="Environment name"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """Show details of a specific environment."""
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
                "url": env.url,
                "username": env.username,
                "password_configured": env.password is not None,
                "ignore_ssl": env.ignore_ssl,
                "timeout": env.timeout,
                "is_default": env.name == default
            }
            print(json.dumps(output, indent=2))
        else:
            marker = " (default)" if env.name == default else ""
            print(f"Environment: {env.name}{marker}")
            print(f"  URL: {env.url}")
            print(f"  Username: {env.username}")
            print(f"  Password: {'✓ configured' if env.password else '✗ not configured'}")
            print(f"  Ignore SSL: {env.ignore_ssl}")
            print(f"  Timeout: {env.timeout}s")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@env_app.command("add")
def add_environment(
    name: str = typer.Argument(..., help="Environment name"),
    url: str = typer.Option(..., "--url", "-u", help="HAC base URL"),
    username: str = typer.Option(..., "--username", help="Username"),
    password: Optional[str] = typer.Option(None, "--password", "-p", help="Password (or use env var)"),
    ignore_ssl: bool = typer.Option(False, "--ignore-ssl", help="Ignore SSL certificate errors"),
    timeout: int = typer.Option(30, "--timeout", "-t", help="HTTP timeout in seconds"),
    set_default: bool = typer.Option(False, "--set-default", "-d", help="Set as default environment")
):
    """Add a new environment."""
    try:
        manager = EnvironmentManager()
        manager.add_environment(
            name=name,
            url=url,
            username=username,
            password=password,
            ignore_ssl=ignore_ssl,
            timeout=timeout,
            set_default=set_default
        )
        
        marker = " (set as default)" if set_default else ""
        print(f"✓ Environment '{name}' added{marker}")
        if not password:
            print(f"  Set password via HAC_PASSWORD_{name.upper()} or HAC_PASSWORD env var")
    
    except ValueError as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@env_app.command("update")
def update_environment(
    name: str = typer.Argument(..., help="Environment name"),
    url: Optional[str] = typer.Option(None, "--url", "-u", help="New HAC base URL"),
    username: Optional[str] = typer.Option(None, "--username", help="New username"),
    password: Optional[str] = typer.Option(None, "--password", "-p", help="New password"),
    ignore_ssl: Optional[bool] = typer.Option(None, "--ignore-ssl/--verify-ssl", help="SSL verification"),
    timeout: Optional[int] = typer.Option(None, "--timeout", "-t", help="New timeout")
):
    """Update an existing environment."""
    try:
        manager = EnvironmentManager()
        manager.update_environment(
            name=name,
            url=url,
            username=username,
            password=password,
            ignore_ssl=ignore_ssl,
            timeout=timeout
        )
        
        print(f"✓ Environment '{name}' updated")
    
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

