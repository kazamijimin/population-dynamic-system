from django.db import models

class Ingredient(models.Model):
    """Ingredient model for raw materials/ingredients"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    quantity = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit = models.CharField(max_length=20, choices=[
        ('kg', 'Kilograms'),
        ('g', 'Grams'),
        ('l', 'Liters'),
        ('ml', 'Milliliters'),
        ('pcs', 'Pieces'),
    ], default='pcs')
    min_stock_level = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cost_per_unit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"{self.name} ({self.quantity} {self.unit})"

    @property
    def is_low_stock(self):
        return self.quantity <= self.min_stock_level


class Item(models.Model):
    """Item model for finished products/menu items"""
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    category = models.CharField(max_length=50, choices=[
        ('beverage', 'Beverage'),
        ('food', 'Food'),
        ('dessert', 'Dessert'),
        ('other', 'Other'),
    ], default='beverage')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    is_available = models.BooleanField(default=True)
    ingredients = models.ManyToManyField(Ingredient, through='ItemIngredient', related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']

    def __str__(self):
        return self.name


class ItemIngredient(models.Model):
    """Through model for Item-Ingredient relationship with quantity"""
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    ingredient = models.ForeignKey(Ingredient, on_delete=models.CASCADE)
    quantity_required = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ['item', 'ingredient']

    def __str__(self):
        return f"{self.item.name} - {self.ingredient.name} ({self.quantity_required})"