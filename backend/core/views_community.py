"""Views for the community module (HU-CORE-13)."""

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from core.models.community import (
    Community,
    CommunityInvitation,
    CommunityMembership,
    CommunityPost,
)
from core.serializers_community import (
    CommunityCreateSerializer,
    CommunityDetailSerializer,
    CommunityInvitationSerializer,
    CommunityListSerializer,
    CommunityPostCreateSerializer,
    CommunityPostSerializer,
    MembershipSerializer,
)


# ── Community CRUD ───────────────────────────────────────


class CommunityListCreateView(APIView):
    """GET: list my communities. POST: create a new community."""

    permission_classes = [IsAuthenticated]

    def get(self, request):
        communities = Community.objects.filter(
            memberships__user=request.user
        ).distinct()
        serializer = CommunityListSerializer(communities, many=True)
        return Response({"count": len(serializer.data), "results": serializer.data})

    def post(self, request):
        serializer = CommunityCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        community = serializer.save(created_by=request.user)

        CommunityMembership.objects.create(
            community=community, user=request.user, role="admin"
        )

        return Response(
            CommunityDetailSerializer(community, context={"request": request}).data,
            status=status.HTTP_201_CREATED,
        )


class CommunityDetailView(APIView):
    """GET: detail. PATCH: edit (admin). DELETE: delete (admin)."""

    permission_classes = [IsAuthenticated]

    def get_community(self, pk):
        try:
            return Community.objects.get(pk=pk)
        except Community.DoesNotExist:
            return None

    def get_membership(self, community, user):
        return CommunityMembership.objects.filter(
            community=community, user=user
        ).first()

    def get(self, request, pk):
        community = self.get_community(pk)
        if not community:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Comunidad no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = CommunityDetailSerializer(community, context={"request": request})
        return Response(serializer.data)

    def patch(self, request, pk):
        community = self.get_community(pk)
        if not community:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Comunidad no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        membership = self.get_membership(community, request.user)
        if not membership or membership.role != "admin":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Solo administradores pueden editar."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CommunityCreateSerializer(community, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(
            CommunityDetailSerializer(community, context={"request": request}).data
        )

    def delete(self, request, pk):
        community = self.get_community(pk)
        if not community:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Comunidad no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        membership = self.get_membership(community, request.user)
        if not membership or membership.role != "admin":
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Solo administradores pueden eliminar."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        community.delete()
        return Response({"message": "Comunidad eliminada."}, status=status.HTTP_200_OK)


# ── Members ──────────────────────────────────────────────


class CommunityMembersView(generics.ListAPIView):
    """GET: list members of a community."""

    serializer_class = MembershipSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CommunityMembership.objects.filter(
            community_id=self.kwargs["pk"]
        ).select_related("user")


class CommunityInviteView(APIView):
    """POST: invite a user to the community (admin only)."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        try:
            community = Community.objects.get(pk=pk)
        except Community.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Comunidad no encontrada."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        membership = CommunityMembership.objects.filter(
            community=community, user=request.user, role="admin"
        ).first()
        if not membership:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Solo administradores pueden invitar."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        user_id = request.data.get("user_id")
        if not user_id:
            return Response(
                {"error": {"code": "MISSING_FIELD", "message": "user_id es requerido."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CommunityMembership.objects.filter(community=community, user_id=user_id).exists():
            return Response(
                {"error": {"code": "ALREADY_MEMBER", "message": "El usuario ya es miembro."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if CommunityInvitation.objects.filter(
            community=community, invited_user_id=user_id, status="pending"
        ).exists():
            return Response(
                {"error": {"code": "ALREADY_INVITED", "message": "Ya existe una invitacion pendiente."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        invitation = CommunityInvitation.objects.create(
            community=community,
            invited_by=request.user,
            invited_user_id=user_id,
        )

        return Response(
            CommunityInvitationSerializer(invitation).data,
            status=status.HTTP_201_CREATED,
        )


class CommunityJoinView(APIView):
    """POST: accept invitation and join community."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        invitation = CommunityInvitation.objects.filter(
            community_id=pk, invited_user=request.user, status="pending"
        ).first()

        if not invitation:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "No tienes invitacion pendiente."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        invitation.status = "accepted"
        invitation.save(update_fields=["status"])

        CommunityMembership.objects.get_or_create(
            community_id=pk, user=request.user, defaults={"role": "member"}
        )

        return Response({"message": "Te uniste a la comunidad."}, status=status.HTTP_200_OK)


