"""Session management commands."""

import sys
import json
import os
import typer
from typing import Optional

session_app = typer.Typer(help="Manage HAC sessions", no_args_is_help=True)


def _console():
    from rich.console import Console
    return Console()


def format_duration(seconds: float) -> str:
    """Format duration in human-readable format."""
    if seconds < 60:
        return f"{int(seconds)}s"
    elif seconds < 3600:
        return f"{int(seconds/60)}m {int(seconds%60)}s"
    else:
        hours = int(seconds / 3600)
        minutes = int((seconds % 3600) / 60)
        return f"{hours}h {minutes}m"


@session_app.command("start")
def start_session(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name (uses default if not specified)"),
    username: Optional[str] = typer.Option(None, "--username", "-u", help="Username (or use env var)"),
    password: Optional[str] = typer.Option(None, "--password", "-p", help="Password (or use stdin/env var)")
):
    """Start a new HAC session (authenticate and create session).
    
    Username can be provided via:
    - Command option: --username <user>
    - Environment variable: HAC_USERNAME or HAC_USERNAME_<ENV>_<ENDPOINT>
    - Interactive prompt: if not provided
    
    Password can be provided via:
    - Command option: --password <pass> (not recommended)
    - Environment variable: HAC_PASSWORD or HAC_PASSWORD_<ENV>_<ENDPOINT>
    - Standard input: echo 'password' | hac session start <env> --username <user>
    - Interactive prompt: if none of the above
    
    Examples:
        hac session start local --username admin
        hac session start local --endpoint hac --username admin
        HAC_USERNAME=admin HAC_PASSWORD=secret hac session start local
        echo 'secret' | hac session start local --username admin
    """
    try:
        from hac_client_cli.config_loader import get_endpoint_config
        from hac_client_core.client import HacClient
        from hac_client_core.auth import BasicAuthHandler
        
        # Get endpoint configuration
        env_name, endpoint_name, ep_config = get_endpoint_config(environment, endpoint)
        
        # Create session identifier
        session_id = f"{env_name}/{endpoint_name}"
        
        # Get username from various sources
        if not username:
            env_ep_var = f"HAC_USERNAME_{env_name.upper()}_{endpoint_name.upper()}"
            env_var = f"HAC_USERNAME_{env_name.upper()}"
            username = os.environ.get(env_ep_var) or os.environ.get(env_var) or os.environ.get("HAC_USERNAME")
        
        if not username:
            print("ERROR: Username not provided", file=sys.stderr)
            print("\nProvide username via:", file=sys.stderr)
            print(f"  --username <user>", file=sys.stderr)
            print(f"  HAC_USERNAME environment variable", file=sys.stderr)
            print(f"  HAC_USERNAME_{env_name.upper()}_{endpoint_name.upper()} environment variable", file=sys.stderr)
            raise typer.Exit(1)
        
        # Get password from various sources
        if not password:
            env_ep_var = f"HAC_PASSWORD_{env_name.upper()}_{endpoint_name.upper()}"
            env_var = f"HAC_PASSWORD_{env_name.upper()}"
            password = os.environ.get(env_ep_var) or os.environ.get(env_var) or os.environ.get("HAC_PASSWORD")
        
        if not password:
            if not sys.stdin.isatty():
                password = sys.stdin.read().strip()
        
        if not password:
            print("ERROR: Password not provided", file=sys.stderr)
            print("\nProvide password via:", file=sys.stderr)
            print(f"  HAC_PASSWORD environment variable", file=sys.stderr)
            print(f"  HAC_PASSWORD_{env_name.upper()}_{endpoint_name.upper()} environment variable", file=sys.stderr)
            print(f"  stdin: echo 'password' | hac session start {env_name} --endpoint {endpoint_name} --username {username}", file=sys.stderr)
            raise typer.Exit(1)
        
        try:
            auth = BasicAuthHandler(username, password)
            client = HacClient(
                base_url=ep_config.url,
                auth_handler=auth,
                environment=session_id,
                timeout=ep_config.timeout,
                ignore_ssl=ep_config.ignore_ssl,
                session_persistence=True,
                quiet=False
            )
            
            client.login()
            
            print(f"Session started for '{session_id}'")
            print(f"  User: {username}")
            print(f"  URL: {ep_config.url}")
        
        finally:
            if password:
                password = None
                del password
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("import")
def import_session(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name (uses default if not specified)"),
    username: Optional[str] = typer.Option(None, "--username", "-u", help="Username (or use env var)"),
    session_id: Optional[str] = typer.Option(None, "--session-id", help="Session ID (JSESSIONID)"),
    csrf_token: Optional[str] = typer.Option(None, "--csrf-token", help="CSRF token"),
    route_cookie: Optional[str] = typer.Option(None, "--route-cookie", help="ROUTE cookie (optional)")
):
    """Import an existing HAC session from tokens.
    
    Username can be provided via:
    - Command option: --username <user>
    - Environment variable: HAC_USERNAME or HAC_USERNAME_<ENV>_<ENDPOINT>
    
    Tokens can be provided via:
    - Command options (not recommended for security)
    - Environment variables:
      - HAC_SESSION_ID or HAC_SESSION_ID_<ENV>_<ENDPOINT>
      - HAC_CSRF_TOKEN or HAC_CSRF_TOKEN_<ENV>_<ENDPOINT>
      - HAC_ROUTE_COOKIE or HAC_ROUTE_COOKIE_<ENV>_<ENDPOINT>
    - Standard input (JSON format with username, session_id, csrf_token fields)
    
    Examples:
        # Via environment variables
        HAC_USERNAME=admin HAC_SESSION_ID=abc123 HAC_CSRF_TOKEN=def456 hac session import local
        
        # Via stdin (JSON)
        echo '{"username":"admin","session_id":"abc","csrf_token":"def"}' | hac session import local --endpoint hac
        
        # Via command options
        hac session import local --endpoint hac --username admin --session-id abc123 --csrf-token def456
    """
    try:
        from hac_client_cli.config_loader import get_endpoint_config
        from hac_client_core.session import SessionManager
        
        # Get endpoint configuration
        env_name, endpoint_name, ep_config = get_endpoint_config(environment, endpoint)
        
        # Create session identifier
        sess_id = f"{env_name}/{endpoint_name}"
        
        # Get username from various sources
        if not username:
            env_ep_var = f"HAC_USERNAME_{env_name.upper()}_{endpoint_name.upper()}"
            env_var = f"HAC_USERNAME_{env_name.upper()}"
            username = os.environ.get(env_ep_var) or os.environ.get(env_var) or os.environ.get("HAC_USERNAME")
        
        # Get tokens from various sources
        if not session_id or not csrf_token or not username:
            if not sys.stdin.isatty():
                data = json.load(sys.stdin)
                username = username or data.get("username")
                session_id = session_id or data.get("session_id")
                csrf_token = csrf_token or data.get("csrf_token")
                route_cookie = route_cookie or data.get("route_cookie")
        
        if not session_id or not csrf_token:
            env_ep_prefix = f"{env_name.upper()}_{endpoint_name.upper()}"
            env_prefix = env_name.upper()
            session_id = session_id or os.environ.get(f"HAC_SESSION_ID_{env_ep_prefix}") or os.environ.get(f"HAC_SESSION_ID_{env_prefix}") or os.environ.get("HAC_SESSION_ID")
            csrf_token = csrf_token or os.environ.get(f"HAC_CSRF_TOKEN_{env_ep_prefix}") or os.environ.get(f"HAC_CSRF_TOKEN_{env_prefix}") or os.environ.get("HAC_CSRF_TOKEN")
            route_cookie = route_cookie or os.environ.get(f"HAC_ROUTE_COOKIE_{env_ep_prefix}") or os.environ.get(f"HAC_ROUTE_COOKIE_{env_prefix}") or os.environ.get("HAC_ROUTE_COOKIE")
        
        if not username:
            print("ERROR: Username not provided", file=sys.stderr)
            print("Provide via --username, HAC_USERNAME env var, or stdin (JSON)", file=sys.stderr)
            raise typer.Exit(1)
        
        if not session_id:
            print("ERROR: Session ID not provided", file=sys.stderr)
            print("Provide via --session-id, HAC_SESSION_ID env var, or stdin (JSON)", file=sys.stderr)
            raise typer.Exit(1)
        
        if not csrf_token:
            print("ERROR: CSRF token not provided", file=sys.stderr)
            print("Provide via --csrf-token, HAC_CSRF_TOKEN env var, or stdin (JSON)", file=sys.stderr)
            raise typer.Exit(1)
        
        # Import session
        session_manager = SessionManager()
        session_manager.save_session(
            base_url=ep_config.url,
            username=username,
            environment=sess_id,
            session_id=session_id,
            csrf_token=csrf_token,
            route_cookie=route_cookie
        )
        
        print(f"Session imported for '{sess_id}'")
        print(f"  User: {username}")
        print(f"  URL: {ep_config.url}")
        print(f"  Session ID: {session_id[:16]}...")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("list")
