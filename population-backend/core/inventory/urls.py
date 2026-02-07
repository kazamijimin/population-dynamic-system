from django.urls import path
from . import views

urlpatterns = [
    # Ingredient endpoints
    path('ingredients/', views.ingredient_list_create, name='ingredient-list-create'),
    path('ingredients/<int:pk>/', views.ingredient_detail, name='ingredient-detail'),
    path('ingredients/low-stock/', views.low_stock_ingredients, name='low-stock-ingredients'),
    
    # Item endpoints
    path('items/', views.item_list_create, name='item-list-create'),
    path('items/<int:pk>/', views.item_detail, name='item-detail'),
]