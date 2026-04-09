from django.db import models
from django.utils.timezone import now

class Zone(models.Model):
    """Geographic areas or zones (Barangay, District, etc.)"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Household(models.Model):
    """Model to group individuals under a single home/address"""
    house_number = models.CharField(max_length=50, unique=True)
    address = models.TextField()
    contact_number = models.CharField(max_length=20, blank=True, null=True)
    zone = models.ForeignKey(Zone, on_delete=models.SET_NULL, null=True, blank=True, related_name='households')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"House {self.house_number}"

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

class LifeEvent(models.Model):
    """Records for Migration, Birth, and Death events"""
    EVENT_TYPES = [
        ('Birth', 'Birth'),
        ('Death', 'Death'),
        ('In-Migration', 'In-Migration'),
        ('Out-Migration', 'Out-Migration'),
    ]
    
    person = models.ForeignKey(PopulationRecord, on_delete=models.CASCADE, related_name='life_events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    event_date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.event_type} - {self.person}"
