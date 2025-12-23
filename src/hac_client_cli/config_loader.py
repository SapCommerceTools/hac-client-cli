"""Configuration loader for HAC client CLI."""

from pathlib import Path
import os
import tomllib
from dataclasses import dataclass
from typing import Optional, Dict


@dataclass(frozen=True)
class EnvironmentConfig:
    """Configuration for a HAC environment."""
    url: str
    username: str
    password: Optional[str] = None
    ignore_ssl: bool = False
    timeout: int = 30


@dataclass(frozen=True)
class HacClientConfig:
    """HAC client configuration."""
    default_environment: str
    environments: Dict[str, EnvironmentConfig]


def get_config_path() -> Path:
    """Get the path to the HAC client config file.
    
    Checks the following locations in order:
    1. HAC_CLIENT_CONFIG_PATH environment variable
    2. XDG_CONFIG_HOME/hac-client/config.toml
    3. ~/.config/hac-client/config.toml (default)
    """
    env_path = os.environ.get("HAC_CLIENT_CONFIG_PATH")
    if env_path:
        return Path(env_path).expanduser()
    
    xdg_config = os.environ.get("XDG_CONFIG_HOME")
    if xdg_config:
        config_home = Path(xdg_config)
    else:
        config_home = Path.home() / ".config"
    return config_home / "hac-client" / "config.toml"


def load_config() -> HacClientConfig:
    """Load HAC client configuration from config file."""
    config_path = get_config_path()
    
    if not config_path.exists():
        # Return minimal default config
        return HacClientConfig(
            default_environment="local",
            environments={
                "local": EnvironmentConfig(
                    url="https://localhost:9002",
                    username="admin",
                    password=None,
                    ignore_ssl=True
                )
            }
        )
    
    with config_path.open("rb") as f:
        config_data = tomllib.load(f)
    
    # Parse environments
    environments = {}
    for env_name, env_data in config_data.get("environments", {}).items():
        # Skip if not a dict (e.g., if it's just "default = local")
        if not isinstance(env_data, dict):
            continue
        
        # Validate required fields
        if "url" not in env_data:
            raise ValueError(f"Environment '{env_name}' missing required field 'url'")
        if "username" not in env_data:
            raise ValueError(f"Environment '{env_name}' missing required field 'username'")
        
        # Password can come from config or environment variable
        password = env_data.get("password")
        if not password:
            # Try HAC_PASSWORD env var, or HAC_PASSWORD_<ENV> for specific env
            env_var_name = f"HAC_PASSWORD_{env_name.upper()}"
            password = os.environ.get(env_var_name) or os.environ.get("HAC_PASSWORD")
        
        environments[env_name] = EnvironmentConfig(
            url=env_data["url"],
            username=env_data["username"],
            password=password,
            ignore_ssl=env_data.get("ignore_ssl", False),
            timeout=env_data.get("timeout", 30)
        )
    
    return HacClientConfig(
        default_environment=config_data.get("default_environment", "local"),
        environments=environments
    )


def get_environment_config(environment: Optional[str] = None) -> EnvironmentConfig:
    """Get configuration for a specific environment.
    
    Args:
        environment: Environment name (uses default if None)
        
    Returns:
        EnvironmentConfig for the specified environment
        
    Raises:
        KeyError: If environment not found in config
    """
    config = load_config()
    
    env_name = environment or config.default_environment
    
    if env_name not in config.environments:
        raise KeyError(f"Environment '{env_name}' not found in configuration")
    
    return config.environments[env_name]

