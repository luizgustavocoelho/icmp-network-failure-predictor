from dataclasses import dataclass
from enum import StrEnum

from app.services.network_classifier import NetworkStatus


class ActivityType(StrEnum):
    VIDEOCONFERENCE = "videoconference"
    STREAMING = "streaming"
    ONLINE_GAMING = "online_gaming"
    WEB_BROWSING = "web_browsing"
    FILE_UPLOAD = "file_upload"


class ActivitySuitability(StrEnum):
    RECOMMENDED = "recommended"
    CAUTION = "caution"
    NOT_RECOMMENDED = "not_recommended"


@dataclass(frozen=True)
class ActivityRecommendation:
    activity: ActivityType
    suitability: ActivitySuitability
    message: str


def generate_activity_recommendations(
    network_status: NetworkStatus,
) -> list[ActivityRecommendation]:
    if network_status == NetworkStatus.OK:
        return [
            ActivityRecommendation(
                activity=ActivityType.VIDEOCONFERENCE,
                suitability=ActivitySuitability.RECOMMENDED,
                message=(
                    "The connection is suitable for "
                    "video conferences."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.STREAMING,
                suitability=ActivitySuitability.RECOMMENDED,
                message=(
                    "The connection is suitable for streaming."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.ONLINE_GAMING,
                suitability=ActivitySuitability.RECOMMENDED,
                message=(
                    "The connection is suitable for "
                    "online gaming."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.WEB_BROWSING,
                suitability=ActivitySuitability.RECOMMENDED,
                message=(
                    "The connection is suitable for "
                    "web browsing."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.FILE_UPLOAD,
                suitability=ActivitySuitability.RECOMMENDED,
                message=(
                    "The connection is suitable for "
                    "file uploads."
                ),
            ),
        ]

    if network_status == NetworkStatus.RISK:
        return [
            ActivityRecommendation(
                activity=ActivityType.VIDEOCONFERENCE,
                suitability=ActivitySuitability.CAUTION,
                message=(
                    "Video conferences may experience "
                    "interruptions or reduced quality."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.STREAMING,
                suitability=ActivitySuitability.CAUTION,
                message=(
                    "Streaming may experience buffering "
                    "or reduced quality."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.ONLINE_GAMING,
                suitability=ActivitySuitability.CAUTION,
                message=(
                    "Online gaming may experience delays "
                    "or instability."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.WEB_BROWSING,
                suitability=ActivitySuitability.RECOMMENDED,
                message=(
                    "Basic web browsing should remain usable."
                ),
            ),
            ActivityRecommendation(
                activity=ActivityType.FILE_UPLOAD,
                suitability=ActivitySuitability.CAUTION,
                message=(
                    "File uploads may take longer or "
                    "require retrying."
                ),
            ),
        ]

    return [
        ActivityRecommendation(
            activity=ActivityType.VIDEOCONFERENCE,
            suitability=ActivitySuitability.NOT_RECOMMENDED,
            message=(
                "Video conferences are not recommended "
                "while the connection is unavailable."
            ),
        ),
        ActivityRecommendation(
            activity=ActivityType.STREAMING,
            suitability=ActivitySuitability.NOT_RECOMMENDED,
            message=(
                "Streaming is not recommended while "
                "the connection is unavailable."
            ),
        ),
        ActivityRecommendation(
            activity=ActivityType.ONLINE_GAMING,
            suitability=ActivitySuitability.NOT_RECOMMENDED,
            message=(
                "Online gaming is not recommended while "
                "the connection is unavailable."
            ),
        ),
        ActivityRecommendation(
            activity=ActivityType.WEB_BROWSING,
            suitability=ActivitySuitability.NOT_RECOMMENDED,
            message=(
                "Web browsing is not recommended while "
                "the connection is unavailable."
            ),
        ),
        ActivityRecommendation(
            activity=ActivityType.FILE_UPLOAD,
            suitability=ActivitySuitability.NOT_RECOMMENDED,
            message=(
                "File uploads are not recommended while "
                "the connection is unavailable."
            ),
        ),
    ]