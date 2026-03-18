from rest_framework.exceptions import PermissionDenied, ValidationError

from social.models import Community, CommunityMember


def create_community_with_creator(creator, validated_data: dict) -> Community:
    community = Community.objects.create(creator=creator, **validated_data)
    CommunityMember.objects.create(
        community=community,
        user=creator,
        role=CommunityMember.Role.ADMIN,
    )
    return community


def update_community(community: Community, validated_data: dict, user) -> Community:
    membership = community.memberships.filter(
        user=user,
        role__in=[CommunityMember.Role.ADMIN, CommunityMember.Role.MODERATOR],
    ).first()
    if membership is None:
        raise PermissionDenied(
            "Only community admins or moderators can update the community."
        )

    for field, value in validated_data.items():
        setattr(community, field, value)

    community.save()
    return community


def join_community(community: Community, user) -> CommunityMember:
    if not community.is_active:
        raise ValidationError({"detail": "You cannot join an inactive community."})

    if community.is_private:
        raise PermissionDenied("Private communities require an invitation flow.")

    membership, created = CommunityMember.objects.get_or_create(
        community=community,
        user=user,
        defaults={"role": CommunityMember.Role.MEMBER},
    )
    if not created:
        raise ValidationError({"detail": "You are already a member of this community."})

    return membership


def leave_community(community: Community, user) -> None:
    membership = community.memberships.filter(user=user).first()
    if membership is None:
        raise ValidationError({"detail": "You are not a member of this community."})

    is_only_admin = (
        membership.role == CommunityMember.Role.ADMIN
        and community.memberships.filter(role=CommunityMember.Role.ADMIN).count() == 1
    )
    if is_only_admin and community.memberships.count() > 1:
        raise ValidationError(
            {
                "detail": "Assign another admin before the last admin leaves the community."
            }
        )

    if community.creator_id == user.id and community.memberships.count() == 1:
        community.is_active = False
        community.save(update_fields=["is_active", "updated_at"])

    membership.delete()
