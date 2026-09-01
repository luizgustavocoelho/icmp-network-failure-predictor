from app.services.network_classifier import NetworkStatus
from app.services.recommendation_service import (
    ActivitySuitability,
    ActivityType,
    generate_activity_recommendations,
)


def test_ok_network_recommends_all_activities():
    recommendations = generate_activity_recommendations(
        NetworkStatus.OK
    )

    assert len(recommendations) == 5

    assert all(
        recommendation.suitability
        == ActivitySuitability.RECOMMENDED
        for recommendation in recommendations
    )


def test_risk_network_generates_caution():
    recommendations = generate_activity_recommendations(
        NetworkStatus.RISK
    )

    recommendations_by_activity = {
        recommendation.activity: recommendation
        for recommendation in recommendations
    }

    assert (
        recommendations_by_activity[
            ActivityType.VIDEOCONFERENCE
        ].suitability
        == ActivitySuitability.CAUTION
    )

    assert (
        recommendations_by_activity[
            ActivityType.STREAMING
        ].suitability
        == ActivitySuitability.CAUTION
    )

    assert (
        recommendations_by_activity[
            ActivityType.ONLINE_GAMING
        ].suitability
        == ActivitySuitability.CAUTION
    )

    assert (
        recommendations_by_activity[
            ActivityType.WEB_BROWSING
        ].suitability
        == ActivitySuitability.RECOMMENDED
    )

    assert (
        recommendations_by_activity[
            ActivityType.FILE_UPLOAD
        ].suitability
        == ActivitySuitability.CAUTION
    )


def test_failure_network_recommends_no_activities():
    recommendations = generate_activity_recommendations(
        NetworkStatus.FAILURE
    )

    assert len(recommendations) == 5

    assert all(
        recommendation.suitability
        == ActivitySuitability.NOT_RECOMMENDED
        for recommendation in recommendations
    )


def test_all_supported_activities_are_returned():
    recommendations = generate_activity_recommendations(
        NetworkStatus.OK
    )

    activities = {
        recommendation.activity
        for recommendation in recommendations
    }

    assert activities == {
        ActivityType.VIDEOCONFERENCE,
        ActivityType.STREAMING,
        ActivityType.ONLINE_GAMING,
        ActivityType.WEB_BROWSING,
        ActivityType.FILE_UPLOAD,
    }


def test_all_recommendations_have_messages():
    for status in NetworkStatus:
        recommendations = (
            generate_activity_recommendations(
                status
            )
        )

        for recommendation in recommendations:
            assert recommendation.message
            assert recommendation.message.strip()