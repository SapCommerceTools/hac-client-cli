"""Session management commands."""

import sys
import json
import typer
from typing import Optional
from datetime import timedelta

from hac_client_core.session import SessionManager

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

