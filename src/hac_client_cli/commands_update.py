"""Update/initialization commands for HAC."""

from __future__ import annotations

import sys
import json
import time
import re
from typing import Optional
from html import unescape

import typer

update_app = typer.Typer(help="System update and initialization", no_args_is_help=True)


def _console(stderr: bool = False):
    from rich.console import Console
    return Console(stderr=stderr)


def _is_tty() -> bool:
    """Check if stdout is a TTY."""
    return sys.stdout.isatty()


def _html_to_text(html: str) -> str:
    """Convert HTML log to plain text."""
    text = html.replace('<br/>', '\n').replace('<br>', '\n')
    text = re.sub(r'<[^>]+>', '', text)
    text = unescape(text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def _html_to_rich(html: str):
    """Convert HTML log to Rich Text with formatting."""
    from rich.text import Text

    text = Text()
    
    lines = html.split('<br/>')
    lines = [l.replace('<br>', '') for line in lines for l in line.split('<br>')]
    
    for line in lines:
        if '<h3>' in line:
            header_text = re.sub(r'</?h3>', '', line)
            header_text = re.sub(r'<[^>]+>', '', header_text)
            header_text = unescape(header_text).strip()
            if header_text:
                text.append(f"\n{header_text}\n", style="bold cyan")
            continue
        
        plain_line = re.sub(r'<[^>]+>', '', line)
        plain_line = unescape(plain_line)
        
        if not plain_line.strip():
            continue
        
        if '>>>' in plain_line:
            text.append(plain_line + '\n', style="green")
        elif 'error' in plain_line.lower() or 'exception' in plain_line.lower():
            text.append(plain_line + '\n', style="bold red")
        elif 'warning' in plain_line.lower():
            text.append(plain_line + '\n', style="yellow")
        elif '####' in plain_line:
            text.append(plain_line.replace('#', '').strip() + '\n', style="bold magenta")
        else:
            text.append(plain_line + '\n')
    
    return text


@update_app.command("data")
def list_update_data(
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    patches_only: bool = typer.Option(False, "--patches", "-p", help="Show only patches"),
    with_params: bool = typer.Option(False, "--with-params", "-w", help="Show only extensions with parameters"),
    extension: Optional[str] = typer.Option(None, "--extension", "-x", help="Show specific extension details"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Minimal output (names only)")
):
    """List available update data (extensions, patches, parameters).
    
    Examples:
        hac update data                    # List all extensions
        hac update data --patches          # List patches only
        hac update data --with-params      # List extensions with parameters
        hac update data -x cchpatches      # Show patch details
    """
    try:
        from hac_client_cli.app import create_client
        
        client = create_client(environment, endpoint, quiet=True)
        data = client.get_update_data()
        
        console = _console()
        err_console = _console(stderr=True)
        
        if data.is_initializing:
            if not json_output:
                console.print("[yellow]System is currently initializing[/yellow]")
        
        extensions = data.project_datas
        if patches_only:
            extensions = [e for e in extensions if 'patch' in e.name.lower()]
        elif with_params:
            extensions = data.extensions_with_parameters
        
        if extension:
            ext = data.get_extension(extension)
            if not ext:
                err_console.print(f"[red]Extension '{extension}' not found[/red]")
                raise typer.Exit(1)
            
            if json_output:
                output = {
                    "name": ext.name,
                    "description": ext.description,
                    "parameters": [
                        {
                            "name": p.name,
                            "label": p.label,
                            "values": p.values,
                            "selected": p.selected_value,
                            "legacy": p.legacy,
                            "multi_select": p.multi_select
                        }
                        for p in ext.parameters
                    ]
                }
                print(json.dumps(output, indent=2))
            elif quiet or not _is_tty():
                for p in ext.parameters:
                    selected = p.selected_value or ""
                    values_str = ",".join(p.available_values)
                    print(f"{p.name}\t{selected}\t{values_str}")
            else:
                console.print(f"\n[bold cyan]{ext.name}[/bold cyan]")
                if ext.description:
                    console.print(f"  {ext.description}")
                
                if ext.parameters:
                    console.print(f"\n  [bold]Parameters:[/bold]")
                    for p in ext.parameters:
                        selected = p.selected_value or "none"
                        values_str = ", ".join(p.available_values)
                        console.print(f"    {p.label} ({p.name})")
                        console.print(f"      Values: {values_str}")
                        console.print(f"      Selected: [green]{selected}[/green]")
                else:
                    console.print("  [dim]No configurable parameters[/dim]")
            return
        
        if json_output:
            output = {
                "is_initializing": data.is_initializing,
                "extensions": [
                    {
                        "name": e.name,
                        "description": e.description,
                        "has_parameters": e.has_parameters,
                        "parameters": [
                            {
                                "name": p.name,
                                "label": p.label,
                                "selected": p.selected_value
                            }
                            for p in e.parameters
                        ] if e.has_parameters else []
                    }
                    for e in extensions
                ]
            }
            print(json.dumps(output, indent=2))
            return
        
        if quiet:
            for e in extensions:
                print(e.name)
            return
        
        if _is_tty():
            from rich.table import Table

            table = Table(title="Available Extensions")
            table.add_column("Extension", style="cyan")
            table.add_column("Parameters", justify="right")
            table.add_column("Selected Values")
            
            for e in extensions:
                param_count = len(e.parameters)
                if e.has_parameters:
                    selected = [f"{p.name}={p.selected_value}" for p in e.parameters if p.selected_value]
                    selected_str = ", ".join(selected[:3])
                    if len(selected) > 3:
                        selected_str += f" (+{len(selected)-3} more)"
                else:
                    selected_str = "-"
                
                table.add_row(e.name, str(param_count) if param_count > 0 else "-", selected_str)
            
            console.print(table)
            console.print(f"\nTotal: {len(extensions)} extensions")
            if data.extensions_with_parameters:
                console.print(f"With parameters: {len(data.extensions_with_parameters)}")
        else:
            for e in extensions:
                if e.has_parameters:
                    params = ",".join([f"{p.name}={p.selected_value}" for p in e.parameters])
                    print(f"{e.name}\t{params}")
                else:
                    print(e.name)
    
    except Exception as e:
        _console(stderr=True).print(f"[red]ERROR: {e}[/red]")
        raise typer.Exit(1)


@update_app.command("patches")
def list_patches(
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    extension: Optional[str] = typer.Option(None, "--extension", "-x", help="Extension containing patches"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Minimal output (names only)")
):
    """List available patches from an extension.
    
    By default, searches for extensions with 'patches' in the name.
    Use --extension to specify a specific extension.
    
    Examples:
        hac update patches                      # Auto-detect patches extension
        hac update patches -x cchpatches        # Use specific extension
        hac update patches -x myproject         # Any extension with parameters
        hac update patches --json               # JSON output
        hac update patches -q                   # Names only (for scripting)
    """
    try:
        from hac_client_cli.app import create_client
        
        client = create_client(environment, endpoint, quiet=True)
        data = client.get_update_data()
        
        console = _console()
        err_console = _console(stderr=True)
        
        if extension:
            patches_ext = data.get_extension(extension)
            if not patches_ext:
                err_console.print(f"[red]Extension '{extension}' not found[/red]")
                raise typer.Exit(1)
        else:
            patches_ext = data.get_patches_extension()
            if not patches_ext:
                if json_output:
                    print(json.dumps({"patches": []}, indent=2))
                else:
                    console.print("[yellow]No patches extension found[/yellow]")
                    console.print("Use --extension to specify which extension contains patches")
                return
        
        patches = patches_ext.parameters
        
        if json_output:
            output = {
                "extension": patches_ext.name,
                "patches": [
                    {
                        "name": p.name,
                        "label": p.label,
                        "selected": p.selected_value,
                        "values": p.available_values
                    }
                    for p in patches
                ]
            }
            print(json.dumps(output, indent=2))
            return
        
        if quiet:
            for p in patches:
                print(p.name)
            return
        
        if _is_tty():
            from rich.table import Table
            from rich.text import Text

            table = Table(title=f"Patches ({patches_ext.name})")
            table.add_column("Patch", style="cyan")
            table.add_column("Status", justify="center")
            
            applied_count = 0
            for p in patches:
                is_applied = p.selected_value == "yes"
                if is_applied:
                    applied_count += 1
                    status = Text("applied", style="green")
                else:
                    status = Text("pending", style="yellow")
                table.add_row(p.name, status)
            
            console.print(table)
            console.print(f"\nTotal: {len(patches)} patches ({applied_count} applied, {len(patches) - applied_count} pending)")
        else:
            for p in patches:
                status = "applied" if p.selected_value == "yes" else "pending"
                print(f"{p.name}\t{status}")
    
    except Exception as e:
        _console(stderr=True).print(f"[red]ERROR: {e}[/red]")
        raise typer.Exit(1)


@update_app.command("run")
def run_update(
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    patch: Optional[list[str]] = typer.Option(None, "--patch", "-p", help="Patch to run (can be repeated)"),
    extension: Optional[str] = typer.Option(None, "--extension", "-x", help="Extension containing patches"),
    param: Optional[list[str]] = typer.Option(None, "--param", help="Parameter as ext_param=value (can be repeated)"),
    drop_tables: bool = typer.Option(False, "--drop-tables", help="Drop all tables (DANGEROUS)"),
    clear_hmc: bool = typer.Option(False, "--clear-hmc", help="Clear HMC configuration"),
    create_essential_data: bool = typer.Option(False, "--create-essential-data", help="Create essential data"),
    create_project_data: bool = typer.Option(False, "--create-project-data", help="Create project data"),
    localize_types: bool = typer.Option(False, "--localize-types", help="Localize types"),
    schema_update: bool = typer.Option(False, "--schema-update", help="Run type-system schema update (DDL). Off by default."),
    follow: bool = typer.Option(True, "--follow/--no-follow", "-f", help="Follow update log"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Suppress informational messages")
):
    """Execute system update.
    
    Run patches or perform type system updates.
    
    Examples:
        hac update run --patch Patch_2602_38_0           # Run single patch
        hac update run -p Patch_MVP -p Patch_DEPLOY1    # Run multiple patches
        hac update run -x myext -p MyPatch              # Specify extension
        hac update run --create-essential-data          # Create essential data
        hac update run --param cchpatches_Patch_MVP=yes # Set parameter directly
        hac update run --schema-update                  # Run type-system schema update (DDL)
        hac update run --no-follow                      # Start update without following log
    """
    try:
        from hac_client_cli.app import create_client
        
        client = create_client(environment, endpoint, quiet=True)
        
        console = _console()
        err_console = _console(stderr=True)
        
        data = client.get_update_data()
        
        all_parameters = {}
        for ext in data.project_datas:
            for p in ext.parameters:
                param_key = f"{ext.name}_{p.name}"
                if p.selected_value:
                    all_parameters[param_key] = [p.selected_value]
                elif p.available_values:
                    all_parameters[param_key] = [p.available_values[0]]
        
        if patch:
            if extension:
                patches_ext = data.get_extension(extension)
                if not patches_ext:
                    err_console.print(f"[red]Extension '{extension}' not found[/red]")
                    raise typer.Exit(1)
            else:
                patches_ext = data.get_patches_extension()
            
            if patches_ext:
                ext_name = patches_ext.name
                
                all_parameters[f"{ext_name}_sample"] = "true"
                
                for p in patches_ext.parameters:
                    all_parameters[f"{ext_name}_{p.name}"] = ["no"]
                
                for p_name in patch:
                    param_key = f"{ext_name}_{p_name}"
                    matching_patch = next((pp for pp in patches_ext.parameters if pp.name == p_name), None)
                    if matching_patch:
                        all_parameters[param_key] = ["yes"]
                    else:
                        err_console.print(f"[yellow]Warning: Patch '{p_name}' not found in {ext_name}[/yellow]")
            else:
                err_console.print("[yellow]Warning: No patches extension found. Use --extension to specify.[/yellow]")
        
        if param:
            for p in param:
                if '=' not in p:
                    err_console.print(f"[red]Invalid parameter format: {p} (expected name=value)[/red]")
                    raise typer.Exit(1)
                name, value = p.split('=', 1)
                all_parameters[name] = [value]
        
        if not quiet:
            console.print("[bold]Starting system update...[/bold]")
            if patch:
                console.print(f"  Patches: {', '.join(patch)}")
            if drop_tables:
                console.print("[bold red]  DROP TABLES ENABLED[/bold red]")
        
        result = client.execute_update(
            all_parameters=all_parameters,
            drop_tables=drop_tables,
            clear_hmc=clear_hmc,
            create_essential_data=create_essential_data,
            create_project_data=create_project_data,
            localize_types=localize_types,
            run_schema_update=schema_update
        )
        
        if not result.success:
            err_console.print("[red]Update failed[/red]")
            if result.log_html:
                if quiet or not _is_tty():
                    print(result.log_text)
                else:
                    rich_text = _html_to_rich(result.log_html)
                    console.print(rich_text)
            raise typer.Exit(1)
        
        if json_output:
            print(json.dumps({
                "success": result.success,
                "finished": result.is_finished,
                "log": result.log_text
            }, indent=2))
        elif quiet or not _is_tty():
            print(result.log_text)
        else:
            console.print("[green]Update completed[/green]")
            if result.log_html:
                console.print()
                rich_text = _html_to_rich(result.log_html)
                console.print(rich_text)
        
        if follow and not result.is_finished:
            if not quiet and not json_output:
                console.print("\n[bold]Waiting for update to complete...[/bold]")
            _follow_log(client, json_output, quiet)
    
    except Exception as e:
        _console(stderr=True).print(f"[red]ERROR: {e}[/red]")
        raise typer.Exit(1)


@update_app.command("log")
def show_log(
    environment: Optional[str] = typer.Option(None, "--environment", "-e", help="Environment name"),
    endpoint: Optional[str] = typer.Option(None, "--endpoint", "-n", help="Endpoint name"),
    follow: bool = typer.Option(False, "--follow", "-f", help="Follow log (poll for updates)"),
    json_output: bool = typer.Option(False, "--json", help="Output as JSON"),
    quiet: bool = typer.Option(False, "--quiet", "-q", help="Plain text output")
):
    """Show update/initialization log.
    
    Examples:
        hac update log                  # Show current log
        hac update log --follow         # Follow log until complete
        hac update log --json           # JSON output
    """
    try:
        from hac_client_cli.app import create_client
        
        client = create_client(environment, endpoint, quiet=True)
        
        console = _console()
        
        if follow:
            _follow_log(client, json_output, quiet)
        else:
            log = client.get_update_log()
            
            if json_output:
                print(json.dumps({
                    "log": log.log_text,
                    "is_complete": log.is_complete,
                    "has_errors": log.has_errors
                }, indent=2))
            elif quiet or not _is_tty():
                print(log.log_text)
            else:
                from rich.panel import Panel

                rich_text = _html_to_rich(log.log_html)
                console.print(Panel(rich_text, title="Update Log"))
                
                if log.is_complete:
                    if log.has_errors:
                        console.print("[bold red]Update completed with errors[/bold red]")
                    else:
                        console.print("[bold green]Update completed[/bold green]")
    
    except Exception as e:
        _console(stderr=True).print(f"[red]ERROR: {e}[/red]")
        raise typer.Exit(1)


def _follow_log(client, json_output: bool, quiet: bool):
    """Follow the update log until completion."""
    last_log = ""
    poll_interval = 2
    max_wait = 3600
    start_time = time.time()
    
    console = _console()
    
    try:
        while True:
            log = client.get_update_log()
            current_log = log.log_text
            
            if current_log != last_log:
                if json_output:
                    print(json.dumps({
                        "log": current_log,
                        "is_complete": log.is_complete,
                        "has_errors": log.has_errors,
                        "timestamp": time.time()
                    }))
                else:
                    if last_log:
                        new_content = current_log[len(last_log):].strip()
                    else:
                        new_content = current_log
                    
                    if new_content:
                        if quiet or not _is_tty():
                            print(new_content)
                        else:
                            rich_text = _html_to_rich(new_content.replace('\n', '<br/>'))
                            console.print(rich_text, end="")
                
                last_log = current_log
            
            if log.is_complete:
                if not json_output and _is_tty() and not quiet:
                    console.print()
                    if log.has_errors:
                        console.print("[bold red]Update completed with errors[/bold red]")
                    else:
                        console.print("[bold green]Update completed successfully[/bold green]")
                break
            
            if time.time() - start_time > max_wait:
                _console(stderr=True).print("[yellow]Warning: Timeout waiting for update to complete[/yellow]")
                break
            
            time.sleep(poll_interval)
    
    except KeyboardInterrupt:
        if not json_output:
            console.print("\n[yellow]Stopped following log (update may still be running)[/yellow]")
