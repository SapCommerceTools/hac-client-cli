"""Session management commands."""

import sys
import json
import os
import typer
from typing import Optional
from datetime import timedelta

from hac_client_core.session import SessionManager
from hac_client_core.client import HacClient
from hac_client_core.auth import BasicAuthHandler

session_app = typer.Typer(help="Manage HAC sessions", no_args_is_help=True)


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
    password: Optional[str] = typer.Option(None, "--password", "-p", help="Password (or use stdin/env var)")
):
    """Start a new HAC session (authenticate and create session).
    
    Password can be provided via:
    - Command option: --password <pass> (not recommended)
    - Environment variable: HAC_PASSWORD or HAC_PASSWORD_<ENV>
    - Standard input: echo 'password' | hac session start <env>
    - Interactive prompt: if none of the above
    
    Examples:
        hac session start local
        HAC_PASSWORD=secret hac session start local
        echo 'secret' | hac session start local
    """
    try:
        from hac_client_cli.environment_manager import EnvironmentManager
        
        env_manager = EnvironmentManager()
        env = env_manager.get_environment(environment)
        
        if not env:
            print(f"ERROR: Environment '{environment}' not found", file=sys.stderr)
            raise typer.Exit(1)
        
        # Get password from various sources
        if not password:
            # Try environment variable
            env_var_name = f"HAC_PASSWORD_{environment.upper()}"
            password = os.environ.get(env_var_name) or os.environ.get("HAC_PASSWORD")
        
        if not password:
            # Try stdin (non-interactive)
            if not sys.stdin.isatty():
                password = sys.stdin.read().strip()
        
        if not password:
            # Interactive prompt
            password = typer.prompt("Password", hide_input=True)
        
        # Create client and authenticate
        auth = BasicAuthHandler(env.username, password)
        client = HacClient(
            base_url=env.url,
            auth_handler=auth,
            environment=environment,
            timeout=env.timeout,
            ignore_ssl=env.ignore_ssl,
            session_persistence=True,
            quiet=False
        )
        
        # Force login to create session
        client.login()
        
        print(f"✓ Session started for environment '{environment}'")
        print(f"  User: {env.username}")
        print(f"  URL: {env.url}")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("import")
def import_session(
    environment: str = typer.Argument(..., help="Environment name"),
    session_id: Optional[str] = typer.Option(None, "--session-id", help="Session ID (JSESSIONID)"),
    csrf_token: Optional[str] = typer.Option(None, "--csrf-token", help="CSRF token"),
    route_cookie: Optional[str] = typer.Option(None, "--route-cookie", help="ROUTE cookie (optional)")
):
    """Import an existing HAC session from tokens.
    
    Tokens can be provided via:
    - Command options (not recommended for security)
    - Environment variables:
      - HAC_SESSION_ID or HAC_SESSION_ID_<ENV>
      - HAC_CSRF_TOKEN or HAC_CSRF_TOKEN_<ENV>
      - HAC_ROUTE_COOKIE or HAC_ROUTE_COOKIE_<ENV>
    - Standard input (JSON format)
    
    Examples:
        # Via environment variables
        HAC_SESSION_ID=abc123 HAC_CSRF_TOKEN=def456 hac session import local
        
        # Via stdin (JSON)
        echo '{"session_id":"abc","csrf_token":"def"}' | hac session import local
        
        # Via command options
        hac session import local --session-id abc123 --csrf-token def456
    """
    try:
        from hac_client_cli.environment_manager import EnvironmentManager
        
        env_manager = EnvironmentManager()
        env = env_manager.get_environment(environment)
        
        if not env:
            print(f"ERROR: Environment '{environment}' not found", file=sys.stderr)
            raise typer.Exit(1)
        
        # Get tokens from various sources
        if not session_id or not csrf_token:
            # Try environment variables
            env_prefix = environment.upper()
            session_id = session_id or os.environ.get(f"HAC_SESSION_ID_{env_prefix}") or os.environ.get("HAC_SESSION_ID")
            csrf_token = csrf_token or os.environ.get(f"HAC_CSRF_TOKEN_{env_prefix}") or os.environ.get("HAC_CSRF_TOKEN")
            route_cookie = route_cookie or os.environ.get(f"HAC_ROUTE_COOKIE_{env_prefix}") or os.environ.get("HAC_ROUTE_COOKIE")
        
        if not session_id or not csrf_token:
            # Try stdin (JSON)
            if not sys.stdin.isatty():
                import json
                data = json.load(sys.stdin)
                session_id = session_id or data.get("session_id")
                csrf_token = csrf_token or data.get("csrf_token")
                route_cookie = route_cookie or data.get("route_cookie")
        
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
            base_url=env.url,
            username=env.username,
            environment=environment,
            session_id=session_id,
            csrf_token=csrf_token,
            route_cookie=route_cookie
        )
        
        print(f"✓ Session imported for environment '{environment}'")
        print(f"  User: {env.username}")
        print(f"  URL: {env.url}")
        print(f"  Session ID: {session_id[:16]}...")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("list")
def list_sessions(
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """List all active sessions."""
    try:
        manager = SessionManager()
        sessions = manager.list_sessions()
        
        if json_output:
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
        else:
            if not sessions:
                print("No active sessions")
                print("\nSessions are created automatically when you execute HAC commands")
            else:
                print(f"Active sessions ({len(sessions)}):\n")
                for s in sessions:
                    age = format_duration(s.age_seconds)
                    idle = format_duration(s.idle_seconds)
                    auth_marker = "✓" if s.is_authenticated else "✗"
                    
                    print(f"  {s.environment} @ {s.base_url}")
                    print(f"    User: {s.username}")
                    print(f"    Auth: {auth_marker}  Age: {age}  Idle: {idle}")
                    print(f"    Created: {s.created_at_formatted}")
                    print(f"    Last used: {s.last_used_at_formatted}")
                    print()
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)


@session_app.command("show")
def show_session(
    environment: str = typer.Argument(..., help="Environment name"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON")
):
    """Show details of a specific session."""
    try:
        from hac_client_cli.environment_manager import EnvironmentManager
        
        env_manager = EnvironmentManager()
        env = env_manager.get_environment(environment)
        
        if not env:
            print(f"ERROR: Environment '{environment}' not found", file=sys.stderr)
            raise typer.Exit(1)
        
        session_manager = SessionManager()
        session = session_manager.load_session(env.url, env.username, environment)
        
        if not session:
            print(f"No active session for environment '{environment}'")
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
            auth_marker = "✓ authenticated" if session.is_authenticated else "✗ not authenticated"
            
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
    environment: str = typer.Argument(..., help="Environment name")
):
    """Clear session for a specific environment."""
    try:
        from hac_client_cli.environment_manager import EnvironmentManager
        
        env_manager = EnvironmentManager()
        env = env_manager.get_environment(environment)
        
        if not env:
            print(f"ERROR: Environment '{environment}' not found", file=sys.stderr)
            raise typer.Exit(1)
        
        session_manager = SessionManager()
        session_manager.remove_session(env.url, env.username, environment)
        
        print(f"✓ Session cleared for environment '{environment}'")
    
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
        
        session_manager = SessionManager()
        count = session_manager.clear_all_sessions()
        
        print(f"✓ Cleared {count} session(s)")
    
    except Exception as e:
        print(f"ERROR: {e}", file=sys.stderr)
        raise typer.Exit(1)

