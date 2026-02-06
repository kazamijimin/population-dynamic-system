from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Item, Ingredient
from .serializers import (
    ItemSerializer, 
    ItemCreateUpdateSerializer,
    IngredientSerializer
)

@api_view(['GET', 'POST'])
def ingredient_list_create(request):
    """List all ingredients or create a new ingredient"""
    if request.method == 'GET':
        ingredients = Ingredient.objects.all()
        serializer = IngredientSerializer(ingredients, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = IngredientSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def ingredient_detail(request, pk):
    """Retrieve, update, or delete an ingredient"""
    try:
        ingredient = Ingredient.objects.get(pk=pk)
    except Ingredient.DoesNotExist:
        return Response({'error': 'Ingredient not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = IngredientSerializer(ingredient)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = IngredientSerializer(ingredient, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        ingredient.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============ ITEM VIEWS ============

@api_view(['GET', 'POST'])
def item_list_create(request):
    """List all items or create a new item"""
    if request.method == 'GET':
        items = Item.objects.all()
        serializer = ItemSerializer(items, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = ItemCreateUpdateSerializer(data=request.data)
        if serializer.is_valid():
            item = serializer.save()
            return Response(ItemSerializer(item).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT', 'DELETE'])
def item_detail(request, pk):
    """Retrieve, update, or delete an item"""
    try:
        item = Item.objects.get(pk=pk)
    except Item.DoesNotExist:
        return Response({'error': 'Item not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ItemSerializer(item)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = ItemCreateUpdateSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            item = serializer.save()
            return Response(ItemSerializer(item).data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == 'DELETE':
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ============ UTILITY VIEWS ============

@api_view(['GET'])
def low_stock_ingredients(request):
    """Get all ingredients that are at or below minimum stock level"""
    ingredients = Ingredient.objects.all()
    low_stock = [ing for ing in ingredients if ing.is_low_stock]
    serializer = IngredientSerializer(low_stock, many=True)
    return Response(serializer.data)