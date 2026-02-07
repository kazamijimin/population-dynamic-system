from rest_framework import serializers
from .models import Item, Ingredient, ItemIngredient


class IngredientSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.ReadOnlyField()

    class Meta:
        model = Ingredient
        fields = [
            'id', 'name', 'description', 'quantity', 'unit',
            'min_stock_level', 'cost_per_unit', 'is_low_stock',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ItemIngredientSerializer(serializers.ModelSerializer):
    ingredient_name = serializers.CharField(source='ingredient.name', read_only=True)
    ingredient_unit = serializers.CharField(source='ingredient.unit', read_only=True)

    class Meta:
        model = ItemIngredient
        fields = ['id', 'ingredient', 'ingredient_name', 'ingredient_unit', 'quantity_required']


class ItemSerializer(serializers.ModelSerializer):
    item_ingredients = ItemIngredientSerializer(source='itemingredient_set', many=True, read_only=True)

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'category', 'price',
            'is_available', 'item_ingredients', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class ItemCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating items with ingredients"""
    ingredients_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Item
        fields = [
            'id', 'name', 'description', 'category', 'price',
            'is_available', 'ingredients_data'
        ]

    def create(self, validated_data):
        ingredients_data = validated_data.pop('ingredients_data', [])
        item = Item.objects.create(**validated_data)
        
        for ing_data in ingredients_data:
            ItemIngredient.objects.create(
                item=item,
                ingredient_id=ing_data['ingredient_id'],
                quantity_required=ing_data['quantity_required']
            )
        return item

    def update(self, instance, validated_data):
        ingredients_data = validated_data.pop('ingredients_data', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if ingredients_data is not None:
            instance.itemingredient_set.all().delete()
            for ing_data in ingredients_data:
                ItemIngredient.objects.create(
                    item=instance,
                    ingredient_id=ing_data['ingredient_id'],
                    quantity_required=ing_data['quantity_required']
                )
        return instance