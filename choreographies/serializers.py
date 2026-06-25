"""
Serializadores del catálogo de coreografías y sus videos embebidos.
"""
from rest_framework import serializers
from .models import Choreography, ChoreographyVideo


class ChoreographyVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChoreographyVideo
        fields = ['id', 'part_number', 'title', 'video_url', 'duration_seconds']


class ChoreographySerializer(serializers.ModelSerializer):
    videos = ChoreographyVideoSerializer(many=True, read_only=True)
    professor_name = serializers.ReadOnlyField()
    video_count = serializers.ReadOnlyField()

    class Meta:
        model = Choreography
        fields = [
            'id', 'title', 'song_name', 'genre', 'difficulty', 'description',
            'main_professor', 'guest_professor', 'guest_professor_external',
            'price', 'sales_count', 'status', 'thumbnail_emoji', 'rating',
            'professor_name', 'video_count', 'videos', 'created_at',
        ]
        read_only_fields = ['sales_count', 'created_at']


class ChoreographyCreateSerializer(serializers.ModelSerializer):
    """Crea/edita coreografía con array de videos; queda en estado pending."""

    videos = ChoreographyVideoSerializer(many=True, required=False)

    class Meta:
        model = Choreography
        fields = [
            'title', 'song_name', 'genre', 'difficulty', 'description',
            'guest_professor', 'guest_professor_external', 'price',
            'thumbnail_emoji', 'videos',
        ]

    def create(self, validated_data):
        videos_data = validated_data.pop('videos', [])
        user = self.context['request'].user
        choreography = Choreography.objects.create(
            main_professor=user,
            status=Choreography.Status.PENDING,
            **validated_data,
        )
        for v in videos_data:
            ChoreographyVideo.objects.create(choreography=choreography, **v)
        return choreography

    def update(self, instance, validated_data):
        videos_data = validated_data.pop('videos', None)
        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()
        if videos_data is not None:
            instance.videos.all().delete()
            for v in videos_data:
                ChoreographyVideo.objects.create(choreography=instance, **v)
        return instance
