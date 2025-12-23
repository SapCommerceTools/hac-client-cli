"""Configuration loader for HAC client CLI."""

from pathlib import Path
import os
import tomllib
from dataclasses import dataclass
from typing import Optional, Dict


@dataclass(frozen=True)
class EndpointConfig:
    """Configuration for a HAC endpoint (single instance/node).
    
    Note: Username is NOT part of endpoint config - it's part of authentication/session.
    Different users can connect to the same endpoint with different credentials.
    """
    url: str
    ignore_ssl: bool = False
    timeout: int = 30


@dataclass(frozen=True)
class EnvironmentConfig:
    """Configuration for a HAC environment (collection of endpoints)."""
    name: str
    endpoints: Dict[str, EndpointConfig]
    default_endpoint: Optional[str] = None


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
        # Return minimal default config with single endpoint
        return HacClientConfig(
            default_environment="local",
            environments={
                "local": EnvironmentConfig(
                    name="local",
                    endpoints={
                        "hac": EndpointConfig(
                            url="https://localhost:9002",
                            username="admin",
                            ignore_ssl=True
                        )
                    },
                    default_endpoint="hac"
                )
            }
        )
    
    with config_path.open("rb") as f:
        config_data = tomllib.load(f)
    
    # Parse environments
    environments = {}
    for env_name, env_data in config_data.get("environments", {}).items():
        # Skip if not a dict
        if not isinstance(env_data, dict):
            continue
        
        # Parse endpoints for this environment
        endpoints = {}
        endpoints_data = env_data.get("endpoints", {})
        
        if not endpoints_data:
            raise ValueError(f"Environment '{env_name}' has no endpoints defined")
        
        for endpoint_name, endpoint_data in endpoints_data.items():
            if not isinstance(endpoint_data, dict):
                continue
            
            # Validate required fields
            if "url" not in endpoint_data:
                raise ValueError(f"Endpoint '{env_name}/{endpoint_name}' missing required field 'url'")
            
            endpoints[endpoint_name] = EndpointConfig(
                url=endpoint_data["url"],
                ignore_ssl=endpoint_data.get("ignore_ssl", False),
                timeout=endpoint_data.get("timeout", 30)
            )
        
        environments[env_name] = EnvironmentConfig(
            name=env_name,
            endpoints=endpoints,
            default_endpoint=env_data.get("default_endpoint")
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


def get_endpoint_config(
    environment: Optional[str] = None,
    endpoint: Optional[str] = None
) -> tuple[str, str, EndpointConfig]:
    """Get configuration for a specific endpoint.
    
    Args:
        environment: Environment name (uses default if None)
        endpoint: Endpoint name (uses environment default if None)
        
    Returns:
        Tuple of (environment_name, endpoint_name, EndpointConfig)
        
    Raises:
        KeyError: If environment or endpoint not found
        ValueError: If no default endpoint and none specified
    """
    env_config = get_environment_config(environment)
    config = load_config()
    env_name = environment or config.default_environment
    
    # Determine endpoint name
    endpoint_name = endpoint or env_config.default_endpoint
    if not endpoint_name:
        # If no default and only one endpoint, use it
        if len(env_config.endpoints) == 1:
            endpoint_name = next(iter(env_config.endpoints.keys()))
        else:
            raise ValueError(
                f"Environment '{env_name}' has multiple endpoints but no default set. "
                f"Please specify --endpoint or set default_endpoint in config."
            )
    
    if endpoint_name not in env_config.endpoints:
        available = ", ".join(env_config.endpoints.keys())
        raise KeyError(
            f"Endpoint '{endpoint_name}' not found in environment '{env_name}'. "
            f"Available endpoints: {available}"
        )
    
    return env_name, endpoint_name, env_config.endpoints[endpoint_name]

