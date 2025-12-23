"""Environment configuration management with CRUD operations."""

from pathlib import Path
import os
import tomllib
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List


@dataclass
class Environment:
    """HAC environment configuration.
    
    Note: Passwords are NEVER stored in environment config.
    Use 'hac session start' to authenticate and create a session.
    """
    
    name: str
    """Environment name"""
    
    url: str
    """HAC base URL"""
    
    username: str
    """Username"""
    
    ignore_ssl: bool = False
    """Ignore SSL certificate errors"""
    
    timeout: int = 30
    """HTTP timeout in seconds"""


class EnvironmentManager:
    """Manage HAC environment configurations."""
    
    def __init__(self, config_path: Optional[Path] = None):
        """Initialize environment manager.
        
        Args:
            config_path: Path to config file (default: ~/.config/hac-client/config.toml)
        """
        if config_path is None:
            xdg_config = os.environ.get("XDG_CONFIG_HOME")
            if xdg_config:
                config_home = Path(xdg_config)
            else:
                config_home = Path.home() / ".config"
            config_path = config_home / "hac-client" / "config.toml"
        
        self.config_path = config_path
    
    def _load_config(self) -> Dict:
        """Load configuration from file."""
        if not self.config_path.exists():
            return {"default_environment": "local", "environments": {}}
        
        with self.config_path.open("rb") as f:
            return tomllib.load(f)
    
    def _save_config(self, config: Dict) -> None:
        """Save configuration to file."""
        self.config_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Convert to TOML format manually since tomli_w might not be available
        lines = []
        
        # Write default environment
        if "default_environment" in config:
            lines.append(f'default_environment = "{config["default_environment"]}"')
            lines.append("")
        
        # Write environments
        for env_name, env_data in config.get("environments", {}).items():
            if not isinstance(env_data, dict):
                continue
            
            lines.append(f"[environments.{env_name}]")
            lines.append(f'url = "{env_data["url"]}"')
            lines.append(f'username = "{env_data["username"]}"')
            
            if env_data.get("ignore_ssl", False):
                lines.append(f'ignore_ssl = true')
            
            if env_data.get("timeout", 30) != 30:
                lines.append(f'timeout = {env_data["timeout"]}')
            
            lines.append("")
        
        with self.config_path.open("w") as f:
            f.write("\n".join(lines))
    
    def list_environments(self) -> List[Environment]:
        """List all environments.
        
        Returns:
            List of Environment objects
        """
        config = self._load_config()
        environments = []
        
        for env_name, env_data in config.get("environments", {}).items():
            if not isinstance(env_data, dict):
                continue
            
            environments.append(Environment(
                name=env_name,
                url=env_data["url"],
                username=env_data["username"],
                ignore_ssl=env_data.get("ignore_ssl", False),
                timeout=env_data.get("timeout", 30)
            ))
        
        return sorted(environments, key=lambda e: e.name)
    
    def get_environment(self, name: str) -> Optional[Environment]:
        """Get a specific environment.
        
        Args:
            name: Environment name
            
        Returns:
            Environment if found, None otherwise
        """
        environments = self.list_environments()
        for env in environments:
            if env.name == name:
                return env
        return None
    
    def add_environment(
        self,
        name: str,
        url: str,
        username: str,
        ignore_ssl: bool = False,
        timeout: int = 30,
        set_default: bool = False
    ) -> None:
        """Add a new environment.
        
        Args:
            name: Environment name
            url: HAC base URL
            username: Username
            ignore_ssl: Ignore SSL errors
            timeout: HTTP timeout
            set_default: Set as default environment
            
        Raises:
            ValueError: If environment already exists
        """
        config = self._load_config()
        
        if "environments" not in config:
            config["environments"] = {}
        
        if name in config["environments"]:
            raise ValueError(f"Environment '{name}' already exists")
        
        config["environments"][name] = {
            "url": url,
            "username": username,
            "ignore_ssl": ignore_ssl,
            "timeout": timeout
        }
        
        if set_default or not config.get("default_environment"):
            config["default_environment"] = name
        
        self._save_config(config)
    
    def update_environment(
        self,
        name: str,
        url: Optional[str] = None,
        username: Optional[str] = None,
        ignore_ssl: Optional[bool] = None,
        timeout: Optional[int] = None
    ) -> None:
        """Update an existing environment.
        
        Args:
            name: Environment name
            url: New URL (optional)
            username: New username (optional)
            ignore_ssl: New SSL setting (optional)
            timeout: New timeout (optional)
            
        Raises:
            ValueError: If environment doesn't exist
        """
        config = self._load_config()
        
        if name not in config.get("environments", {}):
            raise ValueError(f"Environment '{name}' not found")
        
        env_config = config["environments"][name]
        
        if url is not None:
            env_config["url"] = url
        if username is not None:
            env_config["username"] = username
        if ignore_ssl is not None:
            env_config["ignore_ssl"] = ignore_ssl
        if timeout is not None:
            env_config["timeout"] = timeout
        
        self._save_config(config)
    
    def remove_environment(self, name: str) -> None:
        """Remove an environment.
        
        Args:
            name: Environment name
            
        Raises:
            ValueError: If environment doesn't exist or is default
        """
        config = self._load_config()
        
        if name not in config.get("environments", {}):
            raise ValueError(f"Environment '{name}' not found")
        
        if config.get("default_environment") == name:
            raise ValueError(f"Cannot remove default environment '{name}'. Set another default first.")
        
        del config["environments"][name]
        self._save_config(config)
    
    def get_default_environment(self) -> Optional[str]:
        """Get the default environment name.
        
        Returns:
            Default environment name, or None if not set
        """
        config = self._load_config()
        return config.get("default_environment")
    
    def set_default_environment(self, name: str) -> None:
        """Set the default environment.
        
        Args:
            name: Environment name
            
        Raises:
            ValueError: If environment doesn't exist
        """
        config = self._load_config()
        
        if name not in config.get("environments", {}):
            raise ValueError(f"Environment '{name}' not found")
        
        config["default_environment"] = name
        self._save_config(config)