def list_sessions(
    format: str = typer.Option("table", "--format", "-f", help="Output format: table, json"),
    no_headers: bool = typer.Option(False, "--no-headers", help="Suppress column headers"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Minimal output (environment IDs only)")
):
    """List all active sessions."""
    try:
        from hac_client_core.session import SessionManager

        manager = SessionManager()
        sessions = manager.list_sessions()
        
        if not sessions:
            if format != "json":
                console = _console()
                console.print("[yellow]No active sessions[/yellow]")
                console.print("\nCreate a session: hac session start <environment> --username <user>")
            else:
                print("[]")
            return
        
        # JSON output
        if format == "json":
            output = [
                {
                    "environment": s.environment,
                    "url": s.base_url,
                    "username": s.username,
                    "session_id": s.session_id[:16] + "...",
                    "created_at": s.created_at_formatted,
                    "last_used_at": s.last_used_at_formatted,
                    "age_seconds": s.age_seconds,
                    "idle_seconds": s.idle_seconds,
                    "is_authenticated": s.is_authenticated
                }
                for s in sessions
            ]
            print(json.dumps(output, indent=2))
            return
        
        # Quiet output (environment IDs only)
        if quiet:
            for s in sessions:
                print(s.environment)
            return
        
        # Table format (default)
        from rich.table import Table

        table = Table(show_header=not no_headers)
        table.add_column("ENVIRONMENT", style="cyan")
        table.add_column("USERNAME")
        table.add_column("URL")
        table.add_column("AUTH", justify="center")
        table.add_column("AGE", justify="right")
        table.add_column("IDLE", justify="right")
        
        for s in sessions:
            age = format_duration(s.age_seconds)
            idle = format_duration(s.idle_seconds)
            auth_marker = "[green]✓[/green]" if s.is_authenticated else "[red]✗[/red]"
            
            table.add_row(
                s.environment,
                s.username,
                s.base_url,
                auth_marker,
                age,
                idle
            )
        
        _console().print(table)
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("show")
def show_session(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name (uses default if not specified)"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """Show details of a specific session."""
    try:
        from hac_client_cli.config_loader import get_endpoint_config
        from hac_client_core.session import SessionManager

        env_name, endpoint_name, ep_config = get_endpoint_config(environment, endpoint)
        session_id = f"{env_name}/{endpoint_name}"

        session_manager = SessionManager()
        sessions = session_manager.list_sessions()
        session = next((s for s in sessions if s.environment == session_id), None)
        
        if not session:
            print(f"No active session for environment '{session_id}'")
            return
        
        if json_output:
            output = {
                "environment": session.environment,
                "url": session.base_url,
                "username": session.username,
                "session_id": session.session_id,
                "csrf_token": session.csrf_token[:16] + "...",
                "route_cookie": session.route_cookie,
                "created_at": session.created_at_formatted,
                "last_used_at": session.last_used_at_formatted,
                "age_seconds": session.age_seconds,
                "idle_seconds": session.idle_seconds,
                "is_authenticated": session.is_authenticated
            }
            print(json.dumps(output, indent=2))
        else:
            age = format_duration(session.age_seconds)
            idle = format_duration(session.idle_seconds)
            auth_marker = "authenticated" if session.is_authenticated else "not authenticated"
            
            print(f"Session: {session.environment}")
            print(f"  URL: {session.base_url}")
            print(f"  Username: {session.username}")
            print(f"  Status: {auth_marker}")
            print(f"  Session ID: {session.session_id}")
            print(f"  CSRF Token: {session.csrf_token[:32]}...")
            if session.route_cookie:
                print(f"  Route Cookie: {session.route_cookie}")
            print(f"\n  Created: {session.created_at_formatted}")
            print(f"  Last used: {session.last_used_at_formatted}")
            print(f"  Age: {age}")
            print(f"  Idle: {idle}")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("clear")
def clear_session(
    environment: str = typer.Argument(..., help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name (uses default if not specified)")
):
    """Clear session for a specific environment."""
    try:
        from hac_client_cli.config_loader import get_endpoint_config
        from hac_client_core.session import SessionManager

        env_name, endpoint_name, ep_config = get_endpoint_config(environment, endpoint)
        session_id = f"{env_name}/{endpoint_name}"

        session_manager = SessionManager()
        sessions = session_manager.list_sessions()
        session = next((s for s in sessions if s.environment == session_id), None)

        if not session:
            print(f"No active session for environment '{session_id}'")
            return

        session_manager.remove_session(session.base_url, session.username, session_id)

        print(f"Session cleared for environment '{session_id}'")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("clear-all")
def clear_all_sessions(
    force: bool = typer.Option(False, "--force", "-f", help="Force without confirmation")
):
    """Clear all sessions."""
    try:
        if not force:
            confirm = typer.confirm("Clear all sessions?")
            if not confirm:
                print("Cancelled")
                return
        
        from hac_client_core.session import SessionManager

        session_manager = SessionManager()
        count = session_manager.clear_all_sessions()
        
        print(f"Cleared {count} session(s)")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)