class CommunityLeaveView(APIView):
    """POST: leave a community."""

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        membership = CommunityMembership.objects.filter(
            community_id=pk, user=request.user
        ).first()

        if not membership:
            return Response(
                {"error": {"code": "NOT_MEMBER", "message": "No eres miembro."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if membership.role == "admin":
            admin_count = CommunityMembership.objects.filter(
                community_id=pk, role="admin"
            ).count()
            if admin_count <= 1:
                return Response(
                    {"error": {"code": "LAST_ADMIN", "message": "No puedes salir siendo el unico admin. Transfiere el rol primero."}},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        membership.delete()
        return Response({"message": "Saliste de la comunidad."}, status=status.HTTP_200_OK)


class CommunityExpelView(APIView):
    """DELETE: expel a member (admin only)."""

    permission_classes = [IsAuthenticated]

    def delete(self, request, pk, user_id):
        admin_membership = CommunityMembership.objects.filter(
            community_id=pk, user=request.user, role="admin"
        ).first()

        if not admin_membership:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Solo administradores pueden expulsar."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        if user_id == request.user.id:
            return Response(
                {"error": {"code": "SELF_EXPEL", "message": "No puedes expulsarte a ti mismo."}},
                status=status.HTTP_400_BAD_REQUEST,
            )

        target = CommunityMembership.objects.filter(
            community_id=pk, user_id=user_id
        ).first()

        if not target:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Miembro no encontrado."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        target.delete()
        return Response({"message": "Miembro expulsado."}, status=status.HTTP_200_OK)


# ── Posts ────────────────────────────────────────────────


class CommunityPostsView(APIView):
    """GET: list posts. POST: create post (members only)."""

    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        posts = CommunityPost.objects.filter(
            community_id=pk
        ).select_related("author").order_by("-created_at")

        serializer = CommunityPostSerializer(posts, many=True)
        return Response({"count": len(serializer.data), "results": serializer.data})

    def post(self, request, pk):
        membership = CommunityMembership.objects.filter(
            community_id=pk, user=request.user
        ).first()

        if not membership:
            return Response(
                {"error": {"code": "NOT_MEMBER", "message": "Debes ser miembro para publicar."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CommunityPostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        post = CommunityPost.objects.create(
            community_id=pk,
            author=request.user,
            content=serializer.validated_data["content"],
        )

        return Response(
            CommunityPostSerializer(post).data,
            status=status.HTTP_201_CREATED,
        )


class CommunityPostDetailView(APIView):
    """PATCH: edit post. DELETE: delete post."""

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk, post_id):
        try:
            post = CommunityPost.objects.get(pk=post_id, community_id=pk)
        except CommunityPost.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Post no encontrado."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        if post.author_id != request.user.id:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "Solo puedes editar tus propios posts."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        serializer = CommunityPostCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        post.content = serializer.validated_data["content"]
        post.save(update_fields=["content", "updated_at"])

        return Response(CommunityPostSerializer(post).data)

    def delete(self, request, pk, post_id):
        try:
            post = CommunityPost.objects.get(pk=post_id, community_id=pk)
        except CommunityPost.DoesNotExist:
            return Response(
                {"error": {"code": "NOT_FOUND", "message": "Post no encontrado."}},
                status=status.HTTP_404_NOT_FOUND,
            )

        is_author = post.author_id == request.user.id
        is_admin = CommunityMembership.objects.filter(
            community_id=pk, user=request.user, role="admin"
        ).exists()

        if not is_author and not is_admin:
            return Response(
                {"error": {"code": "FORBIDDEN", "message": "No tienes permiso para eliminar este post."}},
                status=status.HTTP_403_FORBIDDEN,
            )

        post.delete()
        return Response({"message": "Post eliminado."}, status=status.HTTP_200_OK)


# ── My Invitations ───────────────────────────────────────


class MyInvitationsView(generics.ListAPIView):
    """GET: list pending community invitations for the current user."""

    serializer_class = CommunityInvitationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return CommunityInvitation.objects.filter(
            invited_user=self.request.user, status="pending"
        ).select_related("community", "invited_by", "invited_user")
