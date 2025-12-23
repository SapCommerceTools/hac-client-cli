"""Environment configuration management with CRUD operations."""

from pathlib import Path
import os
import tomllib
from dataclasses import dataclass, asdict
from typing import Optional, Dict, List


@dataclass
class Endpoint:
    """HAC endpoint (single instance/node) configuration.
    
    Note: Username is NOT stored here - it's part of authentication/session.
    An endpoint is just infrastructure (URL, connection settings).
    """
    
    name: str
    """Endpoint name"""
    
    url: str
    """HAC base URL"""
    
    ignore_ssl: bool = False
    """Ignore SSL certificate errors"""
    
    timeout: int = 30
    """HTTP timeout in seconds"""


@dataclass
class Environment:
    """HAC environment configuration (collection of endpoints).
    
    Note: Passwords are NEVER stored in endpoint config.
    Use 'hac session start' to authenticate and create a session.
    """
    
    name: str
    """Environment name"""
    
    endpoints: Dict[str, Endpoint]
    """Map of endpoint name to endpoint config"""
    
    default_endpoint: Optional[str] = None
    """Default endpoint for this environment"""


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
        
        # Convert to TOML format manually
        lines = []
        
        # Write default environment
        if "default_environment" in config:
            lines.append(f'default_environment = "{config["default_environment"]}"')
            lines.append("")
        
        # Write environments with endpoints
        for env_name, env_data in config.get("environments", {}).items():
            if not isinstance(env_data, dict):
                continue
            
            lines.append(f"[environments.{env_name}]")
            
            # Write default endpoint if set
            if env_data.get("default_endpoint"):
                lines.append(f'default_endpoint = "{env_data["default_endpoint"]}"')
            
            lines.append("")
            
            # Write each endpoint
            for endpoint_name, endpoint_data in env_data.get("endpoints", {}).items():
                if not isinstance(endpoint_data, dict):
                    continue
                
                lines.append(f"[environments.{env_name}.endpoints.{endpoint_name}]")
                lines.append(f'url = "{endpoint_data["url"]}"')
                
                if endpoint_data.get("ignore_ssl", False):
                    lines.append('ignore_ssl = true')
                
                if endpoint_data.get("timeout", 30) != 30:
                    lines.append(f'timeout = {endpoint_data["timeout"]}')
                
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
            
            # Parse endpoints
            endpoints = {}
            for endpoint_name, endpoint_data in env_data.get("endpoints", {}).items():
                if not isinstance(endpoint_data, dict):
                    continue
                
                endpoints[endpoint_name] = Endpoint(
                    name=endpoint_name,
                    url=endpoint_data["url"],
                    ignore_ssl=endpoint_data.get("ignore_ssl", False),
                    timeout=endpoint_data.get("timeout", 30)
                )
            
            environments.append(Environment(
                name=env_name,
                endpoints=endpoints,
                default_endpoint=env_data.get("default_endpoint")
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
        set_default: bool = False
    ) -> None:
        """Add a new environment (empty, add endpoints separately).
        
        Args:
            name: Environment name
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
            "endpoints": {}
        }
        
        if set_default or not config.get("default_environment"):
            config["default_environment"] = name
        
        self._save_config(config)
    
    def set_default_endpoint(self, env_name: str, endpoint_name: str) -> None:
        """Set the default endpoint for an environment.
        
        Args:
            env_name: Environment name
            endpoint_name: Endpoint name to set as default
            
        Raises:
            ValueError: If environment or endpoint doesn't exist
        """
        config = self._load_config()
        
        if env_name not in config.get("environments", {}):
            raise ValueError(f"Environment '{env_name}' not found")
        
        env_config = config["environments"][env_name]
        
        if endpoint_name not in env_config.get("endpoints", {}):
            raise ValueError(f"Endpoint '{endpoint_name}' not found in environment '{env_name}'")
        
        env_config["default_endpoint"] = endpoint_name
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
    
    # Endpoint management methods
    
    def list_endpoints(self, env_name: str) -> List[Endpoint]:
        """List all endpoints in an environment.
        
        Args:
            env_name: Environment name
            
        Returns:
            List of Endpoint objects
            
        Raises:
            ValueError: If environment doesn't exist
        """
        env = self.get_environment(env_name)
        if not env:
            raise ValueError(f"Environment '{env_name}' not found")
        
        return sorted(env.endpoints.values(), key=lambda e: e.name)
    
    def get_endpoint(self, env_name: str, endpoint_name: str) -> Optional[Endpoint]:
        """Get a specific endpoint.
        
        Args:
            env_name: Environment name
            endpoint_name: Endpoint name
            
        Returns:
            Endpoint if found, None otherwise
        """
        env = self.get_environment(env_name)
        if not env:
            return None
        
        return env.endpoints.get(endpoint_name)
    
    def add_endpoint(
        self,
        env_name: str,
        endpoint_name: str,
        url: str,
        ignore_ssl: bool = False,
        timeout: int = 30,
        set_default: bool = False
    ) -> None:
        """Add a new endpoint to an environment.
        
        Args:
            env_name: Environment name
            endpoint_name: Endpoint name
            url: HAC base URL
            ignore_ssl: Ignore SSL errors
            timeout: HTTP timeout
            set_default: Set as default endpoint for this environment
            
        Raises:
            ValueError: If environment doesn't exist or endpoint already exists
        """
        config = self._load_config()
        
        if env_name not in config.get("environments", {}):
            raise ValueError(f"Environment '{env_name}' not found")
        
        env_config = config["environments"][env_name]
        
        if "endpoints" not in env_config:
            env_config["endpoints"] = {}
        
        if endpoint_name in env_config["endpoints"]:
            raise ValueError(f"Endpoint '{endpoint_name}' already exists in environment '{env_name}'")
        
        env_config["endpoints"][endpoint_name] = {
            "url": url,
            "ignore_ssl": ignore_ssl,
            "timeout": timeout
        }
        
        # Set as default if requested or if it's the first endpoint
        if set_default or not env_config.get("default_endpoint"):
            env_config["default_endpoint"] = endpoint_name
        
        self._save_config(config)
    
    def update_endpoint(
        self,
        env_name: str,
        endpoint_name: str,
        url: Optional[str] = None,
        ignore_ssl: Optional[bool] = None,
        timeout: Optional[int] = None
    ) -> None:
        """Update an existing endpoint.
        
        Args:
            env_name: Environment name
            endpoint_name: Endpoint name
            url: New URL (optional)
            ignore_ssl: New SSL setting (optional)
            timeout: New timeout (optional)
            
        Raises:
            ValueError: If environment or endpoint doesn't exist
        """
        config = self._load_config()
        
        if env_name not in config.get("environments", {}):
            raise ValueError(f"Environment '{env_name}' not found")
        
        env_config = config["environments"][env_name]
        
        if endpoint_name not in env_config.get("endpoints", {}):
            raise ValueError(f"Endpoint '{endpoint_name}' not found in environment '{env_name}'")
        
        endpoint_config = env_config["endpoints"][endpoint_name]
        
        if url is not None:
            endpoint_config["url"] = url
        if ignore_ssl is not None:
            endpoint_config["ignore_ssl"] = ignore_ssl
        if timeout is not None:
            endpoint_config["timeout"] = timeout
        
        self._save_config(config)
    
    def remove_endpoint(self, env_name: str, endpoint_name: str) -> None:
        """Remove an endpoint from an environment.
        
        Args:
            env_name: Environment name
            endpoint_name: Endpoint name
            
        Raises:
            ValueError: If environment doesn't exist, endpoint doesn't exist, or it's the last endpoint
        """
        config = self._load_config()
        
        if env_name not in config.get("environments", {}):
            raise ValueError(f"Environment '{env_name}' not found")
        
        env_config = config["environments"][env_name]
        
        if endpoint_name not in env_config.get("endpoints", {}):
            raise ValueError(f"Endpoint '{endpoint_name}' not found in environment '{env_name}'")
        
        if len(env_config["endpoints"]) == 1:
            raise ValueError(f"Cannot remove last endpoint from environment '{env_name}'")
        
        del env_config["endpoints"][endpoint_name]
        
        # Clear default if it was the default endpoint
        if env_config.get("default_endpoint") == endpoint_name:
            # Set first remaining endpoint as default
            env_config["default_endpoint"] = next(iter(env_config["endpoints"].keys()))
        
        self._save_config(config)

