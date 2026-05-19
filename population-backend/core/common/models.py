from django.db import models
from django.utils.timezone import now

class Zone(models.Model):
    """Store areas (Counter, Seating, Pickup Zones, etc.)"""
    name = models.CharField(max_length=100, unique=True, choices=[
        ('counter', 'Counter'),
        ('seating', 'Seating Area'),
        ('pickup', 'Pickup Zone'),
        ('kitchen', 'Kitchen'),
        ('outdoor', 'Outdoor Terrace'),
    ], default='counter')
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.get_name_display()

class Household(models.Model):
    """Specific Dining Tables or Storage Locations within a Zone"""
    AREA_TYPES = [
        ('table', 'Dining Table'),
        ('bar', 'Bar Counter'),
        ('booth', 'Booth'),
        ('pickup', 'Pickup Area'),
        ('storage', 'Storage Area'),
    ]

    AREA_STATUS = [
        ('available', 'Available'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
        ('maintenance', 'Maintenance'),
    ]

    location_id = models.CharField(max_length=50, unique=True, help_text="Table number or Shelf ID", default="T00")
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name='households')
    area_type = models.CharField(max_length=20, choices=AREA_TYPES, default='table')
    section_label = models.CharField(max_length=100, blank=True, default='')
    status = models.CharField(max_length=20, choices=AREA_STATUS, default='available')
    is_active = models.BooleanField(default=True)
    is_reservable = models.BooleanField(default=True)
    priority = models.IntegerField(default=1)
    capacity = models.IntegerField(default=4, help_text="Number of seats if it's a table")
    notes = models.TextField(blank=True, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.zone.name if self.zone else 'Area'} - {self.location_id}"

class PopulationRecord(models.Model):
    """Model for individual demographic data"""
    
    GENDER_CHOICES = [
        ('Male', 'Male'), 
        ('Female', 'Female'), 
        ('Other', 'Other')
    ]
    
    CIVIL_STATUS_CHOICES = [
        ('Single', 'Single'),
        ('Married', 'Married'),
        ('Widowed', 'Widowed'),
        ('Divorced', 'Divorced'),
    ]
    
    EMPLOYMENT_CHOICES = [
        ('Employed', 'Employed'),
        ('Unemployed', 'Unemployed'),
        ('Student', 'Student'),
        ('Retired', 'Retired'),
    ]

    RECORD_STATUS = [
        ('Active', 'Active'),
        ('Archived', 'Archived'),
        ('Deactivated', 'Deactivated'),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True, null=True)
    birth_date = models.DateField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    civil_status = models.CharField(max_length=20, choices=CIVIL_STATUS_CHOICES)
    employment_status = models.CharField(max_length=20, choices=EMPLOYMENT_CHOICES)
    
    household = models.ForeignKey(
        Household, 
        on_delete=models.CASCADE, 
        related_name='members'
    )
    
    status = models.CharField(max_length=20, choices=RECORD_STATUS, default='Active')
    is_voter = models.BooleanField(default=False)
    # Manual update flag to override automated changes
    is_manually_updated = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def age(self):
        """Calculates age based on birth date"""
        today = now().date()
        return today.year - self.birth_date.year - (
            (today.month, today.day) < (self.birth_date.month, self.birth_date.day)
        )

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class ShopEvent(models.Model):
    """Records for Customer Arrival, Departure, and Orders"""
    EVENT_TYPES = [
        ('Arrival', 'Customer Arrival'),
        ('Departure', 'Customer Departure'),
        ('Order', 'Order Placed'),
        ('Waitlisted', 'Added to Waitlist'),
        ('Feedback', 'Guest Feedback Received'),
    ]
    
    person = models.ForeignKey(PopulationRecord, on_delete=models.CASCADE, related_name='shop_events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    event_date = models.DateField()
    description = models.TextField(blank=True, null=True, help_text="e.g. 'Standard Table', 'Loyalty App User'")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.person}"

    def save(self, *args, **kwargs):
        # Automated model updates based on event type
        if self.event_type == 'Departure':
            self.person.status = 'Archived'
            self.person.save()
        super().save(*args, **kwargs)

# --- Added Schedule Model ---

class OperationalSchedule(models.Model):
    SHIFT_STATUS = [
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed'),
        ('Aborted', 'Aborted'),
        ('Cancelled', 'Cancelled'),
    ]

    task_name = models.CharField(max_length=200)
    scheduled_time = models.CharField(max_length=100, help_text="e.g., 08:00 - 12:00")
    node_id = models.CharField(max_length=50, default="Node_01")
    status = models.CharField(max_length=20, choices=SHIFT_STATUS, default='Pending')
    priority = models.IntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.task_name} ({self.node_id})"

    class Meta:
        ordering = ['priority', 'created_at']

class SimulationSettings(models.Model):
    """Global configuration for coffee shop customer flow simulations"""
    customer_arrival_rate = models.FloatField(default=1.2, help_text="Average new customers per hour")
    order_demand_factor = models.FloatField(default=0.8, help_text="Likelihood of placing an order")
    customer_attrition_rate = models.FloatField(default=0.5, help_text="Rate at which customers leave the shop")
    
    # Advanced Rules
    weekday_multiplier = models.FloatField(default=1.0, help_text="Traffic boost for weekdays")
    weekend_multiplier = models.FloatField(default=1.5, help_text="Traffic boost for weekends")
    promo_event_multiplier = models.FloatField(default=2.0, help_text="Traffic boost during active promos")
    holiday_multiplier = models.FloatField(default=2.5, help_text="Traffic boost during holidays")
    
    # AI/ML Configuration
    prediction_model_enabled = models.BooleanField(default=True, help_text="Use AI for forecasting")
    model_last_trained = models.DateTimeField(null=True, blank=True)
    model_version = models.CharField(max_length=50, default="v1.0.0-base")
    
    last_run = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"Customer Flow Config - Arrival: {self.customer_arrival_rate}"

class HistoricalData(models.Model):
    """Storage for management and training of historical shop data"""
    DATA_TYPES = [
        ('Sales', 'Historical Sales'),
        ('Footfall', 'Customer Count'),
        ('Feedback', 'Guest Satisfaction'),
    ]
    name = models.CharField(max_length=255)
    data_type = models.CharField(max_length=20, choices=DATA_TYPES)
    file_path = models.FileField(upload_to='historical_data/', null=True, blank=True)
    record_count = models.IntegerField(default=0)
    is_used_for_training = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.data_type} Archive - {self.name}"

