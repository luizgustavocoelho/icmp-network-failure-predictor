from datetime import datetime
from ipaddress import IPv4Address, IPv6Address

from pydantic import BaseModel, ConfigDict, Field


class HostCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    ip_address: IPv4Address | IPv6Address

    description: str | None = Field(
        default=None,
        max_length=255,
    )


class HostUpdate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=100,
    )

    ip_address: IPv4Address | IPv6Address

    description: str | None = Field(
        default=None,
        max_length=255,
    )

    is_active: bool


class HostResponse(BaseModel):
    id: int
    name: str
    ip_address: IPv4Address | IPv6Address
    description: str | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )