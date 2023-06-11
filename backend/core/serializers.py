from rest_framework import serializers
from djoser.serializers import UserSerializer as BaseUserSerializer, UserCreateSerializer as BaseUserCreateSerializer

from core.models import User


class UserCreateSerializer(BaseUserCreateSerializer):
    middle_name = serializers.CharField(required=False)

    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['id', 'username', 'password', 'email', 'first_name', 'middle_name', 'last_name']


class UserSerializer(BaseUserSerializer):
    class Meta(BaseUserSerializer.Meta):
        fields = ['id', 'username', 'email', 'role', 'first_name', 'middle_name', 'last_name']


class CodeVerifySerializer(serializers.Serializer):
    model = User
    otp_code = serializers.CharField(max_length=6)


class ChangePasswordSerializer(serializers.Serializer):
    model = User

    current_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, required=True)
    confirm_password = serializers.CharField(write_only=True, required=True)

    def validate(self, attrs):
        user = self.context['request'].user
        if user.check_password(attrs['new_password']):
            raise serializers.ValidationError('You are not allowed to re-use your old password. Enter a new password.')

        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError('Passwords entered do not match. Re-enter again.')
        return attrs


class CurrentUserSerializer(serializers.ModelSerializer):

    class Meta(BaseUserCreateSerializer.Meta):
        fields = ['id', 'username', 'email', 'first_name', 'middle_name', 'last_name', 'role', 'is_verified',
                  'is_password_changed']
